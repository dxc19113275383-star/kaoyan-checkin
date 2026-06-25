# Changelog

本项目遵循语义化版本。日期格式 YYYY-MM-DD。

## [Unreleased]

### Added
- **仪表盘做成真数据看板**（`DashboardPage`，全部派生自 `kaoyan_v2`，无需后端）：
  - `Overview`：累计打卡 / 已认识词 / 已作答题 / 掌握难句 / 已读文章 / 待解错题 六项跨模块统计。
  - `Heatmap`：当前阶段最近 8 周 × 7 天真实打卡格子。
  - `TodayTasks`：今日打卡状态 + 本周进度条 + 考试倒计时。
  - `WeaknessPanel`：按模块/考点聚合未解决错题 + 最近薄弱点笔记。
  - 新增 `dashboardLogic` 纯函数（buildHeatmap / weaknessByMod / topWeakTags）+ 4 例单测。
- **资料 / AI助手 / 推送 迁成可操作 React 页面**：
  - 资料 `ResourcesPage`：新增/删除网课·资料·真题链接（`resourcesStore`，3 例单测）。
  - AI助手 `AiAssistantPage`：模式切换 + 多轮对话，调 `aiClient`→`/api/chat`，历史持久化（`aiStore`，2 例单测）。
  - 推送 `PushPage`：请求权限 / 订阅 Web Push / 测试发送 / 提醒时间设置（调 `pushClient`，best-effort）。
- 修复 `resourcesStore` 同毫秒连续新增导致 id 冲突（加随机后缀）；修正 `ChatResponse` 字段为 `reply`（与 chat.js 返回一致）。
- **4 个学习模块迁成可操作 React 页面**（统一走 `kaoyan_v2`，内容读自 `data/`）：
  - 数学 `MathPage`：选题集 → 做题判分 → 解析 → 答错自动记入错题中心。
  - 词汇 `VocabPage`：单词卡翻面 → 认识/不认识 → 写进度 + 错词记录。
  - 长难句 `SyntaxPage`：显示英文 → 翻面看译文 + 成分拆解 → 标记已掌握。
  - 阅读 `ReadingPage`：文章列表 → 阅读 → 标记已读。
- 新增内容层 `src/lib/content`（`contentClient` + `contentTypes`，带缓存）与 `useAsync` hook。
- Vite `dataDir` 插件加开发期中间件：`npm run dev` 下 `/data/*` 由根 `data/` 提供（生产仍拷进 dist/data）。
- **开发约定文档**：CONTRIBUTING 增「新功能开发约定（给接手的 AI / 开发者）」——新功能一律 React、三层心智模型、新增页面标准步骤、样板清单、红线。

- 错题中心 React 试点（V7.1 第一块）：`MistakesPage` 升级为可运行页面——模块筛选、显示/隐藏已解决、标记已解决、再练入口。
- `mistakesStore` 单元测试 4 例（record/resolve/list 逻辑）。
- **统一数据源 `legacyAdapter`**：AppState 切片 ⇄ 现役 `kaoyan_v2` 单体的双向映射 + `appStateStore` 单测 4 例（投影读 / 落回写 / 保留 learn.log 等现役独有字段 / 无分叉）。

- **数据导出/导入 `dataTransfer`**（V7.1 云同步前的本地安全网，无需后端）：全量导出 `kaoyan_v2` + 用户自建库（`vocab_lib_*`/`reading_*`/`math_set_*`）为 JSON，导入前自动备份、校验非法文件、忽略未知键。新增「数据备份」页（`settings/DataPage`）与 4 例单测。
- **打卡模块迁 React（功能版）**：`CheckinPage` 支持今日保底打卡、在职/全职切换、考试日期编辑、本周/累计统计；新增 `checkinLogic` 纯函数（todayKey/isTodayDone/weekDoneDays/markTodayDone）与 4 例单测。全部操作统一数据源 `kaoyan_v2`，现役应用同步可见。

### Changed
- **消除状态分叉**：`appStateStore` 的运行期读写改为「投影/落回现役 `kaoyan_v2`」，React 工程层与现役 `index.html` 共用同一份数据，编辑互相可见。`ky_app_state_v7` 信封退化为安全快照 / V7.1 云上传种子，不再是运行期真相来源。
- `bootstrap.ts` 的 `window.KY.getAppState` 改为返回 `kaoyan_v2` 的实时投影。

## [7.0.0] - 2026-06-25

### Added
- 新增 Vite / React / TypeScript 工程结构（`src/`、`preview.html`、`vite.config.ts`、`tsconfig.json`、`eslint.config.js`）。
- 新增统一 storage client（`src/lib/storage/`：storageKeys / localStorageClient / storageTypes / appStateStore）。
- 新增 migration 层（`src/lib/migration/`：versions / legacyImport / migrate）——备份、版本判定、失败回滚、预留 `userId`，并为现役 `kaoyan_v2` 派生新版 `AppState` 信封（`ky_app_state_v7`）。
- 新增各模块类型与 store（checkin / dashboard / learn[vocab,math,reading,syntax,mistakes] / resources / ai / push）。
- 新增复用 UI 组件（Button / Card / Modal / Tabs / Progress）与 React 工程外壳（App / routes / providers）。
- 新增 AI 接口与提示词抽离（`aiClient.ts` / `aiPrompts.ts`）、Web Push 客户端（`pushClient.ts`）、PWA 工具（`registerServiceWorker.ts` / `pwaUtils.ts`）、通用工具（date / progress / format）。
- 新增 `bootstrap.ts`：现役 `index.html` 的渐进增强入口（启动即安全迁移 + 暴露 `window.KY` storage 桥）。
- 新增单元测试（Vitest）：storage client 与 migration 共 12 例。
- 新增文档：README.md、ARCHITECTURE.md、ROADMAP.md、CONTRIBUTING.md、.env.example（含变量名，无真实值）。

### Changed
- 拆分原 `index.html` 中混在一起的页面/状态/业务逻辑的「边界」——以 TypeScript 模块形式建立契约（现役 UI 暂不动）。
- 整理 PWA 配置：`manifest.json` / `sw.js` / `icon.svg` 移入 `public/`，构建后落站点根，URL 不变。
- 整理 Netlify Functions 说明（保留现役函数名与重定向）。
- 规范 `package.json` scripts（dev/build/preview/test/test:watch/lint/typecheck）。
- `netlify.toml` 改为 Vite 构建：`command = "npm run build"`，`publish = "dist"`；`data/` 由内联插件拷贝进 `dist/data/`。
- `.gitignore` 增加 `node_modules/`、`dist/`、`.env*`。

### Kept
- 保留原有打卡、在职/全职阶段、今日任务、热力图、偏科预警、薄弱点笔记。
- 保留学习中心（词汇/阅读/数学/长难句/作文）与错题中心。
- 保留资料/网课入口、AI 助手、PWA manifest/Service Worker、Netlify Functions、DeepSeek 代理、Web Push 基础能力。
- 保留现役 localStorage 数据（`kaoyan_v2`）及其数值版本迁移链——迁移层只读不改。

### Not included
- 未接入云同步（V7.1）。
- 未新增复杂后端（Supabase / Firebase / Neon）。
- 未重写 UI 风格、未删除现有功能、未把学习内容硬编码进组件。
