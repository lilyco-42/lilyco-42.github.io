import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// 首页「生态全景」的数据层校验 —— 纯离线，不发网络请求，所以能进 CI。
//
// 它守的是一条对外承诺：页面上写的「分组总和 = N 个自有公开仓」必须自洽，
// 而且每个仓的名字都能拼出一个真实存在的仓库 URL。
// 「GitHub 上到底有没有这个仓」由 scripts/gen-ecosystem.mjs 在生成时把关
// （对不上直接退出），这里只查生成后的文件自己有没有前后矛盾。

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'assets', 'ecosystem-data.js');
const indexPath = path.join(root, 'index.html');
const guidePath = path.join(root, 'guide.html');

const OWNER = 'lilyco-42';
// 仓库名会被直接拼进 URL 与 HTML，先限制字符集，避免出现空格 / 引号 / & 之类的破页面字符。
const SAFE_NAME = /^[A-Za-z0-9._-]+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function loadEcosystem() {
  const source = await readFile(dataPath, 'utf8');
  // 数据文件是给浏览器用的普通脚本（const ECOSYSTEM = ...），用 Function 取出来即可，
  // 不必依赖 module 系统 —— 顺带也验证了它本身语法没坏。
  return new Function(`${source}\nreturn ECOSYSTEM;`)();
}

test('生态数据文件结构自洽：分组总和 = 总数，名称唯一', async () => {
  const eco = await loadEcosystem();

  assert.match(eco.asOf, ISO_DATE, `asOf 应为 YYYY-MM-DD，实际 ${eco.asOf}`);
  assert.ok(Array.isArray(eco.groups) && eco.groups.length > 0, 'groups 不能为空');

  const seen = new Map();
  let counted = 0;
  for (const group of eco.groups) {
    assert.ok(group.key && group.title && group.note, `分组缺字段：${JSON.stringify(group.key)}`);
    assert.ok(Array.isArray(group.repos) && group.repos.length > 0, `分组 ${group.key} 没有仓库`);

    for (const repo of group.repos) {
      assert.match(repo.n, SAFE_NAME, `仓名含不安全字符：${repo.n}`);
      assert.ok(repo.l, `${repo.n} 缺语言`);
      assert.equal(typeof repo.s, 'number', `${repo.n} 的 star 不是数字`);
      assert.match(repo.p, ISO_DATE, `${repo.n} 的 push 日期格式不对：${repo.p}`);
      assert.ok(repo.d && repo.d.trim().length >= 4, `${repo.n} 缺一句话简介`);
      assert.ok(!seen.has(repo.n), `仓名重复：${repo.n}（同时出现在 ${seen.get(repo.n)} 与 ${group.key}）`);
      seen.set(repo.n, group.key);
      counted += 1;
    }
  }

  assert.equal(counted, eco.totals.repos, `分组总和 ${counted} ≠ totals.repos ${eco.totals.repos}`);
  assert.equal(eco.groups.length, eco.totals.groups, '分组数与 totals.groups 不一致');

  // 分组 key 也要唯一，否则渲染时会看起来「少了一组」
  const keys = eco.groups.map((g) => g.key);
  assert.equal(new Set(keys).size, keys.length, `分组 key 重复：${keys.join(', ')}`);

  // totals.langs / totals.stars 至少得是正数，避免生成脚本改坏后静默显示 0
  assert.ok(eco.totals.langs > 0, 'totals.langs 应为正数');
  assert.ok(eco.totals.stars >= 0, 'totals.stars 不应为负');
});

test('每个仓名都能拼出可用的仓库地址', async () => {
  const eco = await loadEcosystem();
  const names = eco.groups.flatMap((g) => g.repos.map((r) => r.n));
  // 页面渲染用的就是这个模板；这里把「名称 → URL」的约定钉死
  const urls = names.map((n) => `https://github.com/${OWNER}/${n}`);
  assert.equal(urls.length, eco.totals.repos);
  for (const url of urls) {
    assert.match(url, /^https:\/\/github\.com\/lilyco-42\/[A-Za-z0-9._-]+$/, `URL 不合法：${url}`);
  }
  // 名字里带点的仓（.github）在 URL 里是合法的，别被 SAFE_NAME 之外的东西混进来
  assert.equal(new Set(urls).size, urls.length, '存在重复的仓库地址');
});

