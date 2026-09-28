import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themePath = path.join(root, 'assets', 'site-theme.css');

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules'].includes(entry.name)) return [];
      return htmlFiles(fullPath);
    }
    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
  }));
  return nested.flat();
}

test('every published HTML page opts into the shared Lain42 theme', async () => {
  const pages = await htmlFiles(root);
  assert.ok(pages.length >= 20, `Expected the site pages to be discovered, found ${pages.length}`);

  const failures = [];
  for (const page of pages) {
    const source = await readFile(page, 'utf8');
    const relativePath = path.relative(root, page);
    if (!source.includes('/assets/site-theme.css')) failures.push(`${relativePath}: missing shared theme stylesheet`);
    if (!/<body\b[^>]*class=["'][^"']*\bsite-theme\b/i.test(source)) failures.push(`${relativePath}: body is missing the site-theme class`);
  }
  assert.deepEqual(failures, [], failures.join('\n'));
});

test('shared theme defines responsive, accessible shared tokens and controls', async () => {
  const css = await readFile(themePath, 'utf8');
  for (const token of ['--site-canvas', '--site-surface', '--site-text', '--site-muted', '--site-border', '--site-accent']) {
    assert.ok(css.includes(token), `Missing shared color token ${token}`);
  }
  assert.match(css, /prefers-reduced-motion\s*:\s*reduce/);
  assert.match(css, /min-height\s*:\s*44px/);
  assert.match(css, /:focus-visible/);
});
