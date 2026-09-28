import importlib.util
import hashlib
import json
import tempfile
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("sync_hf_models", HERE / "sync_hf_models.py")
sync = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(sync)


class SyncManifestTests(unittest.TestCase):
    def test_large_file_ranges_are_contiguous_and_cover_exact_size(self):
        ranges = sync.byte_ranges(10, chunk_size=4)
        self.assertEqual(ranges, [(0, 3), (4, 7), (8, 9)])
        self.assertEqual(ranges[0][0], 0)
        self.assertEqual(ranges[-1][1], 9)
        self.assertTrue(all(left[1] + 1 == right[0] for left, right in zip(ranges, ranges[1:])))

    def test_parallel_ranges_are_reserved_for_lfs_payloads(self):
        self.assertTrue(sync.supports_parallel_ranges({"size": 10_000_000, "lfs": {"oid": "a" * 64}}))
        self.assertFalse(sync.supports_parallel_ranges({"size": 10_000_000, "oid": "a" * 40}))
        self.assertFalse(sync.supports_parallel_ranges({"size": 100, "lfs": {"oid": "a" * 64}}))

    def test_manifest_is_valid_and_revision_pinned(self):
        manifest = json.loads((HERE / "models.json").read_text(encoding="utf-8"))
        sync.validate_manifest(manifest)
        self.assertEqual(len(manifest["models"]), 3)
        self.assertTrue(all(len(model["bootstrapRevision"]) == 40 for model in manifest["models"]))

    def test_rejects_path_traversal(self):
        manifest = {
            "schemaVersion": 1,
            "transport": "https://hf-mirror.com",
            "bucketPrefix": "models/hf",
            "models": [{
                "id": "org/model",
                "bootstrapRevision": "0" * 40,
                "files": [{"path": "../secret", "maxBytes": 1}],
            }],
        }
        with self.assertRaises(sync.SyncError):
            sync.validate_manifest(manifest)

    def test_git_blob_checksum_matches_git_object_format(self):
        with tempfile.TemporaryDirectory() as temporary:
            file = Path(temporary) / "sample.txt"
            file.write_bytes(b"hello\n")
            self.assertEqual(sync.git_blob_oid(file), "ce013625030ba8dba906f756967f9e9ca394464a")

    def test_lfs_checksum_uses_payload_sha256_not_pointer_git_oid(self):
        with tempfile.TemporaryDirectory() as temporary:
            file = Path(temporary) / "weights.onnx"
            payload = b"quantized model payload"
            file.write_bytes(payload)
            entry = {
                "path": "weights.onnx",
                "size": len(payload),
                "oid": "a" * 40,
                "lfs": {
                    "oid": hashlib.sha256(payload).hexdigest(),
                    "size": len(payload),
                    "pointerSize": 133,
                },
            }
            self.assertEqual(
                sync.content_checksum(file, entry),
                ("sha256", hashlib.sha256(payload).hexdigest()),
            )

    def test_rejects_invalid_lfs_sha256(self):
        with tempfile.TemporaryDirectory() as temporary:
            file = Path(temporary) / "weights.onnx"
            file.write_bytes(b"payload")
            entry = {"path": "weights.onnx", "lfs": {"oid": "bad", "size": 7}}
            with self.assertRaises(sync.SyncError):
                sync.content_checksum(file, entry)


if __name__ == "__main__":
    unittest.main()
