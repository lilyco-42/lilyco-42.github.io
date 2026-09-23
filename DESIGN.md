# DESIGN.md — lilyco-42 展示层设计系统

> 本文件遵循 [Stitch DESIGN.md 规范](https://stitch.withgoogle.com/docs/design-md/specification/)，
> 按 [awesome-design-md](https://github.com/voltagent/awesome-design-md) 的 9 段式扩展。
>
> **用法**：把本文件放在项目根目录，任何 AI 编码 agent 读完即可生成视觉一致的 UI。
> 不需要 Figma 导出、不需要 JSON schema。
>
> **适用范围**：**只有这三个页面** —— `index.html`（仪表盘）、`guide.html`（快速入门）、
> `design.html`（本文件的可视化版）。外加各仓 `docs/banner.svg` 的配色习惯。
>
> ⚠️ **不覆盖** `/rembg/` `/pet/` `/tool/` `/wasm-demo/` `/lyco/*` —— 那些是各自独立构建的
> 第三方应用（有的走 CDN、有的是官方 WASM 移植），有自己的视觉，不要拿本规范去"统一"它们。
>
> **本文件描述的是已存在的系统**，不是待实现的提案；最后一段列出了与规范不符的已知偏差。

---

## 1. Visual Theme & Atmosphere

**一句话**：像 ChatGPT / Kimi 的深色工作台 —— 左侧固定导航，右侧单列内容，安静、克制、不抢内容。

| 维度 | 取值 |
|---|---|
| 气质 | 工具感、可信、低噪音 |
| 密度 | 中等 —— 卡片间距 `.9rem`，正文行高 `1.65`（中文可读性优先） |
| 动效 | 极少。只有侧栏抽屉有 `transform .2s` |
| 装饰 | 无插画、无渐变滥用、无糖果色大圆角 |

**设计哲学（三条，冲突时按序）**

1. **内容 > 容器。** 卡片只负责「分组」，不负责「装饰」。任何不承载信息的视觉元素都应删掉。
2. **`--acc` 是唯一的强调色。** 只允许出现在两类地方：**可点击的元素**、**标签胶囊 `.tag`**。
   正文、描述、元信息一律走 `--fg` / `--dim` —— 全站不出现第三种彩色。
3. **一个视图一件事。** 侧栏四个视图互斥，不堆叠信息。搜索会强制切到「全部仓库」。

**为什么是深色**：受众是开发者与 AI agent 使用者，长时间盯着看。
深色是默认；浅色由 `prefers-color-scheme` 触发（见 §2、§8）。

---

## 2. Color Palette & Roles

Dark 是**默认**（`:root`）。Light 通过 `@media (prefers-color-scheme: light)` 覆盖同一批变量 ——
**不要在组件里写死颜色，一律走 token**。

| Token | Dark | Light | 角色 | 用在哪 |
|---|---|---|---|---|
| `--sidebar` | `#171717` | `#f7f7f7` | 侧栏底 | `.sidebar` |
| `--main` | `#212121` | `#ffffff` | 主内容底 | `body` |
| `--card` | `#2f2f2f` | `#f2f2f2` | 卡片 / 输入框 / hover 底 | `.hcard` `.rcard` `.sapp` `.side-search` `.nav-item:hover` |
| `--card2` | `#383838` | `#e8e8e8` | 卡片二次 hover | `.btn:hover` `.sapp:hover` |
| `--edge` | `#ffffff1a` | `#00000014` | 1px 描边 / 分隔线 | 所有 `border` |
| `--fg` | `#ececec` | `#1f1f1f` | 正文 / 标题 | `h1` `.hcard h2` `.rcard h3` |
| `--dim` | `#a3a3a3` | `#5c5c5c` | 次要文字 / 描述 / 元信息 | `p` `.tagline` `.meta` `.nav-item` |
| `--acc` | `#58a6ff` | `#0969da` | **唯一强调色**（交互 + 标签） | `a` `.tag` `.lang.on` `.btn.pri` `:focus-visible` |
| `--ok` | `#3fb950` | `#1a7f37` | 「可玩 / 可用」主按钮 | `.btn.play` |
| `--on-acc` | `#0d1117` | `#ffffff` | 实底按钮上的文字色 | `.btn.pri` `.btn.play` |
| `--tagbg` | `#ffffff0d` | `#0000000a` | 标签胶囊底色 | `.tag` |

**语义色只有两个**：`--acc`（强调）、`--ok`（可玩）。

**语言色点**（`.dot`，`LANGC` 映射）取自 GitHub linguist 色表 ——
`Rust #dea584`、`Python #3572A5`、`JavaScript #f1e05a`、`C++ #f34b7d`、`C #8b8b8b` 等。
**它只用于数据可视化，不参与 UI 语义**，因此不受「蓝=可点击」约束。

**对比度要求**：`--dim` 在 `--card` 上 ≥ 4.5:1（AA）。
Light 模式下 `--acc` / `--ok` 是深色，所以 `.btn.pri` / `.btn.play` 的文字必须翻成白色
（Dark 模式反过来是 `#0d1117`）—— 这是唯一需要按主题切换文字色的地方，用 `--on-acc` 承载。

### `guide.html` 用的是另一套变量名 ⚠️

`guide.html` 是独立的「文档式」页面，变量名与色值都与仪表盘不同：

| 仪表盘 | guide.html | Dark 值 |
|---|---|---|
| `--main` | `--bg` | `#212121` vs `#0d1117` |
| `--card` | `--bg2` | `#2f2f2f` vs `#161b22` |
| `--card2` | `--bg3` | `#383838` vs `#21262d` |
| `--edge` | `--border` | `#ffffff1a` vs `#30363d` |
| `--fg` | `--text` | `#ececec` vs `#e6edf3` |
| `--dim` | `--muted` | `#a3a3a3` vs `#8b949e` |
| `--acc` | `--blue` | `#58a6ff` **（同值）** |
| `--ok` | `--green` | `#3fb950` **（同值）** |
| — | `--purple` | `#bc8cff`（仅用于 `h1` 渐变） |

**两页语义角色一一对应，但色值不统一**（已知偏差，见 §10）。
改 `guide.html` 时用它的变量名，**不要混用** —— 混了不会报错，只会悄悄变成透明/继承色。

---

## 3. Typography Rules

**字体栈**（无外部字体请求，纯系统字体）：

```css
font-family: "Segoe UI", "Noto Sans SC", system-ui, sans-serif;
```

中文走 `Noto Sans SC`，Windows 上回落到 `Segoe UI` 的 CJK 回退 —— 因此**不依赖任何 webfont**。

| 层级 | 字号 | 字重 | 行高 | 用途 |
|---|---|---|---|---|
| `h1` | `1.45rem` | 600 | 1.3 | 视图标题（`#view-title`） |
| `.hcard h2` | `1.08rem` | 600 | 1.35 | 精选 / 研究卡片标题 |
| `.sec-title` | `.95rem` | 600 | 1.4 | 段内小标题 |
| `.rcard h3` | `.9rem` | 600 | 1.4 | 仓库卡片标题 |
| `.tagline` | `.9rem` | 400 | 1.5 | 副标题（`--dim`） |
| `.hcard p` | `.87rem` | 400 | **1.65** | 卡片正文 |
| `.rcard p` | `.79rem` | 400 | 1.5 | 仓库描述，`min-height:2.2em` 对齐卡片底 |
| `.nav-item` | `.88rem` | 400 | 1 | 侧栏导航 |
| `.tag` | `.72rem` | 400 | 1 | 标签胶囊 |
| `.lang` | `.74rem` | 400 | 1 | 语言筛选 |
| `.meta` | `.72rem` | 400 | 1 | ★ / push 日期 |
| `.nav-sec` | `.7rem` | 400 | 1 | 侧栏分组小标签（唯一用 `letter-spacing:.05em` 的地方） |
| `footer` | `.76rem` | 400 | 1.7 | 页脚 |
| `.site-foot` | `.78rem` | 400 | 1.6 | `guide.html` 页脚 |

**规则**
- 字重只用 400 与 600，**没有 500/700** —— 避免中文粗体在 Windows 上糊成一团。
- 正文行高 ≥ 1.5，长段落 1.65。
- 不使用 `letter-spacing`（中文不需要），例外：`.nav-sec` 的 `.05em` 小标签。
- 数字（星数、日期、体积）**不做等宽处理**，保持与正文一致。

---

## 4. Component Stylings

### 卡片 `.hcard`（精选 / 研究）
```
背景 var(--card) · 描边 1px var(--edge) · 圆角 14px · padding 1.2rem 1.3rem · margin-bottom .9rem
```
内部：`.hhead`（34px 圆角 logo + 标题 + 标签）→ `p`（正文）→ `.btns`（按钮行）。

### 卡片 `.rcard`（全部仓库）
```
背景 var(--card) · 描边 1px var(--edge) · 圆角 12px · padding .9rem 1.05rem
```
网格 `minmax(290px,1fr)`。底部 `.meta` 一行：语言色点 + ★ + push 日期。

### 应用磁贴 `.sapp`
```
背景 var(--card) · 描边 1px var(--edge) · 圆角 12px · padding .85rem 1rem
hover → var(--card2)
```
网格 `minmax(170px,1fr)`。26px logo + 名称 + 一行描述。

### 按钮 `.btn`
| 变体 | 背景 | 文字 | 何时用 |
|---|---|---|---|
| `.btn`（默认） | 透明 | `--fg` | 次要动作 |
| `.btn.pri` | `--acc` | `var(--on-acc)` | **该卡片最主要的动作**（通常是第一个 link） |
| `.btn.play` | `--ok` | `var(--on-acc)` | 链接文字含「玩」时自动套用 |

圆角 `10px`，padding `.42rem .85rem`，字号 `.8rem`。
`.btns` 用 `flex-wrap` + `gap .5rem`，**永不换行溢出**。

### 标签 `.tag`
```
背景 var(--tagbg) · 描边 1px var(--edge) · 文字 var(--acc) · 圆角 14px · padding 2px 10px · 字号 .72rem
```
非交互。一行内 `margin:2px 4px 2px 0`。
底色必须走 `--tagbg` —— 写死 `#ffffff0d` 在浅色主题下等于没有底色。

### 语言筛选 `.lang`
胶囊按钮，未选中 `--dim` + `--edge` 描边；选中 `.on` → `--acc` 文字与描边。

### 导航项 `.nav-item`
```
padding .55rem .7rem · 圆角 10px · 文字 var(--dim) · 字号 .88rem
hover / .on → 背景 var(--card)，文字 var(--fg)
role="button" + tabindex="0" + Enter/Space（由 JS 注入，见 §8）
```
左侧 `.ic` 固定宽 `1.1rem` 对齐图标。

### 侧栏分组标签 `.nav-sec`
`display:flex` + `justify-content:space-between`：左侧分组名，右侧一个 `--dim` 的跳转链接
（例：「快速入门　全部 →」）。链接 hover 转 `--acc`，**去掉下划线**。

### 侧栏仓库项 `.side-repo`
```
padding .45rem .7rem · 圆角 8px · 字号 .8rem · 单行 ellipsis
role="button" + tabindex="0"
```

### 输入框 `.side-search`
```
背景 var(--card) · 无描边 · 圆角 10px · padding .5rem .7rem · 字号 .83rem
type="search"（自带清除按钮）· aria-label="搜索仓库"
:focus → 描边 var(--acc)
```

### 页脚
仪表盘 `.main-inner` 内一个 `<footer>`：一行说明 + `.flinks`（`flex-wrap` + `gap .3rem 1.1rem`）。
`guide.html` 用 `.site-foot`：同样的 `max-width:880px` 居中，`border-top` 分隔，链回首页与设计规范。

### 空态 `.empty`
`--dim`，padding 1rem，字号 .85rem。文案必须**说人话**（例：「无匹配仓库」而不是 `No results`）。

---

## 5. Layout Principles

**骨架**：`body` 是 flex 行 —— 固定宽侧栏 + 可滚动主区。

```
┌──────────────┬───────────────────────────────┐
│ <nav>        │ main (overflow-y:auto)        │
│ 264px 固定   │  padding 2rem 2.4rem 3rem     │
│              │  ┌─ .main-inner ──────────┐   │
│ logo         │  │ max-width 860px 居中   │   │
│ 搜索框       │  │ topbar → 视图          │   │
│ 4 个 nav-item│  │ …                      │   │
│ ─ 快速入门   │  │ <footer> + .flinks     │   │
│ 8 个 side-   │  └────────────────────────┘   │
│   repo       │                               │
│ ─ side-foot  │                               │
│  (3 个外链)  │                               │
└──────────────┴───────────────────────────────┘
```

| 项 | 值 |
|---|---|
| 侧栏宽 | `264px`，**固定不收缩**（`min-width` 同值） |
| 内容最大宽 | `860px`，`margin-inline:auto` —— 大屏不拉满，保持阅读行长 |
| 主区 padding | `2rem 2.4rem 3rem`（移动端 `1.2rem 1.1rem 2rem`） |
| 卡片网格 | `.grid` → `minmax(290px,1fr)`；`.subapps` → `minmax(170px,1fr)` |
| 卡片间距 | `.9rem`（纵向）/ `.8rem`（网格 gap） |
| 滚动 | **只有 `main` 滚**（`body { overflow:hidden }`），侧栏独立 `overflow-y:auto` |

**间距刻度**：`.2 .3 .4 .5 .6 .7 .8 .9 1 1.2 1.3 1.6 2 2.4 3 rem`
（`rem` 而非 `px`，跟随用户字号设置 —— 这是无障碍的一部分）

**留白哲学**：宁可少放一个卡片，也不压缩间距。内容区永远留出底部 `3rem`。

---

## 6. Depth & Elevation

**这个系统不用阴影。** 层次靠两件事表达：

1. **背景色阶** —— `--sidebar`(#171717) 比 `--main`(#212121) 暗，`--card`(#2f2f2f) 比 `--main` 亮。
   三层已经足够区分「导航 / 画布 / 内容」。
2. **1px 描边** —— `var(--edge)`（白 10% / 黑 8%），把卡片从背景里「切」出来。

| 层级 | 表面 | 表达 |
|---|---|---|
| 0 导航 | `--sidebar` | 最暗，靠右描边与主区分离 |
| 1 画布 | `--main` | 基础底 |
| 2 内容 | `--card` + `--edge` 描边 | 卡片 |
| 3 交互反馈 | `--card2` | hover 加深 |

**禁止**：`box-shadow`、`filter: drop-shadow`、多层模糊玻璃。
（理由：深色背景下阴影几乎不可见，只会增加渲染成本与视觉噪音。想强调就用描边 + 背景阶。）

---

## 7. Do's and Don'ts

### Do
- ✅ **颜色一律走 token**（`var(--acc)`），组件里不出现硬编码十六进制（`LANGC` 数据色除外）
- ✅ 卡片标题是 `<h2>` / `<h3>`，保持标题层级连续
- ✅ 外部链接一律 `target="_blank"` + `rel="noopener"`（GitHub 上的链接尤其）
- ✅ 站内相对链接**相对于文件所在目录**写（`/lyco/pad/` 在 `lyco/index.html` 里要写成 `pad/`）
- ✅ 空态、错误态写中文人话
- ✅ 图片带 `width`/`height` 属性（防布局抖动）与 `alt`
- ✅ 新增 logo 时沿用「圆角矩形 + 两字母缩写」风格（见 `assets/logos/*.svg`）
- ✅ 每个页面 `<head>` 都要有：`<meta name="color-scheme" content="dark light">`、
  `<meta name="description">`、`<link rel="icon" href="assets/logos/brand.svg" type="image/svg+xml">`
- ✅ 可点击但非 `<a>`/`<button>` 的元素（`.nav-item` `.side-repo`）必须给
  `role="button"` + `tabindex="0"` + Enter/Space 处理

### Don't
- ❌ 不要把 `--acc` 用在**既非交互、也非标签**的文字上（它是强调色，不是装饰色）
- ❌ 不要引入 webfont / CDN 资源 —— **本文覆盖的三个页面**（`index.html` / `guide.html` / `design.html`）
  零外部请求（唯一例外是运行时拉 GitHub API 填仓库列表）。
  ⚠️ `/lyco/*` 子应用**不受此约束**（`ffmpeg.wasm` 的 core 就走 unpkg CDN），
  它们是各自独立构建的第三方移植，不要拿这条去"修"它们
- ❌ 不要用 `box-shadow` 做层次
- ❌ 不要给卡片加大圆角（> 14px）或彩色边框
- ❌ 不要在 `index.html` 里写死会过期的数字（星数走自动同步 workflow，版本链接用 `releases/latest`）
- ❌ 不要用 `per_page=100` 单次拉取仓库列表（会静默截断，必须循环分页）
- ❌ 不要把 `div` 当按钮用而不给键盘支持
- ❌ 不要写死 `background:#ffffff0d` 这类「只在深色下成立」的透明色 —— 走 `--tagbg` 之类的 token

---

## 8. Responsive Behavior

**唯一断点：`860px`。**

| 宽度 | 行为 |
|---|---|
| > 860px | 侧栏常驻左侧 264px；内容区居中 860px |
| ≤ 860px | 侧栏 `position:fixed` + `transform:translateX(-100%)` 移出屏幕；`.burger-btn` 出现；`.main` padding 收窄 |

**侧栏抽屉**：`.sidebar.open` → `translateX(0)`，`transition: transform .2s`。

**移动端额外要求（友好性）—— 已在 `≤860px` 内实现**
- 触摸目标高度：`.nav-item` `min-height:44px`；`.side-repo` / `.side-foot a` `min-height:40px`；
  `.lang` `min-height:34px`；`.burger-btn` padding 加大到 `.5rem .75rem`
- 抽屉打开时点导航项要**自动关闭**（`switchView` 里已经 `classList.remove("open")`）
- 汉堡按钮 `.burger-btn` 只在 ≤860px 显示

**动效偏好**：`@media (prefers-reduced-motion: reduce)` 下 `transition` / `animation` 全部置 `none`。

**主题偏好**：`@media (prefers-color-scheme: light)` 覆盖 §2 的变量。两个媒体查询都必须保留。

**焦点可见**：全局 `:focus-visible { outline:2px solid var(--acc); outline-offset:2px }`。
**不要**用 `outline:none` 抹掉焦点环 —— 键盘用户会完全失去位置感。

**切换视图时回顶**：`switchView()` 里 `document.querySelector(".main").scrollTop = 0`，
否则从长列表切到短视图会停在半空中。

**侧栏「快速入门」列表的单一事实来源**：从 `FEATURED` 里**卡片自带的 `guide.html?name=` 链接**推导，
不要另建一份名单。卡片有入口 → 侧栏才列；这样永远不会出现「侧栏有、点进去没有」。

---

## 9. Agent Prompt Guide

**给 AI agent 的速用提示词：**

> 在 `lilyco-42.github.io` 里新增一个页面。严格遵守 `DESIGN.md`：
> 用 `:root` 里的 CSS 变量，不硬编码颜色；卡片用 `--card` 底 + `1px var(--edge)` 描边 + 12~14px 圆角；
> 不加 `box-shadow`；`--acc` 只用于可点击元素与 `.tag` 标签；正文行高 ≥1.5；中文文案；
> 支持 `prefers-color-scheme: light` 与 `prefers-reduced-motion`；
> 移动端（≤860px）触摸目标 ≥44px；页面零外部请求；
> `<head>` 带 `color-scheme` / `description` / `brand.svg` favicon；
> 所有非 `<a>`/`<button>` 的点击目标补 `role="button"` + `tabindex="0"` + Enter/Space。

**常用 token 速查**

```css
/* 背景 */   var(--sidebar) var(--main) var(--card) var(--card2)
/* 文字 */   var(--fg)  var(--dim)
/* 交互 */   var(--acc) var(--ok)
/* 描边 */   var(--edge)
```

**常用片段**

```html
<!-- 内容卡片 -->
<div class="hcard">
  <div class="hhead">
    <img class="hlogo" src="assets/logos/NAME.svg" alt="NAME" width="34" height="34">
    <div class="hbody"><h2><a href="https://github.com/lilyco-42/NAME">NAME</a></h2>
      <div class="tags"><span class="tag">标签</span></div></div>
  </div>
  <p>一句话说清它解决什么问题。</p>
  <div class="btns"><a class="btn pri" href="https://github.com/lilyco-42/NAME" target="_blank" rel="noopener">GitHub →</a></div>
</div>
```

```css
/* 新组件的骨架：照抄，别自创 */
.newthing {
  background: var(--card);
  border: 1px solid var(--edge);
  border-radius: 12px;
  padding: .9rem 1.05rem;
  color: var(--fg);
}
.newthing:hover { background: var(--card2); }
```

**改文件前必做**
1. `node --check` 校验内嵌 `<script>`（改字符串里的 `\n` 极易破坏语法）
2. 用浏览器桩（`location` / `document`）实跑一遍求值，确认数据条数与结构
3. 检查所有 `assets/logos/*.svg` 引用真实存在
4. 确认新增的站内链接与图片 URL 都 200
5. 字节级改文件时断言「**行尾风格不变**」（不是「行数不变」——补表格本来就要加行）

---

## 10. 偏差与修订记录

本文件描述**现状**，不是理想态。下表分两部分：已修掉的、仍存在的。

### 已修正（2026-09-23）

| 项 | 原状 | 现状 |
|---|---|---|
| 侧栏「快速入门」列表 | 由 `FEATURED` 的 **15** 项生成，其中 7 项点进去只有「选择项目」页 | 改为从卡片自带的 `guide.html?name=` 链接推导 → **正好 8 项**，与 `guide.html` 的 `GUIDES` 键一一对应 |
| 导航项键盘可达 | `.nav-item` 是 `div` + `onclick`，Tab 键够不到 | JS 注入 `role="button"` + `tabindex="0"` + Enter/Space；切换时同步 `aria-current` |
| 浅色主题 | 只声明了深色；`.tag` 底色写死 `#ffffff0d`（浅色下等于没底色）、按钮文字写死 `#0d1117`（浅色下白底深字看不清） | 补 `@media (prefers-color-scheme: light)`；新增 `--on-acc` / `--tagbg` 两个 token 承载这两个「必须随主题翻转」的值 |
| 焦点可见 | 没有焦点样式，键盘用户看不到自己在哪 | 全局 `:focus-visible` 焦点环 |
| 动效偏好 | 未响应 `prefers-reduced-motion` | 已加，取消全部 transition/animation |
| 移动端触摸目标 | `.nav-item` 约 34px、`.side-repo` 约 30px，低于 44px | `≤860px` 下分别 `min-height:44px` / `40px` |
| 语义与元信息 | `<aside>` 无标签；搜索框无 `aria-label`；无 favicon / description / `color-scheme` | 改 `<nav aria-label="主导航">`；搜索框补 `type="search"` + `aria-label`；`<head>` 补齐三项 |
| 页面间无互链 | `guide.html` 与仪表盘互不相通，也没有任何地方链到设计规范 | 仪表盘页脚 + 侧栏底部、`guide.html` 页脚均链到 `design.html` |
| 死代码 | `footer { … }` 样式存在但**页面上根本没有 `<footer>` 元素** | 补上真实页脚（说明行 + 5 个链接），死样式开始生效 |

### 仍存在的偏差

| 项 | 现状 | 建议 |
|---|---|---|
| `guide.html` 的色值 | 与仪表盘是两套（`--bg:#0d1117` vs `--main:#212121`），语义角色对应但色值不同，见 §2 | 若要统一，把 `guide.html` 的 9 个变量换成仪表盘那套值即可；**未做**，因为那是一次可见的重配色 |
| `.tag` 用强调色 | 标签是非交互元素却用 `--acc` | 保留。已在 §1 哲学 #2 中把它明确为「强调色的合法用途」，避免规则自相矛盾 |
| `LANGC` 语言色 | 16 个十六进制值硬编码在 `index.html` | 属数据色（对齐 GitHub linguist），允许硬编码；但应在注释里写明来源 |
| 仪表盘深色是唯一默认 | `:root` 是深色，浅色靠媒体查询 | 无系统级手动切换开关（不给 `localStorage` 覆盖）。受众是开发者，跟随系统即可 |
| 精选项目排序 | 人工排序，不按星数 | **刻意如此**：15 项里有 8 项是 0 星，按星数排等于让尾部随机，还会打散主题分组 |
| 仪表盘只展示 25 个仓 | 有 logo 的仓才进卡片；其余约 95 个只在「全部仓库」里以纯文本卡片出现 | 可接受；如需扩展，先补 logo 再进精选 |

### 修订须知

> 改本文件时请**同时**改 `index.html` 的 `:root` / `guide.html` 的 `:root` / `design.html`，
> 四处保持一致。`design.html` 是本文件的可视化版本，`DESIGN.md` 是给 agent 读的纯文本版。
