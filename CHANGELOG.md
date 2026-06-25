# Changelog

本项目遵循语义化版本。日期格式 YYYY-MM-DD。

## [Unreleased]

### Added
- 错题中心 React 试点（V7.1 第一块）：`MistakesPage` 升级为可运行页面——模块筛选、显示/隐藏已解决、标记已解决、再练入口。
- `mistakesStore` 单元测试 4 例（record/resolve/list 逻辑）。
- **统一数据源 `legacyAdapter`**：AppState 切片 ⇄ 现役 `kaoyan_v2` 单体的双向映射 + `appStateStore` 单测 4 例（投影读 / 落回写 / 保留 learn.log 等现役独有字段 / 无分叉）。

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
