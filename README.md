# lilyco-42.github.io

个人主页 & 项目展示站（GitHub Pages）。每个子目录是一个独立可运行的网页项目，
`index.html` 是首页（导航 + Featured 项目卡片），由 JS 动态渲染。

## 目录结构（每个子目录 = 一个独立项目）

| 路径 | 项目 | 说明 |
|---|---|---|
| `/` | 首页 Dashboard | `index.html`；卡片由 JS 动态渲染 |
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

## 设计系统（改样式前必读）

规范正文在 [`DESIGN.md`](./DESIGN.md)，可视化版是 [`design.html`](./design.html)
（跟随系统深/浅色，打开就能看到两套配色）。

**只管三个页面**：`index.html` / `guide.html` / `design.html`。
`/rembg/` `/pet/` `/tool/` `/wasm-demo/` `/lyco/*` 是各自独立构建的第三方应用，
有自己的视觉，**不要**拿这份规范去「统一」它们。

三条硬约束：

- **颜色一律走 `:root` 的 CSS 变量**，组件里不写死十六进制（`LANGC` 语言数据色除外）。
- **不用 `box-shadow`** —— 层次靠背景色阶（`--sidebar` / `--main` / `--card`）+ 1px `--edge` 描边。
- **零外部请求** —— 不用 webfont、不用 CDN；图标一律 `assets/logos/*.svg`。

另外必须同时支持 `prefers-color-scheme: light` 与 `prefers-reduced-motion`；
移动端（≤860px）触摸目标 ≥40px；键盘焦点要可见。

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
3. `git add . && git commit -m "add: newproject" && git push`。GitHub Pages 自动发布。

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
