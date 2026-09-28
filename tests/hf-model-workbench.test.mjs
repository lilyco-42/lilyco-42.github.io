import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (file) => readFileSync(join(root, file), 'utf8');

test('model workbench runs only allowlisted HF revisions through OSS and local WASM', () => {
  const page = read('tool/models/app.mjs');
  assert.match(page, /https:\/\/dl\.lain42\.top\/models\/hf/);
  assert.match(page, /https:\/\/dl\.lain42\.top\/wasm\/transformers-js\/3\.8\.1\/transformers\.bundle\.mjs/);
  assert.match(page, /env\.remotePathTemplate = '\{model\}\/resolve\/\{revision\}\/'/);
  assert.match(page, /device: 'wasm'/);
  assert.match(page, /dtype: 'q8'/);
  assert.match(page, /env\.backends\.onnx\.wasm\.numThreads = 1/);
  assert.match(page, /env\.backends\.onnx\.wasm\.proxy = false/);
  assert.match(page, /MODEL_IDS = new Set/);
  assert.match(page, /cache: 'no-store'/);
  assert.match(page, /pooling: 'mean', normalize: true/);
  assert.match(page, /query: \$\{query\}/);
  assert.match(page, /passage: \$\{text\}/);
  assert.match(page, /hypothesis_template: '这段内容属于\{\}。'/);
  assert.match(page, /decodeAudioData/);
  assert.match(page, /file\.size > 25 \* 1024 \* 1024/);
  assert.match(page, /decoded\.duration > 90/);
  assert.doesNotMatch(page, /api\.lain42\.top|fetch\([^)]*huggingface\.co/);
});

test('runtime build includes ONNX Runtime Web JSEP module and WASM dependencies', () => {
  const build = read('tool/models/build-runtime.mjs');
  assert.match(build, /ort-wasm-simd-threaded\.jsep\.mjs/);
  assert.match(build, /ort-wasm-simd-threaded\.jsep\.wasm/);
});

test('model workbench exposes the three practical task flows from the catalog', () => {
  const page = read('tool/models/index.html');
  const catalog = JSON.parse(read('tool/models/models.json'));
  assert.equal(catalog.models.length, 3);
  assert.deepEqual(catalog.models.map((model) => model.task), [
    'automatic-speech-recognition', 'feature-extraction', 'zero-shot-classification',
  ]);
  for (const phrase of ['音频转文字', '按意思搜索笔记', '用自己的标签分类']) assert.ok(page.includes(phrase));
  assert.match(page, /OSS 直下/);
  assert.match(page, /不发送/);
  assert.match(page, /href="\/tool\/lyco_chat\/"/);
  assert.match(page, /https:\/\/lilyco-42\.github\.io\/lyco\//);
  assert.match(read('tool/index.html'), /本地 AI 小模型/);
  assert.match(read('lyco/index.html'), /本地 AI 小模型/);
});