test('标了「快速入门」的仓在 guide.html 里真的有那一篇', async () => {
  const eco = await loadEcosystem();
  const guideHtml = await readFile(guidePath, 'utf8');
  const block = guideHtml.match(/const GUIDES = \{[\s\S]*?\n\};/);
  assert.ok(block, 'guide.html 里找不到 GUIDES 定义');
  const available = new Set([...block[0].matchAll(/^ {2}"([^"]+)":/gm)].map((m) => m[1]));

  const linked = eco.groups.flatMap((g) => g.repos.filter((r) => r.g).map((r) => r.n));
  const dangling = linked.filter((n) => !available.has(n));
  assert.deepEqual(dangling, [], `这些仓标了快速入门但 guide.html 没有对应条目：${dangling.join(', ')}`);
  assert.ok(linked.length > 0, '没有任何仓链到快速入门，检查生成脚本是否漏了 g 标记');
});

test('首页确实挂了数据文件与生态视图', async () => {
  const html = await readFile(indexPath, 'utf8');
  assert.ok(html.includes('assets/ecosystem-data.js'), 'index.html 没有引用生态数据文件');
  assert.match(html, /data-view="ecosystem"/, '侧栏缺少「生态全景」入口');
  assert.match(html, /id="v-ecosystem"/, '缺少生态视图容器');
  assert.match(html, /function renderEcosystem\s*\(/, '缺少 renderEcosystem 渲染函数');
  // 视图要能深链，否则「生态全景」没法直接分享给谁看
  assert.match(html, /location\.hash/, '缺少视图深链（index.html#ecosystem）处理');
});

// 上面几条查的是「数据对不对」，这条查的是「页面真的能画出来」。
// 用一组最小 DOM 桩把 index.html 的内联脚本原样跑一遍 —— 没有 jsdom 依赖，
// 但足以抓住「渲染函数抛异常」和「卡片数与数据对不上」这两类真问题。
test('渲染冒烟：真跑一遍 renderEcosystem，卡片数与数据一致', async () => {
  const html = await readFile(indexPath, 'utf8');
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const script = inline.find((s) => s.includes('renderEcosystem'));
  assert.ok(script, 'index.html 里找不到渲染脚本');

  const elements = new Map();
  const makeEl = () => ({
    innerHTML: '', textContent: '', scrollTop: 0, dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    addEventListener() {}, setAttribute() {}, removeAttribute() {}, querySelectorAll: () => [],
  });
  const documentStub = {
    getElementById: (id) => {
      if (!elements.has(id)) elements.set(id, makeEl());
      return elements.get(id);
    },
    querySelectorAll: () => [], querySelector: () => makeEl(), addEventListener() {},
  };

  const eco = await loadEcosystem();
  const run = new Function(
    'ECOSYSTEM', 'document', 'localStorage', 'fetch',
    `${script}\nreturn { renderEcosystem, ECO };`,
  );
  const api = run(
    eco,
    documentStub,
    { getItem: () => null, setItem() {} },
    async () => ({ ok: true, json: async () => [] }),
  );

  api.renderEcosystem();
  const out = elements.get('v-ecosystem').innerHTML;

  assert.equal(api.ECO.totals.repos, eco.totals.repos, 'ECO 没有正确取到数据文件');
  const cards = (out.match(/class="eco-card"/g) || []).length;
  assert.equal(cards, eco.totals.repos, `渲染出 ${cards} 张卡片，数据是 ${eco.totals.repos} 个仓`);
  const groups = (out.match(/class="eco-grp"/g) || []).length;
  assert.equal(groups, eco.groups.length, '分组数与数据不一致');
  // 未定义/NaN 泄漏到页面上是这类模板拼接最常见的翻车方式
  assert.ok(!/undefined|NaN|\[object Object\]/.test(out), '渲染结果里出现了 undefined / NaN / [object Object]');
  // 每个仓都得有能点出去的链接
  const links = (out.match(/https:\/\/github\.com\/lilyco-42\//g) || []).length;
  assert.equal(links, eco.totals.repos, `渲染出的仓库链接数 ${links} ≠ ${eco.totals.repos}`);
});

