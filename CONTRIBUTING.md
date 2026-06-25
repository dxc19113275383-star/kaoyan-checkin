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

---

## 新功能开发约定（给接手的 AI / 开发者，务必先读）

> **铁律：从 V7.1 起，所有新功能一律用 React + TypeScript 写在 `src/` 下，不再往 `index.html` 里加代码。**
> `index.html` 是「现役单文件应用」，处于**只迁出、不新增**状态——只在把它的旧功能搬进 React 时才动它。

### 三层心智模型
1. **内容（data/）**：题目/单词/文章/句子等纯数据，放 `data/<模块>/*.json`，绝不硬编码进组件。
   用 `src/lib/content/contentClient.ts` 读取（带缓存）；新内容类型加到 `contentTypes.ts`。
2. **状态（kaoyan_v2）**：用户进度/记录。**唯一真相来源是 `kaoyan_v2`**。
   组件**不要直接碰 `localStorage`**，一律：模块 Store → `appStateStore.readSlice/writeSlice` →
   `legacyAdapter` 投影/落回 `kaoyan_v2`。这样现役 index.html 与 React 共用同一份数据。
3. **界面（React）**：页面放 `src/modules/<模块>/<X>Page.tsx`，复用 `src/components/ui/`，
   纯逻辑抽到 `<x>Logic.ts` 便于单测。

### 新增一个功能/页面的标准步骤
1. 建模块目录 `src/modules/<name>/`，按需创建：
   - `<name>Types.ts` —— 该模块的 TS 类型 + `default<Name>State()` 工厂。
   - `<name>Store.ts` —— `get/set/update`，内部只调 `readSlice/writeSlice`。
   - `<name>Logic.ts`（可选）—— 纯函数业务逻辑（**写单测**）。
   - `<Name>Page.tsx` —— UI，套 `ModuleScaffold`，数据用 `useAsync` + `contentClient` 加载。
2. 若新增持久化状态：在 `src/lib/storage/storageTypes.ts` 的 `AppState` 加切片字段，
   并在 `src/lib/storage/legacyAdapter.ts` 的 `applySliceToLegacy` 加该切片 ⇄ `kaoyan_v2` 的映射；
   在 `src/lib/migration/migrate.ts` 的 `mapLegacyToAppState` 加投影。
3. 在 `src/app/routes.tsx` 注册路由（`routes` 数组加一项）。
4. 跑 `npm run typecheck && npm run lint && npm run test && npm run build`，全过再提交。
5. 更新 `CHANGELOG.md`；涉及架构再更新 `ARCHITECTURE.md`。

### 参考样板（已迁好的可操作页面，照着写）
- 做题/判分类 → `src/modules/learn/math/MathPage.tsx`
- 卡片/记忆类 → `src/modules/learn/vocab/VocabPage.tsx`
- 展示/标记类 → `src/modules/learn/syntax/SyntaxPage.tsx`、`reading/ReadingPage.tsx`
- 列表+操作类 → `src/modules/learn/mistakes/MistakesPage.tsx`
- 设置/工具类 → `src/modules/settings/DataPage.tsx`

### 几条红线（重复强调）
- 不登录、不接后端（私人程序，见 ROADMAP；跨设备用「数据备份」页导出/导入）。
- 不绕过 store 直接写 `localStorage`；不破坏现役 `index.html`；不改暖色 UI 基调。
- 内容进 `data/`，不进组件。
