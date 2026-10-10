# lilyco-42.github.io

个人主页 & 项目展示站（GitHub Pages）。每个子目录是一个独立可运行的网页项目，
`index.html` 是首页（导航 + Featured 项目卡片），由 JS 动态渲染。

## 目录结构（每个子目录 = 一个独立项目）

| 路径 | 项目 | 说明 |
|---|---|---|
| `/` | 首页 Dashboard | `index.html`；四个视图（精选项目 / **生态全景** / 本站应用 / 研究预研 / 全部仓库）由 JS 动态渲染 |
| `/assets/ecosystem-data.js` | 生态全景数据 | 由 `scripts/gen-ecosystem.mjs` 生成，**勿手改** |
| `/scripts/ecosystem-map.json` | 生态分组映射 | 人工策展层：分组 + 每个仓的归类与一句话 |
| `/design.html` | **设计规范（可视化）** | `DESIGN.md` 的可视化版：色板 / 字阶 / 组件 / 布局刻度 / Do-Don't |
| `/DESIGN.md` | **设计系统（给 agent 读）** | 纯 markdown 规范 —— 改本仓 UI 前先读它 |
| `/rembg/` | Rembg Studio · 浏览器版 | 商品图抠图 PWA；源码与构建见 `rembg-ui/web` |
| `/pet/` | 丛雨桌宠 | Rust + WASM；源码见 `cute-pet` |
| `/tool/` | WASM 工具箱 | 把下面几个小内核汇成一个入口页 |
| `/tool/lyco_chat/` | lyco_chat BitNet | 浏览器内 1.58-bit 推理的 wasm 包 |
| `/wasm-demo/` | WASM Demo | C → WASM 最小示例（`demo.wasm` 2.1 KB） |
| `/lyco/` | **lyco web tools** | WASM 工具套件总入口（10 个工具 + 产业矩阵） |
| `/lyco/clang/` | C 编译器 | clang.wasm 40.6MB + lld.wasm 22.1MB + sysroot 27.3MB，全部自托管 |
| `/lyco/db/` | DuckDB | 浏览器内 SQL 分析 |
| `/lyco/ffmpeg/` | ffmpeg.wasm | 浏览器内转码；core 31MB 走 unpkg CDN |
| `/lyco/magick/` | ImageMagick | 官方 C++ → WASM，100+ 图像格式（需 Memory64） |
| `/lyco/opencv/` | OpenCV.js | 官方移植 10.9MB |
| `/lyco/chem/` | RDKit.js | 分子工作台，官方 C++ 移植 |
| `/lyco/lp/` | HiGHS 线性规划 | 爱丁堡大学 C++ 求解器 → wasm 3.3MB |
| `/lyco/industry/` | 现实产业 × WASM | 移植可行性调研矩阵 |
| `/lyco/pad/` | 文本统计 | pad.wasm 3 KB |
| `/lyco/paint/` | 油漆桶 | paint.wasm 4.2 KB |
| `/lyco/photo/` | 图像滤镜 | photo.wasm 7.2 KB |
| `/lyco/sheet/` | 公式引擎 | sheet.wasm 11 KB |

> 每个子目录都是**独立可运行**的，互不依赖；`/tool/` 与 `/lyco/` 只是入口页。
> `/lyco/` **不是** lyco-engine 的在线 demo —— 那个仓发的是原生二进制，没有网页版。

## 生态全景（首页的第二个视图）

侧栏「生态全景」把 lilyco-42 名下**全部自有公开仓**（非 fork）按功能分组摆出来：
统计条 + 语言色徽章 + ★ + 最近 push + 能点出去的仓库链接。它和「全部仓库」的区别是
——「全部仓库」走 GitHub API 实时拉、可筛选可搜索；「生态全景」是**策展过的分类地图**，
数据随页面一起下发，**离线可读、可核验**。

数据分两层，别混：

| 层 | 文件 | 谁维护 |
|---|---|---|
| 人工策展 | `scripts/ecosystem-map.json` | 人：分组顺序、每个仓的归类与一句话 |
| 机器事实 | GitHub API（`users/lilyco-42/repos`） | 机器：仓名 / 语言 / ★ / 最后 push / 总数 |
| 生成产物 | `assets/ecosystem-data.js` | `scripts/gen-ecosystem.mjs` 合并上面两层 |

```bash
node scripts/gen-ecosystem.mjs          # 重新生成（需 gh auth login，或设 GITHUB_TOKEN）
node scripts/gen-ecosystem.mjs --check  # 只比对数据文件是否落后于 GitHub，不写文件
```

