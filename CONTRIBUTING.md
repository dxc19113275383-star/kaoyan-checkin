# 开发规则（CONTRIBUTING）

## 项目目标
这是一个**考研学习 PWA**，不是普通待办工具。所有改动都应服务于「可长期维护的考研备考产品」。

## AI / Codex 开发规则（务必遵守）
- **不要删除现有功能**（打卡 / 学习中心 / AI / 错题 / 资料 / PWA / Push / 现役数据）。
- **不要硬编码学习内容**——词库/题库/文章/句库一律放 `data/` 静态 JSON。
- **不要把 API Key 写进前端**——DeepSeek 密钥、VAPID 私钥只在 Netlify Functions 通过环境变量读取。
- **不要绕过 storage client 直接操作 localStorage**——走 `appStateStore` / `localStorageClient`，键定义在 `storageKeys.ts`。
- **不要在 V7.0 引入复杂后端**（云同步是 V7.1 的事）。
- **不要随意改 UI 风格**——现役 `index.html` 的视觉与交互保持不变。
- **修改前先理解模块职责**（见 [ARCHITECTURE.md](./ARCHITECTURE.md) 的模块职责表）。
- **不要破坏现役应用**：`bootstrap.ts` 等增强逻辑必须 try/catch，只读旧主状态、写新键。
- **每次修改后运行**：`typecheck`、`lint`、`test`、`build`。

## 代码规范
- TypeScript 优先；模块边界清晰；UI 组件复用（`components/ui`）。
- 业务逻辑从组件中抽离（如 `checkinLogic.ts`、`aiPrompts.ts`），便于单测与复用。
- data 内容与组件逻辑分离。
- 新增模块遵循 `<模块>/<X>Types.ts + <X>Store.ts + <X>Page.tsx` 的结构。
- 提交信息沿用现役风格：`feat(V7.x): …` / `fix: …` / `docs: …`。

## 提交流程
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
四项全过再提交 / 部署。

## 文档要求
每次新增模块或重要功能，需同步更新 README、ARCHITECTURE 或 CHANGELOG 中相关章节
（本仓库约定：每次改动都写入对应文档并提交）。
