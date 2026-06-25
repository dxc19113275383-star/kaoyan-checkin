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

## 部署方式（Netlify）
1. 仓库已配置 [`netlify.toml`](./netlify.toml)：`command = "npm run build"`，`publish = "dist"`，`functions = "netlify/functions"`。
2. 在 **Site settings → Environment variables** 配置上表中的服务端变量。
3. 连接 GitHub 仓库后，push 到默认分支即自动构建部署；也可用 `npx netlify deploy --prod`。
4. `data/` 会在构建时由内联 Vite 插件拷贝进 `dist/data/`，运行期 `fetch('data/...')` URL 不变。

> 历史上还有一个 `_deploy/`（手动拖拽部署用的临时干净目录），已在 `.gitignore` 中忽略，不影响本流程。

## PWA 使用说明
- **桌面端（Chrome/Edge）**：地址栏右侧「安装」图标 → 安装为应用。
- **Android**：浏览器菜单 →「添加到主屏幕 / 安装应用」。
- **iOS（Safari）**：分享 →「添加到主屏幕」。
  - iOS 限制：**Web Push 需 iOS 16.4+ 且必须先「添加到主屏」以独立 App 方式打开**；后台行为受系统约束；存储配额较保守。
- Service Worker（`public/sw.js`）提供 App Shell 离线缓存（HTML 走 stale-while-revalidate，其它资源 cache-first）。

PWA / Service Worker / Web Push 的注册、缓存策略与本地/生产差异，详见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 数据说明
- V7.0 仍以 **localStorage** 为主：现役应用使用 `kaoyan_v2`（数值版本链）。
- V7.0 新增 **migration 层**：启动时从旧数据派生新版 `AppState` 信封（键 `ky_app_state_v7`，含 `userId`/`updatedAt`），并在迁移前备份旧数据。**迁移只读旧主状态、写新键，绝不破坏现役数据。**
- 所有新代码统一通过 **storage client** 读写，不散落直接调用 `localStorage`。
- V7.1 计划接入云同步（Supabase / Firebase / Neon 选型），实现打卡/错题/单词/阅读/AI 对话的多设备同步与恢复。详见 [ROADMAP.md](./ROADMAP.md)。

## 项目路线
见 [ROADMAP.md](./ROADMAP.md)（V7.0 重构 → V7.1 云同步 → V7.2 内容扩充 → V7.3 AI 调度 → V7.4 体验升级）。

## 开发规范
见 [CONTRIBUTING.md](./CONTRIBUTING.md)。变更记录见 [CHANGELOG.md](./CHANGELOG.md)。
