# 考研打卡助手 / Kaoyan Check-in（燕燕考研助手）

面向考研备考的 **PWA 学习助手**：打卡、学习中心、AI 助手、错题中心、资料/网课、Web Push 提醒，支持离线访问与「添加到主屏」。

> **V7.0 是一次工程化重构**：把原先的单文件 PWA 升级为「可长期维护的学习产品工程」。
> 现役完整功能仍由 `index.html`（单文件应用）提供，**功能不变、UI 不变、数据不丢**；
> 同时引入 Vite + React + TypeScript 工程外壳、统一 storage/migration 层与完整文档，
> 为 V7.1 云同步铺路。详见 [ARCHITECTURE.md](./ARCHITECTURE.md) 与 [ROADMAP.md](./ROADMAP.md)。

## 核心功能
- 每日打卡
- 在职 / 全职备考阶段切换
- 今日任务
- 学习热力图
- 偏科预警
- 薄弱点笔记
- 词汇学习
- 数学练习
- 阅读训练
- 长难句训练
- 作文（AI 批改 + 范文 + 模板库）
- 错题中心（跨模块聚合 + 一键再练）
- 资料 / 网课管理
- AI 助手（DeepSeek 代理）
- PWA 离线访问
- Web Push 提醒

## 技术栈
- **Vite** —— 构建 / 开发服务器
- **React + TypeScript** —— V7.0 工程外壳与模块契约（渐进式接管现役 UI）
- **Netlify Functions** —— AI 代理 / Web Push 服务端
- **localStorage** —— 本地数据（V7.0 仍以本地为主，V7.1 计划云同步）
- **PWA / Service Worker / Web Push**
- **DeepSeek API**（仅服务端，密钥走环境变量）

## 目录速览
```
public/        manifest.json · sw.js · icon.svg（PWA 静态资源）
data/          静态学习内容库（words / reading / math / syntax / writing）
netlify/       Netlify Functions（AI 代理 + Web Push）
src/           V7.0 工程层（lib 基础设施 + modules 模块 + app 外壳）
index.html     现役单文件应用（生产入口，功能完整）
preview.html   React 工程外壳入口（模块化预览）
```
完整目录与模块职责见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 本地启动
```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器（Vite）
#  → http://localhost:5173/index.html   现役完整应用
#  → http://localhost:5173/preview.html React 工程外壳

npm run typecheck  # TypeScript 类型检查
npm run lint       # ESLint
npm run test       # Vitest（storage / migration 单测）
npm run build      # 生产构建到 dist/
npm run preview    # 本地预览 dist/
```

## 环境变量
复制 [.env.example](./.env.example) 为 `.env`（本地）或在 Netlify 后台配置。**绝不要把真实密钥提交进仓库。**

| 变量 | 用途 | 暴露范围 |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | DeepSeek 鉴权 | **仅服务端**（chat 函数） |
| `DEEPSEEK_API_BASE_URL` / `DEEPSEEK_MODEL` | DeepSeek 端点/模型 | 服务端 |
| `VAPID_PUBLIC_KEY` | Web Push 公钥 | 公钥可下发前端 |
| `VAPID_PRIVATE_KEY` | Web Push 私钥 | **仅服务端** |
| `VAPID_SUBJECT` | VAPID 联系方式 mailto: | 服务端 |
| `NETLIFY_SITE_ID` / `NETLIFY_AUTH_TOKEN` | CLI/CI 部署（可选） | 服务端 |
| `VITE_APP_NAME` / `VITE_APP_VERSION` | 前端可见配置（勿放密钥） | 前端 |

生成 VAPID 密钥：`npx web-push generate-vapid-keys`。

## 部署方式（两种模式）

### 模式 A：零构建静态部署（默认 · 推荐 · 无需 build 额度）
现役应用 `index.html` 是**自包含的纯静态单文件应用**，`data/`（含 5500 词库）、`manifest.json`、`sw.js`、`icon.svg` 都直接放在**仓库根目录**，无需任何构建即可运行。
- **GitHub Pages**：仓库 Settings → Pages → Source 选 `master` / `(root)`，即上线（免费、零构建）。
- **Netlify 拖拽 / 连接**：当前 [`netlify.toml`](./netlify.toml) 为 `publish = "."`、**无 build 命令**，连接仓库 push 即发布，不消耗构建额度。
- **本地 / 任意静态托管**：直接用任意静态服务器指向仓库根即可（如 `python -m http.server`）。
- 新增词库/题目只需改 `data/`，提交后刷新页面就生效——`index.html` 会动态读取 `data/words/index.json` 里的词库列表。

> 注意：AI 助手与 Web Push 依赖 Netlify Functions（服务端），零构建静态托管（如 GitHub Pages）下这两个功能不可用，其余（打卡 / 背单词 / 做题 / 错题 / 资料等本地功能）全部正常。

### 模式 B：Vite 构建（可选 · 需要 React 工程外壳时）
需要 `preview.html` 这个 React 工程外壳时，运行 `npm run build` 产出 `dist/`（插件会把 `data/` 与 PWA 文件一并拷入）。把 `netlify.toml` 的 build 改回 `command = "npm run build"` / `publish = "dist"` 即可走构建部署。

> 历史上还有一个 `_deploy/`（手动拖拽部署用的临时干净目录），已在 `.gitignore` 中忽略。

## PWA 使用说明
- **桌面端（Chrome/Edge）**：地址栏右侧「安装」图标 → 安装为应用。
- **Android**：浏览器菜单 →「添加到主屏幕 / 安装应用」。
- **iOS（Safari）**：分享 →「添加到主屏幕」。
  - iOS 限制：**Web Push 需 iOS 16.4+ 且必须先「添加到主屏」以独立 App 方式打开**；后台行为受系统约束；存储配额较保守。
- Service Worker（`public/sw.js`）提供 App Shell 离线缓存（HTML 走 stale-while-revalidate，其它资源 cache-first）。

PWA / Service Worker / Web Push 的注册、缓存策略与本地/生产差异，详见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 数据说明
- V7.0 仍以 **localStorage** 为主：现役应用使用 `kaoyan_v2`（数值版本链）。
- **统一数据源**：运行期单一真相来源为 `kaoyan_v2`；React 工程层经 `appStateStore` + `legacyAdapter` 把它投影为 `AppState` 读、并就地落回写，与现役 `index.html` 共用同一份数据（编辑互相可见，无分叉）。
- V7.0 **migration 层**：启动时从旧数据派生 `AppState` 信封（键 `ky_app_state_v7`，含 `userId`/`updatedAt`）并备份旧数据，作为**安全快照 / V7.1 云上传种子**（非运行期真相来源）。**迁移只读旧主状态，绝不破坏现役数据。**
- 所有新代码统一通过 **storage client** 读写，不散落直接调用 `localStorage`。
- V7.1 计划接入云同步（Supabase / Firebase / Neon 选型），实现打卡/错题/单词/阅读/AI 对话的多设备同步与恢复。详见 [ROADMAP.md](./ROADMAP.md)。

## 项目路线
见 [ROADMAP.md](./ROADMAP.md)（V7.0 重构 → V7.1 云同步 → V7.2 内容扩充 → V7.3 AI 调度 → V7.4 体验升级）。

## 开发规范
见 [CONTRIBUTING.md](./CONTRIBUTING.md)。变更记录见 [CHANGELOG.md](./CHANGELOG.md)。
