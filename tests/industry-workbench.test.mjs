import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const page = readFileSync(join(root, 'lyco/industry/index.html'), 'utf8');

test('industry page launches working tools and distinguishes unintegrated candidates', () => {
  for (const route of ['../chem/', '../lp/', '../clang/', '../opencv/', '../magick/', '../ffmpeg/', '../../tool/lyco_chat/']) {
    assert.ok(page.includes(`href="${route}"`), `missing working tool route ${route}`);
  }
  assert.match(page, /dl\.lain42\.top/);
  assert.match(page, /尚未集成为可用工作台/);
  assert.doesNotMatch(page, /下一步候选/);
});
