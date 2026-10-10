#!/usr/bin/env node
// 生成 assets/ecosystem-data.js —— 生态全景的数据层。
//
// 为什么要有这个脚本：首页的「生态全景」必须和 GitHub 上的真实仓库一致。
// 手抄 120+ 个仓名/语言/star/日期一定会漂，所以这里只让机器做机器该做的事：
//   · 机器层（名称 / 语言 / star / 最后 push / 总数）→ 从 GitHub API 现拉
//   · 人工层（分组 + 一句话）→ scripts/ecosystem-map.json，人写
// 两者对不上就直接报错退出（多一个、少一个、拼错名都会被抓出来）。
//
// 用法：
//   node scripts/gen-ecosystem.mjs            # 需要已 gh auth login，或设 GITHUB_TOKEN
//   node scripts/gen-ecosystem.mjs --check    # 只校验，不写文件（CI 用不到，本地核对用）
//
// 依赖：Node 18+（用内置 fetch）、gh CLI（取 token 用；也可用 GITHUB_TOKEN 环境变量替代）

import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OWNER = 'lilyco-42';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mapPath = path.join(root, 'scripts', 'ecosystem-map.json');
const guidePath = path.join(root, 'guide.html');
const outPath = path.join(root, 'assets', 'ecosystem-data.js');
const checkOnly = process.argv.includes('--check');

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

async function fetchRepos() {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'lilyco-ecosystem-gen' };
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  const all = [];
  for (let page = 1; page <= 10; page++) {
    const url = `https://api.github.com/users/${OWNER}/repos?per_page=100&sort=pushed&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status} on page ${page}: ${await res.text()}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

function guideKeys(html) {
  const block = html.match(/const GUIDES = \{[\s\S]*?\n\};/);
  if (!block) return new Set();
  return new Set([...block[0].matchAll(/^ {2}"([^"]+)":/gm)].map((m) => m[1]));
}

const map = JSON.parse(await readFile(mapPath, 'utf8'));
const repos = (await fetchRepos()).filter((r) => !r.fork && r.visibility === 'public');
const guides = guideKeys(await readFile(guidePath, 'utf8'));

// ── 一致性闸门：GitHub 与人工表必须严格一一对应 ──
const ghNames = new Set(repos.map((r) => r.name));
const mapNames = new Set(Object.keys(map.repos));
const missing = [...ghNames].filter((n) => !mapNames.has(n)).sort();
const extra = [...mapNames].filter((n) => !ghNames.has(n)).sort();
const badGroup = Object.entries(map.repos)
  .filter(([, v]) => !map.groups.some((g) => g.key === v[0]))
  .map(([n, v]) => `${n} → 未知分组 ${v[0]}`);
if (missing.length || extra.length || badGroup.length) {
  if (missing.length) console.error(`✗ GitHub 上有、映射表里没有（${missing.length}）：\n  ${missing.join('\n  ')}`);
  if (extra.length) console.error(`✗ 映射表里有、GitHub 上找不到（${extra.length}）：\n  ${extra.join('\n  ')}`);
  if (badGroup.length) console.error(`✗ 分组名不存在：\n  ${badGroup.join('\n  ')}`);
  process.exit(1);
}

const byName = new Map(repos.map((r) => [r.name, r]));
const groups = map.groups
  .map((g) => ({
    key: g.key,
    title: g.title,
    note: g.note,
    repos: Object.entries(map.repos)
      .filter(([, v]) => v[0] === g.key)
      .map(([n, v]) => {
        const r = byName.get(n);
        return {
          n,
          l: r.language || '其他',
          s: r.stargazers_count,
          p: (r.pushed_at || '').slice(0, 10),
          d: v[1],
          ...(guides.has(n) ? { g: true } : {}),
        };
      })
      // 同组内按 star 降序，再按最近 push —— 一眼看到最该看的
      .sort((a, b) => b.s - a.s || (a.p < b.p ? 1 : -1)),
  }))
  .filter((g) => g.repos.length);

const total = groups.reduce((n, g) => n + g.repos.length, 0);
const langs = new Set(repos.map((r) => r.language || '其他'));
const stars = repos.reduce((n, r) => n + r.stargazers_count, 0);
const asOf = new Date().toISOString().slice(0, 10);

const payload = {
  asOf,
  totals: { repos: total, langs: langs.size, stars, groups: groups.length },
  groups,
};

// 一仓一行地输出：体积比全展开小一半，diff 也只动改到的那一行。
const j = (v) => JSON.stringify(v);
const groupLines = groups.map((g) => {
  const repos = g.repos
    .map((r) => `        ${j(r)},`)
    .join('\n');
  return `    {\n      "key": ${j(g.key)}, "title": ${j(g.title)}, "note": ${j(g.note)},\n      "repos": [\n${repos}\n      ]\n    },`;
});

const body = `// 自动生成，请勿手改 —— 改 scripts/ecosystem-map.json 后跑 node scripts/gen-ecosystem.mjs
// 数据源：GitHub API users/${OWNER}/repos（非 fork、公开），生成于 ${asOf}
// 校验：分组总和 = ${total} = 非 fork 公开仓数；名称唯一；URL 由名称推导
const ECOSYSTEM = {
  "asOf": ${j(asOf)},
  "totals": { "repos": ${total}, "langs": ${langs.size}, "stars": ${stars}, "groups": ${groups.length} },
  "groups": [
${groupLines.join('\n')}
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = ECOSYSTEM;
`;

if (checkOnly) {
  // 结构化比对（忽略生成日期与注释），所以只有数据真的变了才判红。
  const prevSrc = await readFile(outPath, 'utf8').catch(() => '');
  let prev = null;
  try {
    prev = new Function(`${prevSrc}\nreturn ECOSYSTEM;`)();
  } catch {
    /* 文件缺失或语法坏了，下面统一按「过期」处理 */
  }
  const strip = (p) => JSON.stringify(p && { totals: p.totals, groups: p.groups });
  const same = prev && strip(prev) === strip(payload);
  console.log(same ? '✓ 数据文件与 GitHub 一致' : '✗ 数据文件已过期，需要重新生成');
  process.exit(same ? 0 : 1);
}

await writeFile(outPath, body, 'utf8');
console.log(`✓ ${path.relative(root, outPath)}`);
console.log(`  ${total} 个仓 · ${groups.length} 个分组 · ${langs.size} 种语言 · ★ ${stars} · asOf ${asOf}`);
for (const g of groups) console.log(`  · ${g.title}：${g.repos.length}`);
