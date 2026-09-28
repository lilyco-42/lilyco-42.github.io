# Third-party runtime notices

The workbenches fetch version-pinned runtime assets directly from `https://dl.lain42.top`; the website does not proxy these files.

| Component | Version used | License / source |
| --- | --- | --- |
| FFmpeg.wasm JavaScript wrapper | `@ffmpeg/ffmpeg` 0.12.10 | MIT; [source and release](https://github.com/ffmpegwasm/ffmpeg.wasm/releases/tag/v12.10) |
| FFmpeg core | `@ffmpeg/core` 0.12.6 | The distributed build reports `--enable-gpl` and `--enable-libx264`, so the FFmpeg core is treated as GPL-2.0-or-later; [matching upstream release/source](https://github.com/ffmpegwasm/ffmpeg.wasm/tree/v12.10), [FFmpeg license notes](https://github.com/ffmpegwasm/ffmpeg.wasm-core/blob/n4.3.1-wasm/LICENSE.md), [GPLv2 text](https://github.com/FFmpeg/FFmpeg/blob/master/COPYING.GPLv2) |
| Wllama | 3.6.1 | MIT; [source](https://github.com/ngxson/wllama) |
| Qwen3-0.6B GGUF | Q4_K_M | Apache-2.0; [model card](https://huggingface.co/Qwen/Qwen3-0.6B-GGUF) |
| RDKit.js | 2026.3.6 | BSD-3-Clause; [source](https://github.com/rdkit/rdkit) |
| HiGHS.js | 1.15.3 | MIT; [source](https://github.com/lovasoa/highs-js) |
| ImageMagick WASM | 0.0.43 | Apache-2.0; [source](https://github.com/dlemstra/magick-wasm) |
| OpenCV.js | 4.13.0 | Apache-2.0; [source](https://github.com/opencv/opencv) |

The FFmpeg build is an upstream package copied without modifying its binary. Its runtime configuration includes GPL-enabled components, so users who redistribute that core should review the GPL terms and the corresponding upstream source/build files. The application's own input media remains in the browser and is not uploaded.
