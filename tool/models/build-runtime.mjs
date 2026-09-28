import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(process.env.OUTPUT_DIR || join(root, 'dist'));
const ortDist = join(root, 'node_modules/onnxruntime-web/dist');

await mkdir(output, { recursive: true });
await build({
  entryPoints: [join(root, 'runtime-entry.mjs')],
  outfile: join(output, 'transformers.bundle.mjs'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  minify: true,
  sourcemap: false,
  external: ['*.wasm'],
  legalComments: 'eof',
});

for (const file of [
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.wasm',
  'ort-wasm-simd-threaded.jsep.mjs',
  'ort-wasm-simd-threaded.jsep.wasm',
]) {
  await copyFile(join(ortDist, file), join(output, file));
}
await copyFile(join(root, 'THIRD-PARTY-NOTICES.md'), join(output, 'THIRD-PARTY-NOTICES.md'));
await copyFile(join(root, 'node_modules/@huggingface/transformers/LICENSE'), join(output, 'LICENSE-transformers-js.txt'));
await copyFile(join(root, 'node_modules/@huggingface/jinja/LICENSE'), join(output, 'LICENSE-jinja.txt'));

console.log(`Built Transformers.js browser runtime assets in ${output}`);
