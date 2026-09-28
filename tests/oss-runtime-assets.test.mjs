import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (path) => readFileSync(join(root, path), 'utf8');

test('all large-tool runtimes are pinned to the direct OSS domain', () => {
  const pages = [
    ['lyco/clang/index.html', 'wasm/lilyco-clang/e19dc5c/'],
    ['lyco/chem/index.html', 'wasm/rdkit/2026.3.6/'],
    ['lyco/ffmpeg/index.html', 'wasm/ffmpeg-core/0.12.6/'],
    ['lyco/opencv/index.html', 'wasm/opencv/4.13.0/'],
    ['lyco/magick/index.html', 'wasm/magick-wasm/0.0.43/'],
  ];
  for (const [path, assetPrefix] of pages) {
    const page = read(path);
    assert.ok(page.includes(`https://dl.lain42.top/${assetPrefix}`), `${path} should use OSS`);
    assert.doesNotMatch(page, /(?:unpkg\.com|cdn\.jsdelivr\.net|docs\.opencv\.org)\//, `${path} should not fetch the runtime from a CDN`);
  }
  const ffmpeg = read('lyco/ffmpeg/index.html');
  assert.match(ffmpeg, /<script src="\.\/ffmpeg\.js"><\/script>/);
  assert.match(ffmpeg, /coreURL: await toBlobURL\('https:\/\/dl\.lain42\.top\/wasm\/ffmpeg-core\/0\.12\.6\/dist\/umd\/ffmpeg-core\.js'/);
  assert.match(ffmpeg, /wasmURL: await toBlobURL\('https:\/\/dl\.lain42\.top\/wasm\/ffmpeg-core\/0\.12\.6\/dist\/umd\/ffmpeg-core\.wasm'/);
  assert.doesNotMatch(ffmpeg, /classWorkerURL/);
  assert.ok(statSync(join(root, 'lyco/ffmpeg/ffmpeg.js')).size > 1000);
  assert.ok(statSync(join(root, 'lyco/ffmpeg/814.ffmpeg.js')).size > 1000);
});

test('local chat loads a real GGUF model and streams generated text in-browser', () => {
  const page = read('tool/lyco_chat/index.html');
  assert.match(page, /Qwen3-0\.6B-Q4_K_M\.gguf/);
  assert.match(page, /const OSS = 'https:\/\/dl\.lain42\.top\/wasm\/'/);
  assert.match(page, /wllama\/3\.6\.1\/index\.min\.js/);
  assert.match(page, /loadModelFromUrl\(MODEL_URL/);
  assert.match(page, /createChatCompletion\([\s\S]*?stream: true/);
  assert.match(page, /for await \(const chunk of stream\)/);
  assert.match(page, /不请求 lain42 的推理服务/);
  assert.match(page, /下次重新打开时，若运行时未被浏览器缓存则需要联网重载/);
  assert.doesNotMatch(page, /\/v1\/chat\/completions|api\.lain42\.top\/v1/);
  assert.match(page, /不是语言模型，也不会产生文本/);
});

test('the toolbox links to the running local model app and does not list research as a tool', () => {
  const page = read('tool/index.html');
  assert.match(page, /d:"\/tool\/lyco_chat"/);
  assert.match(page, /lyco_chat 本地 AI/);
  assert.doesNotMatch(page, /n:"产业调研矩阵"/);
  assert.match(page, /首次打开时，浏览器会从/);
});
