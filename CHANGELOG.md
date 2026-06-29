# Changelog

本项目遵循语义化版本。日期格式 YYYY-MM-DD。

## [Unreleased]

### Added
- **阅读：逐句精读 + 查词卡展开解析**：
  - **逐句渲染**——文章不再是整段，按句切分（`rdSplitEn`/`rdSplitCn`），每句独立成块、自带 🔊；「显示译文」时内置 3 篇逐句中英对照（我手写的段译按句号切分恰好与英文句数对齐，自动对齐；不齐则回退整段译文）。
  - **试听改逐句**——`_rdPlayer.units` 改为句级单元，「试听全文」逐句连读 + 高亮当前句；点某句 🔊 从该句起读。
  - **查词卡（百词斩式）**——点单词弹出富卡片：大词 + 音标 + **美/英两种发音**（`speechSynthesis` en-US/en-GB）+ 释义 + 例句；新增「AI 详解」按 DeepSeek 生成**全部释义（分条）/ 词根助记 / 地道例句+翻译**，解析缓存 `localStorage['gen_wd_<word>']`，下次秒开（不编造词频/配图）。
- **背单词也能用查词卡**：把查词卡抽成通用组件 `openWordCard(entry,opts)` + 共享浮层 `#wordCard`（移出阅读页，任意页可弹）。斩词/拼写答完的反馈卡、以及「已学单词浏览」每行都加了「词义详解」入口，点开即同款富卡片（美/英发音 + 释义 + 例句 + AI 详解；背单词侧不显示「加入背单词」）。
- **释义内置化（省 Token）+ 答错直弹详解**：
  - **删除答题后的冗长反馈块**（再记一次 / 生成例句 / 已加入错词本），只留「词义详解」+「下一个」；**答错自动弹出词义详解卡**。
  - **释义零 Token 内置**——`splitDefSenses()` 把词库 `def` 串按词性（n./v./vt./adj.…）拆成「全部释义」多行，**5500 全部词的释义都来自内置词库、不花 Token**；查词卡 AI 按钮收窄为只补「词根助记 + 地道例句」。
  - **冷门词才 AI**——只有「词库未收录释义」的词在打开卡片时才自动调一次 AI（并永久缓存 `gen_wd_<word>`）；已收录词全部走内置。阅读点词同理：收录词秒显内置释义，未收录才 AI。

### Changed
- **极简高级 UI 改版（去 emoji · 全量 SVG 线性图标）**：全站布局 emoji 统一换成项目既有的 `I` 线性图标集（保持单一图标语言，未引入第二套）。新增图标 `sound/play/stop/refresh/bookOpen/arrowLeft/x/xCircle/bookmark/pen/layers/grid/sigma/robot`。
  - **发音按钮重做**：丑陋的 🔊 emoji → 极简圆形描边图标按钮（卡片大号 `.vocab-speak` + 行内 `.spk`），覆盖单词卡/拼写卡/例句/已学浏览/阅读逐段/查词弹层。
  - **背单词主页重排**：卡片 `.fill-card` 撑满视口（消除底部大片留白）；新增「开始复习」按钮（只练到期词，`buildVocabQueue('review')`）；「每日新词 / 错词本 / 已学」改为更小、钉在卡片底部的次级按钮；主操作升级为 `.btn-cta`。
  - **学习中心 hub**：10 个模块卡 emoji 图标 → 线性 SVG（书/书页/Σ/分层/笔/书签/网格/机器人/文件夹）。
  - **反馈/完成态**：对错标题用 `fbHead()`（图标+语义色，替代 ✅❌）；完成页 🎉/💪 → 语义色对勾；错词提示 📌 → 书签图标；偏科预警 🔴🟡 → 语义色圆点。
  - 长难句/作文/数学/错题/AI 训练横幅/仪表盘/推送设置等处的 emoji 同步替换或移除；保留排版箭头 `← →` 与极简对勾 `✓`。
- **恢复零构建静态部署（默认）**：现役 `index.html` 是自包含纯静态应用，无需 `npm run build` 即可部署（GitHub Pages / Netlify 拖拽 / 任意静态托管）。
  - PWA 文件（`manifest.json`/`sw.js`/`icon.svg`）从 `public/` 移回**仓库根目录**；`data/` 本就在根。
  - `netlify.toml` 改为 `publish = "."`、移除 build 命令（不再消耗构建额度）。
  - 移除 `index.html` 中需要构建的 `/src/bootstrap.ts` 模块脚本（纯静态下无法运行；现役应用本就直接读写 `kaoyan_v2`，不依赖它）。
  - `vite.config` 设 `publicDir: false`，由插件在构建时把根 PWA 文件 + `data/` 拷进 `dist/`，使可选的 Vite 构建模式仍可用。
  - 5500 词库随 `data/words/index.json` 被现役 `index.html` 动态加载——零构建下打开背单词即可见。

### Added
- **背单词：例句朗读 + AI 按需补例句**：复习反馈卡的英文例句旁加 🔊 朗读（`speechSynthesis`，离线可用）；词库本身无例句时（如 5500 词库）显示「✨ 生成例句」按钮，调 DeepSeek 生成「例句+中译」并缓存到 `localStorage`（`gen_ex_<lib>:<word>`），下次秒开。
- **背单词：已学单词浏览页**：词汇主页新增「📖 已学单词浏览（N）」入口，按 待复习 / 学习中 / 已掌握 分类筛选，逐词看释义·例句·发音，可「重新复习」把词重新排进今天的队列。
- **阅读：全文试听 + 逐段朗读**：文章顶部「🔊 试听全文」按 speechSynthesis 逐段连读并高亮当前段；每段末尾加 🔊 可从该段起朗读。
- **阅读：段落中文译文**：内置 3 篇文章手写高质量中译（JSON 加平行 `cn[]`）；「显示/隐藏译文」一键切换；用户导入的文章缺译文时按段「✨ 翻译这段」用 AI 生成并缓存（`gen_rcn_<id>:<i>`）。
- **Netlify `chat.js` 新增 `gen` 模式**：跳过陪跑型系统提示，低温度（0.3）返回纯净文本，专供例句/翻译等内容生成；可传 `system` 自定义。
- **导入考研大纲词 5500（正序）**：从本地 xlsx 导入为新词库 `words/kaoyan-5500.json`（5490 词，含音标·释义），在 `words/index.json` 注册并置顶为默认词库；原核心词库（80 词带例句）保留为精学库。
- **内容库扩充（data/，纯静态原创/应试风格）**：
  - 词汇 `words/kaoyan.json` 50 → 80 词（高频考研/商务词，含音标·释义·例句）。
  - 阅读新增原创文章《Who Really Owns the Platform Economy?》（平台经济，含 10 词生词表）→ 共 3 篇。
  - 数学 `calc`/`prob` 各 +2 题（导数·重要极限·古典概型）→ 各 10 题，更新 index 计数。
  - 长难句 `kaoyan-eng2-core` +2 句（否定前置倒装、定语从句+比较）→ 共 8 句。
  - 阅读页 React 端新增「生词表」折叠展示（读 data 的 glossary）。
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
