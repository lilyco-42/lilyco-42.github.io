# lilyco-42.github.io

个人主页 & 项目展示站（GitHub Pages）。每个子目录是一个独立可运行的网页项目，
`index.html` 是首页（导航 + Featured 项目卡片），由 JS 动态渲染。

## 目录结构（每个子目录 = 一个独立项目）

| 路径 | 项目 | 如何跑 |
|---|---|---|
| `/` | 首页 Dashboard | 自动；编辑 `index.html` |
| `/rembg/` | **Rembg Studio WASM** 抠图验证版 | 浏览器打开；源码与构建见 rembg-ui/web |
| `/pet/` | **丛雨桌宠**（Rust + WASM + lazy-UI） | 浏览器打开 `/pet/` 即玩 |

## 如何加一个新项目（给新手，2 分钟）

1. 把网页产物复制到一个新子目录（如 `/newproject/`，放 `index.html` + 资源）。
2. **可选**：编辑首页 `index.html` 的 `const FEATURED = [...]`，加一条项目卡片，
   让它在首页展示（`name` 填 GitHub repo 名；或加 `local: '/newproject/'` 指向本地页）。
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
