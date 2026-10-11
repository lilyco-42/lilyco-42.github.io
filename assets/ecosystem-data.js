// 自动生成，请勿手改 —— 改 scripts/ecosystem-map.json 后跑 node scripts/gen-ecosystem.mjs
// 数据源：GitHub API users/lilyco-42/repos（非 fork、公开），生成于 2026-10-11
// 校验：分组总和 = 125 = 非 fork 公开仓数；名称唯一；URL 由名称推导
const ECOSYSTEM = {
  "asOf": "2026-10-11",
  "totals": { "repos": 125, "langs": 18, "stars": 77, "groups": 10 },
  "groups": [
    {
      "key": "core", "title": "框架与基础层", "note": "一个 struct 出四端的底座、脚手架、共享模块与协议",
      "repos": [
        {"n":"lilyco","l":"Rust","s":6,"p":"2026-10-11","d":"一个 struct 派生 CLI/TUI/Web/MCP 四端，天生 AI-callable；已发布 crates.io","g":true},
        {"n":"lyco-engine","l":"Rust","s":3,"p":"2026-09-21","d":"WASM 视觉小说引擎 + 资源流式后端，浏览器即玩","g":true},
        {"n":"Lazy-UI","l":"Rust","s":2,"p":"2026-09-29","d":"基于 plyx 的跨平台原生 UI 框架：组件、主题、国际化与无障碍"},
        {"n":"dev-env","l":"Nushell","s":1,"p":"2026-07-31","d":"nushell 跨平台一键开发环境搭建：单文件自解压，无需 pwsh / bash 双份脚本"},
        {"n":"xmake-mirror","l":"Xmake","s":0,"p":"2026-10-10","d":"Lyco WebView 的 xmake 包镜像"},
        {"n":"lf","l":"Rust","s":0,"p":"2026-10-10","d":"轻量系统识别 + 跨平台 shell 环境安装器（nushell / brush）"},
        {"n":"cache-node","l":"Rust","s":0,"p":"2026-10-10","d":"zerostack 节点网格：sha256 内容寻址 KV + 节点间 P2P 同步"},
        {"n":"mpkg-registry","l":"Python","s":0,"p":"2026-10-10","d":"mpkg 记忆包注册表 —— 学习一次，所有 agent 复用（内容寻址、可回放验证）"},
        {"n":"ly_motion","l":"Rust","s":0,"p":"2026-10-10","d":"Rust 动效引擎：素材运动、骨骼绑定、类 manim 的声明式出片"},
        {"n":"lyco-router","l":"Rust","s":0,"p":"2026-10-02","d":"按需服务路由器：平时零占用，有人连才拉起后端，空闲即停"},
        {"n":"lystack","l":"Python","s":0,"p":"2026-09-28","d":"零边际成本 AI 能力栈：记忆包协议 + 视频知识蒸馏 + 节点网格 + 记忆市场"},
        {"n":"shared","l":"Python","s":0,"p":"2026-09-06","d":"PyWebView 共享模块（sponsor 等）"},
        {"n":"lyco-cli","l":"Rust","s":0,"p":"2026-08-11","d":"gh api 拉模板 + 声明式渲染的多语言脚手架","g":true},
        {"n":"kolo","l":"Rust","s":0,"p":"2026-05-21","d":"一个 JSON 工具，作者自用于 Zed"},
      ]
    },
    {
      "key": "ai", "title": "AI 工具链与 Agent", "note": "把 Agent 接进工作流：技能、MCP、端侧模型与训练/评测",
      "repos": [
        {"n":"dsh-termux","l":"Shell","s":20,"p":"2026-10-03","d":"Termux 上一键装好 DeepSeek DSH CLI，顺手修掉 7 个 Android 兼容问题"},
        {"n":"lyco-skill","l":"Shell","s":11,"p":"2026-10-10","d":"预研技能：需求钉死一句话 → gh 近义词搜现成方案 → 论坛挖冷门知识 → build-vs-buy","g":true},
        {"n":"letsgal-ai","l":"JavaScript","s":4,"p":"2026-10-10","d":"LetsGal Studio 的 AI 创作工具链：故事 DSL 编译器 + 生成器 + CLI/MCP"},
        {"n":"qq-bot-rust","l":"Rust","s":0,"p":"2026-10-11","d":"Radxa ARM64 上的 QQ 机器人 + webhook 网关，带群图 OCR 视觉"},
        {"n":"bitnet-rs","l":"Rust","s":0,"p":"2026-10-10","d":"BitNet b1.58-2B 推理引擎，手机上 0.5s/token"},
        {"n":"lyco-model-bench","l":"Rust","s":0,"p":"2026-10-10","d":"每日模型发现 + token 测速：NVIDIA NIM / OpenRouter 的供给变化与中文响应速度"},
        {"n":"lgame","l":"Rust","s":0,"p":"2026-10-10","d":"AI 控制实体的中间层：l3d / l2d 用 MCP/CLI 驱动 3D 与 2D 游戏角色，机器人是下一档位"},
        {"n":"dsh-tool-nu","l":"JavaScript","s":0,"p":"2026-10-10","d":"面向模型的 Nushell 工具，Windows 上的 bash 兼容层"},
        {"n":"dsh-tool-brush","l":"JavaScript","s":0,"p":"2026-10-10","d":"Rust 原生 brush shell：Windows 上跑满血 bash 语法"},
        {"n":"lyco-model","l":"Python","s":0,"p":"2026-09-30","d":"模型评测报告与可复现实验脚本：RAG / OODA / 投毒 / 声明核验"},
        {"n":"lyco_agent","l":"Rust","s":0,"p":"2026-09-28","d":"能学视频与 CLI 手册的本地 agent：工具调用 + 诚实降级 + 运行时学习"},
        {"n":"apple-keynote-skill","l":"HTML","s":0,"p":"2026-09-22","d":"Apple Keynote 风格的宣传片生成技能"},
        {"n":"lyco_chat","l":"Rust","s":0,"p":"2026-09-21","d":"从零写的纯 Rust Transformer：BitNet 1.58-bit + 双 MoE，220 个测试","g":true},
        {"n":"blender-game-pipeline-experts","l":"Python","s":0,"p":"2026-09-06","d":"Blender 游戏资产管线专家包：低模拓扑 + PBR 烘焙 + 骨骼动画"},
        {"n":"lucky-star-mcp","l":"Go","s":0,"p":"2026-08-10","d":"LuckyStar / LS_KTool Android 内存调试栈的 MCP 插件"},
        {"n":"rev-tools-setup","l":"Python","s":0,"p":"2026-08-07","d":"逆向工具链一键装（scoop + Cheat Engine MCP），附踩坑指南"},
        {"n":"zerostack-launchpad","l":"Rust","s":0,"p":"2026-08-05","d":"AI 自主循环开发平台：无人值守地写码 → 测试 → 提交，带 Web 监控面板"},
      ]
    },
    {
      "key": "wasm", "title": "浏览器内 WASM", "note": "把重活搬进浏览器，且每一步都留可核对的数字",
      "repos": [
        {"n":"rembg-ui","l":"HTML","s":8,"p":"2026-10-11","d":"抠图工具：浏览器本地处理 + Android 原生端（arm64/armv7/x86_64）"},
        {"n":"clings","l":"C","s":3,"p":"2026-10-10","d":"C 语言练习，配浏览器内的 WASM 编译器"},
        {"n":"cute-pet","l":"Rust","s":1,"p":"2026-10-10","d":"丛雨桌宠：跨平台悬浮桌宠，WASM 版即开即玩","g":true},
        {"n":"stemscan","l":"Rust","s":0,"p":"2026-10-10","d":"判断一首歌是纯器乐还是人声+伴奏：音源分离 + 100ms 分帧能量统计"},
        {"n":"android-wasm-lab","l":"JavaScript","s":0,"p":"2026-10-10","d":"在 Android 模拟器里跑通浏览器版抠图并量化（冷启动 9.5s / 峰值 119MB）"},
        {"n":"wasm-pixel-kernels","l":"Rust","s":0,"p":"2026-10-10","d":"65 个 PS/AE 像素算子编成单个 55KB wasm，CI 里与 JS 参考实现做数值对照"},
        {"n":"wasm-binary-formats","l":"Rust","s":0,"p":"2026-09-21","d":"APK 解包 + 1826 项格式编目，逐级标注可实现性"},
      ]
    },
    {
      "key": "app", "title": "桌面与端侧应用", "note": "Windows / Android / iOS 上能直接跑起来的东西",
      "repos": [
        {"n":"ghboost","l":"Rust","s":2,"p":"2026-10-02","d":"Windows 托盘加速工具：一键开关 Google / YouTube / GitHub，客户端永久免费开源"},
        {"n":"termux-android-dev-ndk-sdk","l":"Shell","s":2,"p":"2026-08-01","d":"Termux 上的 Android 开发 NDK / SDK 支持"},
        {"n":"ncmdump-android","l":"C++","s":2,"p":"2026-05-02","d":"解密网易云 .ncm 的 Android APK"},
        {"n":"rust-android-template","l":"Kotlin","s":1,"p":"2026-09-23","d":"Rust + Kotlin Android 项目模板：JNI + Compose，零硬编码路径"},
        {"n":"mirage-tank","l":"Kotlin","s":1,"p":"2026-09-23","d":"制造「不同背景显示不同内容」的错觉图"},
        {"n":"MyRustApp","l":"Kotlin","s":1,"p":"2026-06-02","d":"Rust + Jetpack Compose 混合开发示例（JNI 桥接）"},
        {"n":"character-theme-kit","l":"HTML","s":0,"p":"2026-10-10","d":"101 个动漫角色桌面主题套件：光标、壁纸、UI 组件"},
        {"n":"lyco-app","l":"Python","s":0,"p":"2026-10-10","d":"Lyco AI 伴侣：端侧 GGUF，权限扩展（位置 → POI → 评价）"},
        {"n":"simul-overlay","l":"Python","s":0,"p":"2026-10-10","d":"全离线同声传译：sherpa-onnx ASR + Argos NMT + Tauri 字幕悬浮"},
        {"n":"codex-reset-reminder","l":"Rust","s":0,"p":"2026-10-10","d":"Codex 额度重置提醒器：Tauri 2，覆盖 Windows/Linux/macOS/Android/iOS"},
        {"n":"mc-webview-shell","l":"C++","s":0,"p":"2026-10-10","d":"23KB 极简 C WebView2 外壳，Windows 上的 Android 式薄封装"},
        {"n":"webview-capi","l":"C++","s":0,"p":"2026-10-10","d":"WebView2 C API：17 个导出函数，ctypes / cgo / FFI 都能绑","g":true},
        {"n":"lyco-jev","l":"Kotlin","s":0,"p":"2026-10-02","d":"端侧 Jev-Style-0.8B 判定 + OCR/YOLO 视觉的门控自动回复"},
        {"n":"lilyco-approve","l":"Kotlin","s":0,"p":"2026-09-23","d":"Android 应用（Kotlin，含 aichat 模块；仓库暂无说明）"},
        {"n":"webview-mini","l":"C++","s":0,"p":"2026-09-23","d":"极小 WebView2 封装：单头文件 200KB、STL-free、xmake 一键构建","g":true},
        {"n":"meowcat_app","l":"C++","s":0,"p":"2026-08-29","d":"喵喵召唤术 —— 猫咪语音召唤 app"},
        {"n":"apkgen-md3","l":"Shell","s":0,"p":"2026-08-09","d":"apkgen → Material 3 Android 脚手架：一次性脚本 + 可复用技能"},
        {"n":"arm-android-test","l":"其他","s":0,"p":"2026-08-02","d":"ARM64 / Termux 上的离线 APK 构建流水线与工具链配置指南"},
        {"n":"monitor","l":"Kotlin","s":0,"p":"2026-07-02","d":"Android 摄像头画面监控与控制（技能竞赛题目实现）"},
        {"n":"web2app","l":"HTML","s":0,"p":"2026-05-22","d":"把任意静态网页项目转成独立桌面应用，零运行时依赖"},
        {"n":"web-packager","l":"C++","s":0,"p":"2026-05-06","d":"把 HTML/CSS/JS 打包成独立 Windows 桌面应用（WebView2）"},
        {"n":"exe-encryption-toolkit","l":"C","s":0,"p":"2026-05-05","d":"EXE 加密工具套件：AES-256-CBC + 硬件绑定许可证"},
        {"n":"quote-replacer","l":"Rust","s":0,"p":"2026-04-14","d":"字符替换工具：中英文标点互转"},
      ]
    },
    {
      "key": "media", "title": "媒体与创作管线", "note": "从素材到成片的自动化：剪辑、字幕、配音、IP 资产",
      "repos": [
        {"n":"vp-publish","l":"Python","s":1,"p":"2026-10-10","d":"一键上传视频到十余个平台（抖音/小红书/B站/YouTube…），social-auto-upload 的编排层"},
        {"n":"radxa_utlra","l":"Python","s":1,"p":"2026-09-28","d":"A7A 自动剪视频 + 自动部署 + GitHub Action 自动发视频"},
        {"n":"happy-sugar-life-live2d","l":"Python","s":0,"p":"2026-10-10","d":"AI 立绘 → 可循环真骨骼动画的全流程：分层、绑定、动画与坑记录"},
        {"n":"lyco-ip","l":"Python","s":0,"p":"2026-10-10","d":"LYCO 原创角色 IP 资源库：设计资产、配色指南、形象与挂件规范"},
        {"n":"vp-pipeline","l":"Python","s":0,"p":"2026-09-27","d":"A7A 全自动短视频生产线"},
        {"n":"lilyco-brand","l":"HTML","s":0,"p":"2026-09-24","d":"品牌资产 + 确定性 HTML→视频管线（Blossom promo 等）"},
        {"n":"mainm","l":"Python","s":0,"p":"2026-09-21","d":"一个命令从零产出成片：模板优先、约定大于配置的视频编排 CLI"},
        {"n":"acgn-studio","l":"Python","s":0,"p":"2026-07-20","d":"明日方舟干员数据平台：449 名干员的立绘 / 语音搜索与下载"},
        {"n":"lyco-whisper","l":"其他","s":0,"p":"2026-06-08","d":"本地视频字幕生成工具"},
        {"n":"subtitle-tool","l":"Python","s":0,"p":"2026-05-10","d":"跨平台视频字幕工具：faster-whisper 识别 + FFmpeg 字幕嵌入"},
        {"n":"whisper-subtitle-tool","l":"Python","s":0,"p":"2026-05-09","d":"faster-whisper + maliang 的音频转字幕 GUI，输出 SRT"},
      ]
    },
    {
      "key": "hw", "title": "自托管 · 硬件 · 服务", "note": "Radxa 单板机、局域网、常驻服务与端侧运维",
      "repos": [
        {"n":"lain42","l":"TypeScript","s":1,"p":"2026-06-04","d":"配置分享平台（dotfiles / ricing 的 Pinterest）：FastAPI + gRPC + Rust TUI 客户端"},
        {"n":"lytrade","l":"Python","s":0,"p":"2026-10-10","d":"模拟交易策略引擎：只读行情 + 资讯热度过滤 + SQLite 虚拟撮合"},
        {"n":"lysource","l":"Python","s":0,"p":"2026-10-10","d":"定时抓取可靠信息源 → 可信度评分整合 → HTTP API 自动化请求服务"},
        {"n":"minecraft","l":"C","s":0,"p":"2026-10-10","d":"Windows 一键 Radxa Minecraft 服务器管理器：mDNS/ARP 发现 + SSH 远程"},
        {"n":"awesome-radxa-a733","l":"其他","s":0,"p":"2026-10-10","d":"A733 板端「什么真的能用」的实测索引：内核 / NPU / GPU / VPU 逐项状态"},
        {"n":"radxa-commander","l":"Java","s":0,"p":"2026-10-10","d":"A7A 路由器手机管家：WiFi / 设备 / 分流全套控制 App + 板端 API"},
        {"n":"a7a-npu-cli","l":"Python","s":0,"p":"2026-09-27","d":"A733 NPU 统一 CLI 工具箱"},
        {"n":"radxa-monitor","l":"Java","s":0,"p":"2026-09-21","d":"A7A 局域网监控：Android APK（mDNS+SSH）+ 板端 nginx 状态页"},
        {"n":"lly","l":"Rust","s":0,"p":"2026-09-19","d":"Radxa 工具包（lilyco 框架封装）：EdgeTTS 语音合成 / Whisper 转写 / 统一文件处理"},
        {"n":"mc-server-controller","l":"Python","s":0,"p":"2026-09-01","d":"Minecraft 服务器 Web 控制器：FastAPI + WebSocket"},
        {"n":"android_proc_tool","l":"Rust","s":0,"p":"2026-06-25","d":"Linux / Android /proc 内省工具"},
        {"n":"Lunar","l":"C","s":0,"p":"2026-05-27","d":"ESP32-C3 多传感器仪表盘（BH1750 / INA219 / DHT11 / OLED）"},
        {"n":"Lyco","l":"Rust","s":0,"p":"2026-05-21","d":"局域网 IP 扫描 / 端口嗅探 / 局域网聊天"},
        {"n":"Serial","l":"Zig","s":0,"p":"2026-05-14","d":"Zig capy-template 试验 —— zig build 在 Windows 跑不通，作者已放弃"},
        {"n":"red_ice","l":"Rust","s":0,"p":"2026-04-19","d":"Rust IoT 传感平台，带设备控制"},
      ]
    },
    {
      "key": "research", "title": "预研 · 知识 · 故障实录", "note": "preflight 输出而非实现：可审计的数字 + 写清做不到的边界",
      "repos": [
        {"n":"WSL2-Linux-Kernel","l":"C","s":3,"p":"2026-07-01","d":"WSL2 内核头文件"},
        {"n":"claude-max-antiban-guide","l":"其他","s":0,"p":"2026-10-10","d":"Claude Max 防封教程（匿名化整理稿），开头即声明其灰色地带与风险"},
        {"n":"chatgpt-desktop-proxy-fix","l":"PowerShell","s":0,"p":"2026-10-10","d":"ChatGPT 桌面版 Reconnecting 修复：Codex 后端不读系统代理，改走环境变量"},
        {"n":"zed-xmake-guide","l":"Lua","s":0,"p":"2026-10-10","d":"Zed + xmake + Windows + clangd 配置：自动生成 compile_commands.json 止住假报错"},
        {"n":"xiaomi-r3gv2-pppoe-1603","l":"其他","s":0,"p":"2026-10-10","d":"R3Gv2 PPPoE 拨号失败故障实录：对照实验 + 错误码辨析 + 6 个诊断方案"},
        {"n":"cimgui-notes","l":"其他","s":0,"p":"2026-10-10","d":"cimgui 学习笔记：Obsidian 双向链接知识库（API 分类、后端绑定、调用链）"},
        {"n":"rust-build-optimization","l":"Rust","s":0,"p":"2026-10-02","d":"Rust 编译速度与产物体积优化：Tauri target 4135MB→953MB 全实验归档"},
        {"n":"Local_tool_awesome","l":"其他","s":0,"p":"2026-09-27","d":"专注本地、离线、高效的工具索引"},
        {"n":"lyco-router-eval","l":"其他","s":0,"p":"2026-09-21","d":"端侧 0.6B 路由的 40 案例独立评测 —— 结论是够用，但得配拒答 + 白名单"},
        {"n":"fastapi-pywebview-guide","l":"其他","s":0,"p":"2026-07-20","d":"FastAPI + PyWebView 桌面应用开发与 Nuitka 打包指南"},
        {"n":"dev_android_env_in_windows","l":"其他","s":0,"p":"2026-07-01","d":"空仓（只登记了主题：Windows 上开发 Android 模块的坑）"},
      ]
    },
    {
      "key": "game", "title": "游戏与同人", "note": "《卫戍协议：盟约》与 Minecraft 相关的客户端、素材与运维",
      "repos": [
        {"n":"StrongholdProtocolClient","l":"JavaScript","s":1,"p":"2026-10-10","d":"《卫戍协议：盟约》桌面版 + Android 客户端，素材本地化，服务器只做联机（GPL-3.0）"},
        {"n":"stronghold-knowledge","l":"其他","s":0,"p":"2026-10-10","d":"卫戍协议知识增量库：群聊黑话、PRTS 来源索引与可验证答疑，每条标明出处 / 适用范围 / 置信度"},
        {"n":"zombie-raid","l":"Python","s":0,"p":"2026-10-10","d":"PVE 搜打撤（Lethal Company 风格），Godot 4.7，全平台 CI"},
        {"n":"lain42-stronghold-ops","l":"Python","s":0,"p":"2026-10-10","d":"低配 ECS 上跑 400+ 并发对局的运维改动集：FD 根因、WS 压缩、自愈 watchdog"},
        {"n":"sp-cdn-assets","l":"其他","s":0,"p":"2026-10-06","d":"《卫戍协议》v0.1.3 静态素材 CDN 源（334MB，GitHub Pages 分发）"},
        {"n":"fabric-mod-template","l":"Shell","s":0,"p":"2026-09-23","d":"Fabric 1.21.4 客户端 mod 模板：Mixin + 双语 lang + 初始化脚本"},
        {"n":"buried-treasure-finder","l":"Java","s":0,"p":"2026-09-21","d":"Fabric mod：手持藏宝图自动定位埋藏宝藏，渲染金色信标"},
        {"n":"tsukishita","l":"JavaScript","s":0,"p":"2026-05-22","d":"浏览器游戏：宝箱 / 道具 / 进度数据 + 音频素材，另含桌面版"},
      ]
    },
    {
      "key": "learn", "title": "学习与实验", "note": "Rust / C / Java 的练习、demo 与最小可运行实验",
      "repos": [
        {"n":"rust-guess","l":"Rust","s":1,"p":"2026-06-03","d":"Rust 全流程开发 demo：错误处理与开发流程"},
        {"n":"py_chat","l":"Python","s":0,"p":"2026-10-10","d":"Python socket 练习"},
        {"n":"study_rust","l":"其他","s":0,"p":"2026-10-10","d":"学 Rust：现代 AI 开发如何做项目"},
        {"n":"rust-std_ultra","l":"其他","s":0,"p":"2026-10-10","d":"学 Rust 标准库，并做常用工具的轻量化模块化"},
        {"n":"student_managent","l":"Rust","s":0,"p":"2026-08-30","d":"Rust axum + tokio 学生管理系统"},
        {"n":"demo_260624","l":"Rust","s":0,"p":"2026-06-24","d":"Rust demo"},
        {"n":"ak47","l":"Rust","s":0,"p":"2026-06-16","d":"词语分析器，带简单 UI 和 Web 界面"},
        {"n":"clap_todo","l":"Rust","s":0,"p":"2026-05-31","d":"clap 写的 todo"},
        {"n":"minigrep-cn","l":"Rust","s":0,"p":"2026-05-30","d":"minigrep 中文变量版"},
        {"n":"C","l":"其他","s":0,"p":"2026-05-20","d":"学习 C 语言"},
        {"n":"java-learning","l":"Java","s":0,"p":"2026-05-19","d":"Java 学习指南 & Zed 编辑器 Java 环境配置"},
        {"n":"zodiac-calculator","l":"Rust","s":0,"p":"2026-05-03","d":"星座计算器"},
      ]
    },
    {
      "key": "meta", "title": "元仓库与其他", "note": "本站、组织级配置与尚未归类的实验",
      "repos": [
        {"n":"lilyco-42","l":"其他","s":1,"p":"2026-10-07","d":"GitHub 个人主页 README（项目总览）"},
        {"n":"lilyco-42.github.io","l":"HTML","s":0,"p":"2026-10-11","d":"本站 —— 项目仪表盘与浏览器内工具"},
        {"n":"newland","l":"Python","s":0,"p":"2026-10-10","d":"GZ038 物联网应用开发赛项备赛资料库（2023 全国职业院校技能大赛）"},
        {"n":"Li","l":"Rust","s":0,"p":"2026-09-23","d":"让技术沉淀，让 AI 远离"},
        {"n":".github","l":"其他","s":0,"p":"2026-09-23","d":"组织级配置 —— 架构守则 reusable workflow"},
        {"n":"CampusHotspotFix","l":"C#","s":0,"p":"2026-07-04","d":"Windows 上不用路由器给其他设备提供 WiFi"},
        {"n":"github-trend-tracker","l":"HTML","s":0,"p":"2026-05-04","d":"GitHub Trending & Topics 追踪：Web UI / CLI / Electron 三种界面"},
      ]
    },
  ]
};

if (typeof module !== 'undefined' && module.exports) module.exports = ECOSYSTEM;
