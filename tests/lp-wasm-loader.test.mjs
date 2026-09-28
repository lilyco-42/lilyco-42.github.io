import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const page = readFileSync(join(root, 'lyco/lp/index.html'), 'utf8');

test('LP page imports the browser ESM loader and its matching WASM runtime', () => {
  assert.match(page, /const HIGHS_BASE = 'https:\/\/dl\.lain42\.top\/wasm\/highs\/1\.15\.3\/build\/'/);
  assert.match(page, /import\(HIGHS_BASE \+ 'highs\.mjs'\)/);
  assert.match(page, /await m\.default\(\{ locateFile: f => HIGHS_BASE \+ f \}\)/);
  assert.doesNotMatch(page, /highs@1\.15\.2\/build\/highs\.js/);
  assert.doesNotMatch(page, /cdn\.jsdelivr\.net\/npm\/highs/);
});
