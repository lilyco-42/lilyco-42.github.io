# Third-party notices

This workbench bundles the browser build of Transformers.js and ONNX Runtime Web. Model inputs stay in the browser; the model binaries are delivered by OSS.

| Component | Version | License | Upstream |
| --- | --- | --- | --- |
| `@huggingface/transformers` | 3.8.1 | Apache-2.0 | https://github.com/huggingface/transformers.js |
| `@huggingface/jinja` | 0.5.3 (locked by npm lockfile) | Apache-2.0 | https://github.com/huggingface/transformers.js |
| ONNX Runtime Web / Common | 1.22.0-dev.20250409-89f8206ba4 | MIT | https://github.com/microsoft/onnxruntime |
| Whisper Tiny | `onnx-community/whisper-tiny` | Apache-2.0 (base model) | https://huggingface.co/openai/whisper-tiny |
| Multilingual E5 Small | `Xenova/multilingual-e5-small` | MIT | https://huggingface.co/intfloat/multilingual-e5-small |
| Multilingual MiniLMv2 | `onnx-community/multilingual-MiniLMv2-L6-mnli-xnli-ONNX` | MIT | https://huggingface.co/onnx-community/multilingual-MiniLMv2-L6-mnli-xnli-ONNX |

The Transformers.js distribution includes its Apache-2.0 license text. The pinned ONNX Runtime Web NPM package declares MIT; the upstream repository publishes the full license. See each linked upstream source for the applicable terms.
