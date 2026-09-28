# Browser small-model workbench

This page runs three Hugging Face ONNX models with Transformers.js and ONNX Runtime Web in the user's browser. The model weights and WASM runtime are fetched directly from `dl.lain42.top`; prompts and local files are not sent to the site server. Model weights are cached by the browser Cache API after first use.

## Current models

| Model | Browser task | Download size | License |
| --- | --- | ---: | --- |
| `onnx-community/whisper-tiny` | Multilingual audio transcription | about 43 MiB | Apache-2.0 (upstream OpenAI model) |
| `Xenova/multilingual-e5-small` | Multilingual semantic search | about 134 MiB | MIT |
| `onnx-community/multilingual-MiniLMv2-L6-mnli-xnli-ONNX` | Zero-shot text classification | about 119 MiB | MIT |

The exact per-file sizes, licenses, pinned current revisions, Git blob/LFS payload checksums, and Hugging Face links are published in `https://dl.lain42.top/models/hf/catalog.json`.

Runtime/model license summary: [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md). The notice and upstream package license files are also mirrored beside the OSS runtime.

## Sync design

`sync_hf_models.py` downloads only the allowlist in `models.json`. Small Git files are checked against the upstream Git blob OID; large Git LFS files are checked against the LFS payload SHA-256. Every asset must also match the upstream byte size before upload. The synchronizer writes immutable, revision-qualified model objects to OSS, then publishes the catalog last. OSS credentials are supplied by the existing host-level `ossutil` configuration; they are not in this repo.

The sync host cannot reach `huggingface.co` directly. The current transfer endpoint is `https://hf-mirror.com`; model identity and license references remain the Hugging Face model cards. The first run is pinned to revisions reviewed from the official Hugging Face model pages. Later scheduled runs only advance when a new upstream revision is observed.

Install on the OSS host:

```sh
install -d -m 0755 /opt/lain42-model-sync
install -m 0644 models.json /opt/lain42-model-sync/models.json
install -m 0755 sync_hf_models.py /opt/lain42-model-sync/sync_hf_models.py
install -m 0644 lain42-hf-model-sync.cron /etc/cron.d/lain42-hf-model-sync
systemctl reload cron
python3 /opt/lain42-model-sync/sync_hf_models.py --check
```

The host schedule is 03:15 UTC daily (11:15 China time) and prevents overlapping runs with `flock`. Failures leave the previous catalog published and are written to syslog with the `lain42-hf-model-sync` tag.

## Runtime build

This repository pins Transformers.js 3.8.1 and esbuild 0.25.5. Build its ESM bundle plus the ONNX Runtime Web SIMD and JSEP WASM assets with:

```sh
npm ci --ignore-scripts --registry=https://registry.npmjs.org
npm run build
```

The generated bundle and all ONNX Runtime Web module/WASM assets (including the JSEP modules loaded by the runtime) are uploaded to `wasm/transformers-js/3.8.1/` in OSS, separate from the website server.

## Model source cards

- [Whisper Tiny ONNX model](https://huggingface.co/onnx-community/whisper-tiny) · [OpenAI base model and license](https://huggingface.co/openai/whisper-tiny)
- [Multilingual E5 Small ONNX model](https://huggingface.co/Xenova/multilingual-e5-small) · [base model](https://huggingface.co/intfloat/multilingual-e5-small)
- [Multilingual MiniLMv2 ONNX model](https://huggingface.co/onnx-community/multilingual-MiniLMv2-L6-mnli-xnli-ONNX)
- [Transformers.js](https://github.com/huggingface/transformers.js) · [Transformers.js environment configuration](https://huggingface.co/docs/transformers.js/api/env)
