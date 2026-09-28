#!/usr/bin/env python3
"""Mirror selected, revision-pinned Hugging Face ONNX assets into Aliyun OSS.

The synchronizer downloads only the file allowlist in models.json. It validates
each download against the Git blob OID or LFS payload SHA-256 from the
Hugging Face tree API before publishing it. OSS credentials are read by ossutil from the existing host
configuration and are never placed in this script, manifest, or logs.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DEFAULT_OSS_BUCKET = "oss://lain42-downloads"
DEFAULT_STATE = Path("/opt/lain42-model-sync/state.json")
REVISION_RE = re.compile(r"^[0-9a-f]{40}$")
OID_RE = re.compile(r"^[0-9a-f]{40}$")
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
MAX_MANIFEST_BYTES = 64 * 1024
USER_AGENT = "lain42-hf-model-sync/1.0"
CURL_CHUNK_BYTES = 1024 * 1024
CURL_MAX_PARALLEL = 8


class SyncError(RuntimeError):
    """Raised when upstream data or a downloaded asset fails validation."""


def read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as stream:
        data = json.load(stream)
    if not isinstance(data, dict):
        raise SyncError(f"Expected JSON object in {path}")
    return data


def request_json(url: str) -> Any:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            if response.status != 200:
                raise SyncError(f"Metadata request returned HTTP {response.status}: {url}")
            raw = response.read(MAX_MANIFEST_BYTES + 1)
    except (urllib.error.URLError, TimeoutError) as error:
        raise SyncError(f"Could not read Hugging Face metadata: {error}") from error
    if len(raw) > MAX_MANIFEST_BYTES:
        raise SyncError("Hugging Face metadata response exceeded the configured limit")
    try:
        return json.loads(raw)
    except json.JSONDecodeError as error:
        raise SyncError(f"Hugging Face returned invalid JSON: {error}") from error


def git_blob_oid(path: Path) -> str:
    size = path.stat().st_size
    digest = hashlib.sha1()
    digest.update(f"blob {size}\0".encode("ascii"))
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def content_checksum(path: Path, entry: dict[str, Any]) -> tuple[str, str]:
    lfs = entry.get("lfs")
    if lfs is not None:
        expected = lfs.get("oid") if isinstance(lfs, dict) else None
        if not isinstance(expected, str) or not SHA256_RE.fullmatch(expected):
            raise SyncError(f"Invalid Hugging Face LFS SHA-256 for {entry.get('path')}")
        if lfs.get("size") != entry.get("size"):
            raise SyncError(f"Hugging Face LFS size mismatch for {entry.get('path')}")
        return "sha256", sha256_file(path)
    expected = entry.get("oid")
    if not isinstance(expected, str) or not OID_RE.fullmatch(expected):
        raise SyncError(f"Invalid Hugging Face Git blob OID for {entry.get('path')}")
    return "git-blob-sha1", git_blob_oid(path)


def byte_ranges(size: int, chunk_size: int = CURL_CHUNK_BYTES) -> list[tuple[int, int]]:
    if size <= 0 or chunk_size <= 0:
        raise ValueError("size and chunk_size must be positive")
    return [(start, min(size - 1, start + chunk_size - 1)) for start in range(0, size, chunk_size)]


def supports_parallel_ranges(entry: dict[str, Any]) -> bool:
    lfs = entry.get("lfs")
    return isinstance(lfs, dict) and isinstance(entry.get("size"), int) and entry["size"] > CURL_CHUNK_BYTES


def validate_manifest(manifest: dict[str, Any]) -> None:
    if manifest.get("schemaVersion") != 1:
        raise SyncError("Unsupported models.json schemaVersion")
    if not re.fullmatch(r"https://[A-Za-z0-9.-]+", str(manifest.get("transport", ""))):
        raise SyncError("transport must be a fixed HTTPS host")
    prefix = manifest.get("bucketPrefix")
    if not isinstance(prefix, str) or not re.fullmatch(r"[A-Za-z0-9._/-]+", prefix):
        raise SyncError("bucketPrefix contains unsupported characters")
    models = manifest.get("models")
    if not isinstance(models, list) or not models:
        raise SyncError("models.json must contain at least one model")
    seen: set[str] = set()
    for model in models:
        if not isinstance(model, dict):
            raise SyncError("Each model entry must be an object")
        model_id = model.get("id")
        if not isinstance(model_id, str) or not re.fullmatch(r"[A-Za-z0-9._-]+/[A-Za-z0-9._-]+", model_id):
            raise SyncError(f"Invalid model id: {model_id!r}")
        if model_id in seen:
            raise SyncError(f"Duplicate model id: {model_id}")
        seen.add(model_id)
        revision = model.get("bootstrapRevision")
        if not isinstance(revision, str) or not REVISION_RE.fullmatch(revision):
            raise SyncError(f"Invalid bootstrap revision for {model_id}")
        files = model.get("files")
        if not isinstance(files, list) or not files:
            raise SyncError(f"No allowlisted files for {model_id}")
        file_names: set[str] = set()
        for entry in files:
            if not isinstance(entry, dict):
                raise SyncError(f"Invalid file entry for {model_id}")
            name = entry.get("path")
            max_bytes = entry.get("maxBytes")
            if not isinstance(name, str) or not re.fullmatch(r"[A-Za-z0-9._/-]+", name) or ".." in name.split("/"):
                raise SyncError(f"Unsafe path in {model_id}: {name!r}")
            if name in file_names:
                raise SyncError(f"Duplicate file path in {model_id}: {name}")
            if not isinstance(max_bytes, int) or max_bytes <= 0:
                raise SyncError(f"Invalid maxBytes for {model_id}/{name}")
            file_names.add(name)


def current_revision(endpoint: str, model_id: str, bootstrap: str, previous: str | None) -> str:
    if previous is None:
        return bootstrap
    repo_path = urllib.parse.quote(model_id, safe="/")
    metadata = request_json(f"{endpoint}/api/models/{repo_path}")
    revision = metadata.get("sha") if isinstance(metadata, dict) else None
    if not isinstance(revision, str) or not REVISION_RE.fullmatch(revision):
        raise SyncError(f"Invalid latest revision returned for {model_id}")
    return revision


def file_tree(endpoint: str, model_id: str, revision: str) -> dict[str, dict[str, Any]]:
    repo_path = urllib.parse.quote(model_id, safe="/")
    url = f"{endpoint}/api/models/{repo_path}/tree/{revision}?recursive=true"
    entries = request_json(url)
    if not isinstance(entries, list):
        raise SyncError(f"Unexpected tree response for {model_id}")
    return {
        entry.get("path"): entry
        for entry in entries
        if isinstance(entry, dict) and isinstance(entry.get("path"), str)
    }


def file_url(endpoint: str, model_id: str, revision: str, entry: dict[str, Any]) -> str:
    repo_path = urllib.parse.quote(model_id, safe="/")
    file_path = "/".join(urllib.parse.quote(part, safe="") for part in entry["path"].split("/"))
    return f"{endpoint}/{repo_path}/resolve/{revision}/{file_path}"


def curl_download(url: str, target: Path, byte_range: tuple[int, int] | None = None) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    command = [
        "curl", "--fail", "--location", "--silent", "--show-error",
        "--retry", "3", "--retry-all-errors", "--connect-timeout", "20",
        "--max-time", "300", "--speed-limit", "8192", "--speed-time", "60",
        "--output", str(target),
    ]
    if byte_range is not None:
        command.extend(["--range", f"{byte_range[0]}-{byte_range[1]}"])
    else:
        command.extend(["--continue-at", "-"])
    command.append(url)
    subprocess.run(command, check=True)


def download_file(endpoint: str, model_id: str, revision: str, entry: dict[str, Any], target: Path) -> tuple[str, str]:
    url = file_url(endpoint, model_id, revision, entry)
    target.parent.mkdir(parents=True, exist_ok=True)
    size = entry["size"]
    ranges = byte_ranges(size)
    if len(ranges) == 1 or not supports_parallel_ranges(entry):
        curl_download(url, target)
    else:
        parts = [(start, end, target.with_name(f"{target.name}.part-{start}")) for start, end in ranges]
        try:
            with ThreadPoolExecutor(max_workers=min(CURL_MAX_PARALLEL, len(parts))) as pool:
                futures = [pool.submit(curl_download, url, part_path, (start, end)) for start, end, part_path in parts]
                for (start, end, part_path), future in zip(parts, futures):
                    future.result()
                    expected = end - start + 1
                    if not part_path.is_file() or part_path.stat().st_size != expected:
                        actual = part_path.stat().st_size if part_path.is_file() else 0
                        raise SyncError(f"Range download size mismatch for {model_id}/{entry['path']} ({start}-{end}: {actual} != {expected})")
            with target.open("wb") as combined:
                for _, _, part_path in parts:
                    with part_path.open("rb") as segment:
                        for block in iter(lambda: segment.read(1024 * 1024), b""):
                            combined.write(block)
        finally:
            for _, _, part_path in parts:
                part_path.unlink(missing_ok=True)
    actual_size = target.stat().st_size
    if actual_size != entry["size"]:
        raise SyncError(f"Size mismatch for {model_id}/{entry['path']}: {actual_size} != {entry['size']}")
    algorithm, actual_checksum = content_checksum(target, entry)
    expected_checksum = entry.get("lfs", {}).get("oid") if entry.get("lfs") else entry.get("oid")
    if actual_checksum != expected_checksum:
        raise SyncError(f"{algorithm} checksum mismatch for {model_id}/{entry['path']}")
    return algorithm, actual_checksum


def upload_file(source: Path, destination: str, content_type: str, ossutil: str) -> None:
    subprocess.run(
        [
            ossutil, "cp", "--force", "--acl", "public-read",
            "--meta", f"Content-Type:{content_type}#Cache-Control:public,max-age=31536000,immutable",
            str(source), destination,
        ],
        check=True,
    )


def upload_catalog(catalog_path: Path, destination: str, ossutil: str) -> None:
    subprocess.run(
        [
            ossutil, "cp", "--force", "--acl", "public-read",
            "--meta", "Content-Type:application/json#Cache-Control:public,max-age=120",
            str(catalog_path), destination,
        ],
        check=True,
    )


def build_catalog(manifest: dict[str, Any], state: dict[str, Any]) -> dict[str, Any]:
    rows = []
    for model in manifest["models"]:
        record = state.get("models", {}).get(model["id"])
        if not record:
            raise SyncError(f"No published sync state for {model['id']}")
        rows.append(
            {
                "id": model["id"],
                "revision": record["revision"],
                "task": model["task"],
                "label": model["label"],
                "description": model["description"],
                "license": model["license"],
                "baseModel": model["baseModel"],
                "sourceUrl": f"https://huggingface.co/{model['id']}",
                "downloadBytes": record["downloadBytes"],
                "files": record["files"],
            }
        )
    return {
        "schemaVersion": 1,
        "updatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "runtime": {
            "version": "3.8.1",
            "url": "https://dl.lain42.top/wasm/transformers-js/3.8.1/transformers.bundle.mjs",
            "wasmBase": "https://dl.lain42.top/wasm/transformers-js/3.8.1/",
        },
        "models": rows,
    }


def sync(args: argparse.Namespace) -> dict[str, Any]:
    manifest_path = Path(args.manifest).resolve()
    state_path = Path(args.state).resolve()
    manifest = read_json(manifest_path)
    validate_manifest(manifest)
    endpoint = args.endpoint or manifest["transport"]
    endpoint = endpoint.rstrip("/")
    bucket = args.bucket.rstrip("/")
    prefix = manifest["bucketPrefix"].strip("/")
    previous_state = read_json(state_path) if state_path.exists() else {"schemaVersion": 1, "models": {}}
    next_state = {"schemaVersion": 1, "models": dict(previous_state.get("models", {}))}
    changed = False

    with tempfile.TemporaryDirectory(prefix="lain42-hf-models-", dir=args.temp_dir) as scratch:
        scratch_path = Path(scratch)
        downloads: list[tuple[Path, str, str]] = []
        for model in manifest["models"]:
            model_id = model["id"]
            old_record = previous_state.get("models", {}).get(model_id, {})
            revision = current_revision(endpoint, model_id, model["bootstrapRevision"], old_record.get("revision"))
            if old_record.get("revision") == revision:
                print(f"unchanged {model_id} {revision[:7]}", flush=True)
                continue

            tree = file_tree(endpoint, model_id, revision)
            published_files = []
            download_bytes = 0
            for allowlisted in model["files"]:
                path = allowlisted["path"]
                entry = tree.get(path)
                if not isinstance(entry, dict):
                    raise SyncError(f"Required upstream file missing: {model_id}/{path}")
                size = entry.get("size")
                oid = entry.get("oid")
                if not isinstance(size, int) or size <= 0 or size > allowlisted["maxBytes"]:
                    raise SyncError(f"Upstream file size rejected: {model_id}/{path} ({size})")
                if not isinstance(oid, str) or not OID_RE.fullmatch(oid):
                    raise SyncError(f"Invalid upstream Git blob OID: {model_id}/{path}")
                target = scratch_path / model_id / revision / path
                algorithm, checksum = download_file(endpoint, model_id, revision, entry, target)
                object_key = f"{prefix}/{model_id}/resolve/{revision}/{path}"
                content_type = "application/json" if path.endswith(".json") else "application/octet-stream"
                downloads.append((target, f"{bucket}/{object_key}", content_type))
                published_files.append({"path": path, "bytes": size, "checksumAlgorithm": algorithm, "checksum": checksum})
                download_bytes += size

            next_state["models"][model_id] = {
                "revision": revision,
                "downloadBytes": download_bytes,
                "files": published_files,
                "syncedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            }
            changed = True
            print(f"verified {model_id} {revision[:7]} ({download_bytes} bytes)", flush=True)

        # Do not publish the catalog until every changed model has passed checksums and uploads.
        for source, destination, content_type in downloads:
            upload_file(source, destination, content_type, args.ossutil)
            print(f"uploaded {destination.rsplit('/', 1)[-1]}", flush=True)

        if changed or not state_path.exists():
            catalog = build_catalog(manifest, next_state)
            catalog_path = scratch_path / "catalog.json"
            catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            upload_catalog(catalog_path, f"{bucket}/{prefix}/catalog.json", args.ossutil)
            state_path.parent.mkdir(parents=True, exist_ok=True)
            state_path.write_text(json.dumps(next_state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"published catalog for {len(catalog['models'])} models", flush=True)
        else:
            print("catalog unchanged", flush=True)

    return next_state


def make_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", default=str(Path(__file__).with_name("models.json")))
    parser.add_argument("--state", default=str(DEFAULT_STATE))
    parser.add_argument("--endpoint", default=None, help="Hugging Face-compatible API/file endpoint")
    parser.add_argument("--bucket", default=DEFAULT_OSS_BUCKET)
    parser.add_argument("--ossutil", default="/usr/local/bin/ossutil")
    parser.add_argument("--temp-dir", default="/var/tmp")
    parser.add_argument("--check", action="store_true", help="validate manifest only")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = make_parser()
    args = parser.parse_args(argv)
    try:
        if args.check:
            validate_manifest(read_json(Path(args.manifest)))
            print("manifest valid")
            return 0
        if not Path(args.ossutil).is_file():
            raise SyncError(f"ossutil not found: {args.ossutil}")
        sync(args)
        return 0
    except (OSError, subprocess.CalledProcessError, SyncError) as error:
        print(f"model sync failed: {error}", file=sys.stderr, flush=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
