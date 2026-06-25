# 架构说明（ARCHITECTURE）

## 总体架构
**前端 PWA + localStorage + Netlify Functions + 静态 data 内容库。**

```
                    ┌─────────────────────────────────────────────┐
                    │                  浏览器 / PWA                │
                    │                                              │
   现役完整应用 ──▶ │  index.html（单文件 vanilla JS，生产入口）   │
                    │      └─ <script> bootstrap.ts（渐进增强）     │
   工程外壳   ──▶  │  preview.html → src/main.tsx（React 模块预览）│
                    │                                              │
                    │  src/lib（storage / migration / pwa / utils）│
                    │  src/modules（checkin / dashboard / learn …）│
                    └───────┬───────────────┬──────────────┬───────┘
                            │ fetch         │ fetch        │ read/write
                            ▼               ▼              ▼
                    data/*.json     /api/chat,/.netlify/*   localStorage
                    （静态内容库）   （Netlify Functions）   （本地数据）
                                          │
                                          ▼
                                  DeepSeek API / Web Push
```

V7.0 采用**渐进式重构**：现役 `index.html` 保持完整可用；新建的 Vite + React + TS 工程层
（`src/`）先以「基础设施 + 模块契约 + 工程外壳」的形态落地，后续版本逐模块接管 UI。
这样既满足「可长期维护」目标，又不冒一次性重写 4800 行现役代码导致功能回归的风险。

