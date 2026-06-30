# CLAUDE.md — 接手须知（先读这一页）

> 给接手的 AI / 开发者：**本页是唯一权威的"当前真相"**。
> README / ARCHITECTURE / ROADMAP 里关于「云同步暂缓」「Netlify 函数」「V7.x」的叙事**已过时**，不要据此判断架构——以本页为准。

## 一句话
**燕燕考研助手**：一个**私人**考研备考 PWA（英语二 / 396经济类联考 / 434国际商务）。
用户在职、基础偏弱、易因任务过大放弃 —— 产品目标是"把任务拆小、今天能动起来"，不是堆功能。

## ⚠️ 最容易踩的三个坑（务必先懂）

1. **现役应用 = 根目录 `index.html` 单文件**（约 30 万字符 vanilla JS）。`src/`（Vite+React）是早期重构外壳，**不是生产入口**，新功能基本都写进 `index.html`。
2. **以 `origin/master` 为准**：真实功能（数学课程 / Cloudflare AI / TTS / PayPal 蓝 / 5489 词义详解等）都在 `origin/master`，线上 GitHub Pages 也由它发布。开发期间若有 `claude/*` 工作分支，完成后应快进合并回 master。**接手时先 `git fetch && git log origin/master` 看最新，别信本地可能落后的检出。**
3. **后端是 Cloudflare，不是 Netlify**：AI 早已从已停的 Netlify 迁到 Cloudflare Worker；若在老提交里看到 Netlify 端点，是历史遗留。

## 部署拓扑（三处，2026-06-30 查实）

| 角色 | 在哪 | 地址 / 说明 |
| --- | --- | --- |
| **App 站点** | GitHub Pages（纯静态、**无 serverless**） | `https://dxc19113275383-star.github.io/kaoyan-checkin/` · **推 master 即部署** |
| **AI 后端** | Cloudflare Worker（免费、无构建额度问题） | `https://kaoyan-ai.dxc19113275383.workers.dev` · 源码 `cloudflare-worker/worker.js` |
| **资源库** | Cloudflare R2 公开桶 `yyky` | `https://pub-3e6c60a8d9f9400bae5689777ed59538.r2.dev/` · 视频/图片/JSON 索引 |

- **Worker 两条路由**：`POST /chat`（DeepSeek 代理，模式 qa/err/plan/gen）、`GET /r2?key=...`（代理 R2 的 JSON 索引，免前端跨域 CORS）。改 Worker 后需在 Cloudflare 控制台重新 Deploy，并确保密钥变量 `DEEPSEEK_API_KEY` 已配。
- App 里 AI 端点 = `backendBase()`（`localStorage.backend_url` 优先，否则内置 `DEFAULT_BACKEND` = 上面那个 Worker）。设置抽屉可改「AI 后端」。
- **R2 直链视频/图片**：`<video>/<img>` 跨域免 CORS，可直接用；但 `fetch()` JSON 索引需要桶配 CORS（上传 token 是 object 级无权配），所以走 Worker `/r2` 代理或仓库内置兜底。

## 数据真相来源

- **用户数据**：`localStorage` 的 `kaoyan_v2`（数值版本迁移链，`index.html` 内置 `migrate()` 维护）。**不做后端/账号/云同步**（私人程序，已定）。
- **学习内容**：静态 JSON 在根 `data/`（words / math / courses / reading / syntax / writing）。`index.html` 运行时读取各 `index.json` 清单。
- **数学课程加载三级兜底**：① Worker `/r2?key=index/course.json`（配 Worker 即自动同步新课）→ ② 直连 R2 `index/course.json` → ③ 仓库内置 `data/courses/math.json`（80KB，133 节，由 R2 索引生成）。

## 内容生产管线（新内容一律"离线生成 + 提交静态 data"，不依赖在线后端）

1. **素材整理工具**（Python）：`E:\BaiduNetdiskDownload\kaoyan_asset_organizer` —— 把百度网盘下载的乱目录整理成可上传 R2 的标准结构（scanner/classifier/题库/AI校对/验证）。
2. **整理输出**：`E:\yyky\`（`index/course.json`、`question_bank/index/questions_clean.json`、videos/images/... ），上传脚本 `E:\yyky\_upload_r2.py` → R2 桶 `yyky`。
3. **接进 App 的脚本**（仓库 `scripts/`，本地直连 DeepSeek 生成，key 走环境变量不入库）：
   - `clean-questions.mjs`：清洗 OCR 数学题（只处理已带答案的单选题；AI **只清洗格式、不解题不改答案**；坏题丢弃），生成 `data/math/zyx-*.json` 并登记 `data/math/index.json`。
   - `gen-word-details.mjs`：离线生成词义详解 `data/words/kaoyan-5500-detail.json`。
   - 运行：`DEEPSEEK_API_KEY=sk-... node scripts/xxx.mjs`（本地 key 在 `E:\BaiduNetdiskDownload\kaoyan_asset_organizer\.deepseek_key`）。

## 现有内容存量（分支）

- 词汇：5500 大纲词 + 5489 词义详解 + 80 核心词（带例句）。`words/index.json` 里 cet4/cet6/major-en 仍是 `placeholder`，文件未建。
- 数学课程：133 节周洋鑫396视频（高数74/线代24/概率14/综合21），二级下钻菜单。
- 数学题库：`zyx-gaoshu`(233) + `zyx-xiandai`(92)，标「AI清洗·待校」；`logic` 仍占位。
- 阅读 3 篇 / 长难句 8 句（clauses、inversion 占位）/ 作文 4 题 + 模板。

## 红线与工作约定（来自历史约定，务必遵守）

- **每次改动后**：提交 + 写对应文档（CHANGELOG 等）+ push。默认快进 `master` 触发部署，**不用每次问**（但涉及大范围合并/线上变化时先确认）。
- **UI 极简、禁 emoji**，统一用线性 SVG 图标（当前主题：PayPal 蓝/白）。
- **不做后端/账号/云同步**：保持本地 `localStorage`。
- 学习内容不硬编码进组件，一律静态 JSON 放 `data/`。

## 常用命令

```bash
# 纯静态：直接静态服务器指向仓库根即可预览现役应用
python -m http.server          # → http://localhost:8000/index.html
# 可选 React 工程外壳（非生产）
npm run dev                     # → /preview.html
npm run typecheck && npm run lint && npm run test
# 离线生成内容（需本地 DEEPSEEK_API_KEY）
DEEPSEEK_API_KEY=sk-... node scripts/clean-questions.mjs
```

## 当前进度 / 下一步（接手时更新这里）

- 进行中：数学课程"章节 → 看视频 → 配套做题"完整打通；视频从工具内播放尚未完全跑通；课程素材正持续上传 R2。
- 待办候选：填 `logic` / 长难句占位题集；校对 zyx 清洗题。
