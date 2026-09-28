import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(repoRoot, 'lyco/clang/index.html'), 'utf8');

test('C sample newline escapes survive the JavaScript template literal', () => {
  const start = html.indexOf('const samples = {');
  const end = html.indexOf('const out =', start);
  assert.notEqual(start, -1, 'sample programs should exist');
  assert.notEqual(end, -1, 'sample programs should end before UI helpers');

  const sampleSource = html.slice(start, end);
  const cStringLines = sampleSource
    .split('\n')
    .filter((line) => /printf\(|putchar\(/.test(line) && /\\n/.test(line));
  assert.ok(cStringLines.length >= 7, 'expected C examples containing newline output');

  for (const line of cStringLines) {
    assert.ok(line.includes('\\\\n'), 'C newline must survive JS template literal: ' + line);
  }
});