> **接手须知**：自 V7.1 起新功能一律用 React 写在 `src/`，`index.html` 只迁出不新增。
> 具体「怎么加新功能/页面」的标准步骤见 [CONTRIBUTING.md](./CONTRIBUTING.md#新功能开发约定给接手的-ai--开发者务必先读)。
> 已可操作的样板页面：math/vocab/syntax/reading/mistakes/checkin/settings(DataPage)。

## 目录结构
```
kaoyan-checkin/
├── public/                 # PWA 静态资源（Vite 自动拷贝到 dist 根）
│   ├── manifest.json
│   ├── sw.js               # Service Worker（缓存 + Web Push 事件）
│   └── icon.svg
├── data/                   # 静态学习内容库（构建时拷贝进 dist/data）
│   ├── words/  reading/  math/  syntax/  writing/
├── netlify/functions/      # Netlify Functions（服务端）
│   ├── chat.js             # DeepSeek 代理（AI）
│   ├── push-public-key.js  # 下发 VAPID 公钥
│   ├── push-subscribe.js   # 保存订阅
│   ├── push-send-test.js   # 测试发送
│   └── push-scheduled.js   # 定时推送（Netlify Scheduled Function）
├── src/
│   ├── app/                # 工程外壳：App / routes / providers / ModuleScaffold
│   ├── components/ui/      # 复用 UI：Button / Card / Modal / Tabs / Progress
│   ├── modules/            # 业务模块（每个含 *Types / *Store / *Page）
│   │   ├── checkin/        # 打卡
│   │   ├── dashboard/      # 仪表盘（今日任务/热力图/偏科/薄弱点）
│   │   ├── learn/          # 学习中心：vocab / math / reading / syntax / mistakes
│   │   ├── resources/      # 资料/网课
│   │   ├── ai/             # AI 助手（aiClient / aiPrompts）
│   │   └── push/           # Web Push（pushClient / pushSettings）
│   ├── lib/
│   │   ├── storage/        # storageKeys / localStorageClient / storageTypes / appStateStore / legacyAdapter（+ 单测）
│   │   ├── migration/      # versions / legacyImport / migrate（+ 单测）
│   │   ├── content/        # contentClient / contentTypes（读取 data/ 内容库，带缓存）
│   │   ├── pwa/            # registerServiceWorker / pwaUtils
│   │   └── utils/          # date / progress / format
│   ├── styles/             # tokens.css / global.css
│   ├── bootstrap.ts        # 现役 index.html 的渐进增强入口（迁移 + storage 桥）
│   └── main.tsx            # React 工程外壳挂载点
├── index.html              # 现役单文件应用（生产入口）
├── preview.html            # React 工程外壳入口
├── README / ARCHITECTURE / ROADMAP / CHANGELOG / CONTRIBUTING / .env.example
├── package.json · tsconfig.json · vite.config.ts · eslint.config.js · netlify.toml
```

## 模块职责
| 模块 | 负责 | 不负责 |
| --- | --- | --- |
| **checkin** | 每日打卡、在职/全职阶段、学习状态、打卡记录、本地读写与迁移 | AI 聊天、词库、数学题库、推送发送 |
| **dashboard** | 首页仪表盘、今日任务、学习进度、热力图、偏科预警、薄弱点展示、学习概览 | 内容库存取（派生自 checkin + learn 脊柱） |
| **learn/vocab** | 单词列表、学习进度、复习状态、错词记录；读取 `data/words` | 题库/文章内容 |
| **learn/math** | 题目加载、做题状态、答案判断、解析、错题记录；读取 `data/math`（V7.0 保持选择题结构） | 复杂公式输入（暂不做） |
| **learn/reading** | 文章加载、阅读进度、生词/重点句记录；读取 `data/reading` | 词库主存储 |
| **learn/syntax** | 长难句加载、成分拆解展示、学习状态；读取 `data/syntax` | — |
| **learn/mistakes** | 跨模块错题聚合、来源标记、重练、错因字段预留；智能复习接口预留（V7.1/V7.2） | 单模块判分逻辑 |
| **ai** | AI 助手页、调用 `chat.js`、模式切换（答疑/错题/计划重排）、提示词与接口抽离；学习调度引擎预留 | 服务端密钥、完整 Agent（V7.3） |
| **push** | 通知授权、Web Push 订阅、调用 push 函数、应用内提醒设置、iOS 兼容 | 业务数据存储 |
| **settings** | 数据备份页：全量导出/导入（`kaoyan_v2` + 用户库），导入前备份 | 云同步（V7.1） |
| **lib/storage** | localStorage 统一读写、key 管理、JSON 容错、默认值、统一数据源投影/落回、导出/导入、云同步接口预留 | 业务语义 |
| **lib/migration** | 读旧数据、判版本、迁移、备份、失败回滚、写新版本号 | UI |

## 数据流
```
用户操作 → 模块 Store（checkinStore 等）→ appStateStore.readSlice/writeSlice
        → legacyAdapter（切片 ⇄ 单体投影/落回）→ localStorageClient → localStorage（键 kaoyan_v2）

AI 请求  → aiClient.ask() → /api/chat（netlify.toml 重定向）→ chat.js → DeepSeek

Push 请求 → pushClient → /.netlify/functions/push-* → web-push → 浏览器推送
```
**关键约束**：模块层不直接 `localStorage.*`，一律经 store → appStateStore → storage client。
这样 V7.1 把底层换成「本地优先 + 远端同步」时，模块层零改动。

### 统一数据源（V7.1 起）：单一真相 = `kaoyan_v2`
为消除「改了 React 页面、现役应用看不到」的分叉，运行期**只有一份真相来源 `kaoyan_v2`**：
- 现役 `index.html` 照常用自己的 `load()/save()` 读写 `kaoyan_v2`（数值版本链 + 内置 `migrate()`）。
- React 工程层经 `appStateStore` + `legacyAdapter`：
  - **读** = 把 `kaoyan_v2` 单体投影成 `AppState`（`mapLegacyToAppState`）。
  - **写** = 读整个单体 → 只改对应切片字段（`applySliceToLegacy`）→ 整体存回 `kaoyan_v2`，
    因此现役独有字段（`learn.log/weakness/daily/profile/writing/lastPack` 等）原样保留，绝不丢失。
- 两侧共用同一份数据，编辑互相可见。
- **`ky_app_state_v7` 信封 + `ky_backup_<ts>` 备份**（由 `migrate.ts` / `bootstrap.ts` 维护）退化为
  「一次性快照 / 安全备份 / V7.1 云上传的种子」，**不再是运行期真相来源**。
- `bootstrap.ts` 仍全程 try/catch，迁移/备份失败都不影响现役运行。

## 状态结构（AppState 信封）
```ts
type AppState = {
  version: string;        // 语义化 schema 版本，如 '7.0.0'
  userId?: string;        // V7.0 恒空；V7.1 云同步后写入
  checkin: CheckinState;
  dashboard: DashboardState;
  vocab: VocabState;
  math: MathState;
  reading: ReadingState;
  syntax: SyntaxState;
  mistakes: MistakesState;
  ai: AiState;
  push: PushState;
  resources: ResourcesState;
  updatedAt: string;      // ISO，供同步冲突比较
};
```
各切片类型见对应模块的 `*Types.ts`；学习中心脊柱（log/mistakes/weakness/daily/profile）
见 `src/modules/learn/learnTypes.ts`，忠实映射现役 `state.learn`（defaultLearn）。

## localStorage 策略
- **key 管理**：全部集中在 `src/lib/storage/storageKeys.ts`，禁止散落硬编码。
  - `kaoyan_v2`（现役主状态，数值版本）
  - `ky_app_state_v7`（V7.0 新版信封）
  - `ky_schema_version`（语义化版本号）
  - `ky_backup_<ts>`（迁移前备份）
  - `vocab_lib_<id>` / `reading_<id>` / `math_set_<id>`（用户自建内容）
- **版本管理**：现役数值链 1→…→8 由 index.html 维护；V7.0 语义化版本 `7.0.0` 由 `versions.ts` 维护。
- **迁移策略**：见 `migrate.ts`，幂等、迁移前备份、失败不删原数据、成功写新版本号、预留 `userId`。
- **容错**：`localStorageClient` 统一 try/catch，隐私模式/配额超限优雅降级（返回默认值，不抛异常）。

## PWA 架构
- **manifest**（`public/manifest.json`）：`display: standalone`、`start_url: ./index.html`、暖色 `theme_color`、`icon.svg` maskable。
- **Service Worker**（`public/sw.js`，构建后位于站点根，作用域 `/`）：
  - install 预缓存 App Shell（index.html / manifest / icon）。
  - activate 清理旧缓存。
  - fetch：导航(HTML) 走 **stale-while-revalidate**；其它资源 **cache-first**。
  - push / notificationclick 事件处理（Web Push）。
- **注册**：现役 index.html 内联注册；React 外壳用 `lib/pwa/registerServiceWorker.ts` 注册同一份 `sw.js`。
- **本地 vs 生产差异**：
  - Service Worker / Web Push 需要 HTTPS（或 `localhost`）。`npm run dev` 的 `localhost` 可注册 SW，但 **Netlify Functions（/api/chat、push-*）在纯本地 Vite 下不可用**——需 `netlify dev` 或部署到 Netlify 才能联通函数。
  - 生产由 Netlify 提供 HTTPS + Functions + Scheduled Functions。

## Netlify Functions 架构
| 函数 | 作用 | 关键环境变量 |
| --- | --- | --- |
| `chat.js` | DeepSeek 代理，前端 `/api/chat` → 此函数 | `DEEPSEEK_API_KEY`（仅服务端） |
| `push-public-key.js` | 下发 VAPID 公钥 | `VAPID_PUBLIC_KEY` |
| `push-subscribe.js` | 保存浏览器订阅（@netlify/blobs） | `VAPID_*` |
| `push-send-test.js` | 测试发送一条推送 | `VAPID_*` |
| `push-scheduled.js` | 定时推送（Netlify Scheduled Function） | `VAPID_*` |

> 注：函数名沿用现役仓库（`push-public-key`/`push-send-test`/`push-scheduled`），
> 与任务书示例命名（`vapid-public-key`/`push-test`/`push-cron`）略有差异，
> 为「不破坏现有函数与重定向」而保持原名。

## V7.1 云同步预留
- `AppState.userId` / `updatedAt` 字段已就位。
- **统一数据源已落地**：运行期单一真相 = `kaoyan_v2`，读写全部收口在 `appStateStore` + `legacyAdapter`。
- 所有读写收口在 `appStateStore` + `localStorageClient`：接入云端时把它改造成
  「本地优先（local-first）写本地 + 异步推远端 + 拉取合并」即可，模块层不动。
- 迁移层已具备「备份 + 版本判定 + 幂等」，可平滑扩展为「本地 schema ↔ 远端表结构」映射。
- 选型与表结构草案见 [ROADMAP.md](./ROADMAP.md) 的 V7.1 章节。