生成时有**硬闸门**：GitHub 上多一个仓、少一个仓，或映射表里写错一个仓名，
脚本直接报错退出并列出差集。所以页面上的「分组总和 = N」不会悄悄漂 ——
加仓之后忘了更新，`--check` 会告诉你。

**核验**（`Site design checks` CI 只跑前两条，纯离线，不发网络请求）：

1. `node --test tests/ecosystem.test.mjs` —— 分组总和自洽、仓名唯一、URL 由仓名推导、
   标了「快速入门」的仓在 `guide.html` 里真有那一篇；还会用一组 DOM 桩**真跑一遍渲染函数**，
   确认卡片数 = 数据条数、没有 `undefined` / `NaN` 泄漏到页面上
2. `node --test tests/site-theme.test.mjs` —— 每个 HTML 页都套了共用主题
3. `node scripts/gen-ecosystem.mjs --check` —— 数据是否落后于 GitHub（要联网，本地跑）

## 全站设计系统

所有已提交的 HTML 页面都使用 [`assets/site-theme.css`](./assets/site-theme.css) 共用视觉：ChatGPT 与 Apple 风格的浅色工作区、清晰排版、克制的绿色强调色和适合手机触控的控件。页面继续保留各自的工具布局、WASM 逻辑、代码区和画布。

规范见 [`DESIGN.md`](./DESIGN.md)，可视化示例见 [`design.html`](./design.html)。新增 HTML 页面必须引用共用样式并带 `site-theme` body class；`Site design checks` GitHub Actions 会检查覆盖范围、主题令牌、焦点样式、减少动态效果和触控尺寸。

模型/API 网关、算力市场和代理面板由独立服务提供，不在本仓库中；统一这些页面需要对应的源代码仓库。

## 如何加一个新项目（给新手，2 分钟）

1. 把网页产物复制到一个新子目录（如 `/newproject/`，放 `index.html` + 资源）。
2. **可选**：在首页 `index.html` 里登记，让它出现在导航中。**有两个数组，别搞混**：

   | 数组 | 放什么 | 字段 |
   |---|---|---|
   | `FEATURED` | **GitHub 仓**卡片 | `{ name, icon, tags, blurb, links }` —— `name` 必须是仓名，图标自动取 `assets/logos/<name>.svg` |
   | `APPS` | **本站页面** | `{ n, d, u, l }` —— `u` 是站内路径（如 `/newproject/`），`l` 是图标用的 logo 名 |

   要展示**本地页面**就加进 `APPS`。`FEATURED` 里**没有** `local` 字段
   —— 早期文档这么写过，实际不存在，照写不会生效。

   > 动样式前先读 [`DESIGN.md`](./DESIGN.md)；改完按它 §9 的「改文件前必做」自查
   > （`node --check` + 浏览器桩实跑 + 图标文件存在 + 链接 200）。
   >
   > `FEATURED` / `RESEARCH` 卡片的图标取 `assets/logos/<仓名>.svg`；缺文件时 `<img>`
   > 会回落到品牌图标（`brand.svg`），所以不会再出现碎图 —— 但图标该补还是要补。
3. **如果你在 `lilyco-42` 下开了新仓**：往 `scripts/ecosystem-map.json` 的 `repos` 里补一行
   `"仓名": ["分组key", "一句话"]`，再跑 `node scripts/gen-ecosystem.mjs` 重新生成数据。
   漏了这步生成脚本会直接报错退出 —— 这是故意的：宁可构建失败，也不要「仓加了、全景里却没有」。
4. `git add . && git commit -m "add: newproject" && git push`。GitHub Pages 自动发布。

### 关于 WASM 项目（如 /pet/）

- `app.wasm`：Rust 编译出的 WebAssembly（**必须是解压后的 .wasm，不要只放 .wasm.gz**）
- `ply_bundle.js`：运行时加载器（读 `app.wasm`）
- `index.html`：页面入口（引用 `./ply_bundle.js`）
- **不需要** `assets/` 外部目录：资产已由 rust-embed 编译进 `.wasm`

## 部署 / 更新（Rust 新手）

桌宠是 Rust 项目，源码在 `lilyco-42/cute-pet`。改源码后重新构建 WASM：

```bash
cd cute-pet/pet
cargo build --target wasm32-unknown-unknown --profile release-wasm
# 产物在 pet/build/web/(app.wasm / index.html / ply_bundle.js)
# 复制这三个文件到本仓库 /pet/, push 即可
```

> 只覆盖 `app.wasm`（Rust 逻辑变了才需重新构建），`index.html`/`ply_bundle.js`
> 一般不变。改样式改 `index.html`，改渲染逻辑才对 `ply_bundle.js`。
