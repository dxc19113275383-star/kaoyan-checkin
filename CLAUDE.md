# CLAUDE.md — 接手须知（先读这一页）

> 给接手的 AI / 开发者：**本页是唯一权威的"当前真相"**。
> README / ARCHITECTURE / ROADMAP 里关于「云同步暂缓」「Netlify 函数」「V7.x」的叙事**已过时**，不要据此判断架构——以本页为准。

## 一句话
**燕燕学习助手**：一个**私人**学习计划 PWA（2026-07-03 起从"考研专用"转型为通用学习助手）。
计划引擎 v9：阶段/周数/每日任务模板/月目标全部可自定义（`state.plans`），内置考研双阶段（英语二/396/434）降级为**默认模板**；词汇/阅读/长难句/作文/数学等为**考研默认内容包**。
用户基础偏弱、易因任务过大放弃 —— 产品目标是"把任务拆小、今天能动起来"，不是堆功能。

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

- 词汇：5500 大纲词 + 5489 词义详解 + 80 核心词（带例句）。（cet4/cet6/major-en 占位已于 P0.2 移除，需要时再真导入）
- 数学课程：133 节周洋鑫396视频（高数74/线代24/概率14/综合21），二级下钻菜单；**R2 已全部上传（2026-07-02 核对 133/133）**，`scripts/check-r2-coverage.mjs` 可随时重核。
- 数学题库：`zyx-gaoshu`(233) + `zyx-xiandai`(92)，标「AI清洗·待校」。（logic 占位已移除，396 逻辑真题待 P1.5 导入）
- 阅读 **20 篇**（6 手写 + 14 AI生成·待校，均带 4 道配套题）/ 长难句 **60 句**（core 24 + clauses 20 + inversion 16，AI扩充·待校，parts 拼接 100% 校验）/ 作文 **15 题**（小 9 + 大 6，全带范文可默写）+ 模板。生成脚本 `scripts/gen-english-content.mjs`（本地直连 DeepSeek，幂等续跑）。

## 红线与工作约定（来自历史约定，务必遵守）

- **【强约束】每次改动都要回写本文档**：任何修改在提交时，同步把"改了什么"更新进本 CLAUDE.md 的「## 当前进度 / 下一步」段（必要时也更新对应的架构/存量小节），让本页始终等于项目当前真相。**这是硬性要求，不可跳过。**
- **每次改动后**：提交 + 写对应文档（CHANGELOG + 本 CLAUDE.md）+ push。默认快进 `master` 触发部署，**不用每次问**（但涉及大范围合并/线上变化时先确认）。
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

- **功能规划看 `PLAN.md`（2026-07-02 立项）**：全面审计后的 P0-P3 分阶段计划，完成一项勾一项，**接手做新功能前先看它**。
- **P1.1 今日学习聚合页已上线（2026-07-02）**：学习中心置顶通栏卡 → `openToday()`（约 3630 行）一屏聚合三项 quest / 到期复习词 / 错题数 / 长难句待复习数 + 「一键开始」直达第一个未达标项。原"敬请期待"占位页已删，`showLearnView` 未知视图回落 hub。
- **P1.2 阅读配套题已上线（2026-07-02）**：6 篇 ×4 题手写入各 passage JSON `questions` 字段；`renderPassage` 尾部渲染练习区、`readingAnswer()` 判分（答错入错题中心/重做答对解除/成绩存 `progress[id].quiz`，列表显「题 x/4」）。阅读闭环补全。
- **v9 计划引擎：考研专用 → 通用学习助手（2026-07-03，用户提出）**：`BUILTIN_PLANS`（原 PHASES 常量）降级为默认模板，`state.plans` 存自定义计划、`rebuildPhases()` 派生生效计划（约 1815 行）；迁移 v8→v9（plans=null 沿用内置，goalLabel 目标日可命名）。泛化：dateFor/calcPosition/monthIdxFor/热力图/周导航全部支持任意 N 阶段（周导航可跨阶段）；phaseToggle 动态渲染（单阶段自动隐藏）。设置抽屉新增**计划编辑器**（`renderPlanEditor`，约 5975 行）：阶段增删改名/周数/工作日周六周日任务模板（行格式"标签|文案"，标签映射科目色）/月目标，可一键恢复默认考研模板（打卡数据保留）。文案中性化：标题/manifest/顶栏→燕燕学习助手，Hero/教练/AI 上下文用计划名，重规划建议去阶段专属，"上岸"改中性。**内容包（词汇/阅读/长难句/作文/数学）仍是考研内容，后续可按"内容包"思路扩展其他考试**。
- **背单词/阅读/视频/口语 7 项优化（2026-07-03）**：① 有道 TTS 扩到短句（`_youdaoUrl`/`_youdaoPrefetch`，单词+≤240 字符句子优先有道，倍速透传，失败回退 Edge/系统）；② 视频小窗 `mcPip` + `autopictureinpicture` + 后台自动尝试；③ 倍速后台不重置（loadedmetadata/play/playing/visibilitychange 重设，`_mcVisHandler` 清理）；④ 例句逐词可点 `vctxTapWord`；⑤ 首页默认今天（无 startDate 时按系统星期，顺带修 `state.p>1` 硬编码→`PHASES.length`）；⑥ 背单词混合模式 `mode='mix'`（每卡随机选义/默写）；⑦ **新模块口语练习**（`pageLearnSpeak`/`openSpeak`，`SPEAK_BANK` 20 句内置，听原声→录音→回放，支持设备加语音识别打分 `_spkSimilarity`，进度存 `state.learn.speak`）。
- **P3 全部完成（2026-07-02）**：gen_* LRU（400条+配额清理）、导入体积确认、词库加载骨架屏、iOS 隐藏 Web Push 开关（并删除遮蔽真函数的重复死 `updateNotificationUI`，修好弹窗状态从不刷新的旧病）、周报第二行（周背词/做题/正确率/活跃天，`renderLearnWeekStats`）。**PLAN.md 的 P0-P3 除等题源的 P1.5/1.6 外全部收工**。
- **背单词四项优化（2026-07-02，用户提出）**：① 学习子页全面 `fill-card` 满屏（vocab/math/syntax/today）；② 选项即读（`data-w` 来源词，答错先读错词再读对词）；③ `speak()` 单词优先有道真人发音（dictvoice，超时/失败回退神经→系统）；④ 答题反馈新增语境例句卡（`vCtxHtml`，深色卡+目标词高亮+中译+朗读，数据=5489 词义详解）。真影视原声无版权素材，未做。
- **沉浸阅读 v2（2026-07-02，用户点名要"爱阅读"式）**：阅读文章页重排——衬线 20px 大字、考研词自动标注（生词表 rd-key 蓝虚线 + 5500 命中 rd-hit 灰虚线 + 顶部计数横幅，`rdMarkVocab()`）、每句「译」独立开合、底部固定播放条（上一句/播放暂停/下一句/倍速 0.8-1.5，当前句变品牌蓝跟读高亮；`rdToggle/rdStep/rdCycleRate`，`speak()` 增 `sysRate`）。**P3 其余项（gen_* LRU/导入大小检查/词库加载提示/iOS推送开关/周报升级）被本需求打断，尚未做**。
- **P2 英语扩量完成（2026-07-02）**：`scripts/gen-english-content.mjs` 批量生成——阅读 6→20 篇（带配套题）、长难句 16→60 句（parts 硬校验，c15 手写）、作文 7→15 题（含范文）。产出标"待校"，后续抽样校对。用法 `node scripts/gen-english-content.mjs reading|syntax|writing [--limit N]`，幂等只补缺。
- **P1.3/1.4/1.7 已上线（2026-07-02）**：长难句复习队列（`syntaxDueKeys`/`syntaxStartReview` 遮译自测，记住出队、不熟 due 推明天）；作文范文默写（`writingStartDictation` 逐句 LCS diff 标红，还原度存 `writing.dict`，离线可用）；AI 失败改人话文案 + 问题放回输入框即点即重试。**P1 仅剩 1.5 逻辑题库 / 1.6 MC_QUIZ_MAP 扩章，都在等题源**（用户尚未找到 396 逻辑题库）。
- **P0 全部完成（2026-07-02）**：0.2 占位大扫除（词库/题库索引去占位 + 学习中心撤三张敬请期待卡 + 加载层过滤/active回退）；0.3 SW v22 同源 `*.json` 改 stale-while-revalidate（内容更新不再吃缓存）；0.4 设置页备份状态行（版本+距上次备份天数）；0.5 `scripts/check-r2-coverage.mjs` 覆盖率核对 + 前端「未上传」灰显（**首跑 133/133 已全部上传，视频问题已消**，R2 传新课后重跑脚本提交 coverage.json）；0.6 streak 漏1天宽恕。下一步 P1.1 今日学习聚合页。
- **P0.1 打卡×学习已打通（2026-07-02）**：quest 达标自动勾选今日对应打卡任务（`_autoCheckTask`，约 1911 行；关键词映射 + t-rev 回顾类留手动；`_todayPos()` 用起始日期定位"今天"）；`computeStreak()` 统一为全 App 唯一 streak（今天未打不清零）；Hero 训练舱模式改显统一 streak。热力图/周报经自动勾选自然吃到学习行为。已端到端验证。
- **V8 Liquid Glass 视觉层（2026-07-02）**：整站前端观感重构（零功能改动）——① 背景三层：`#bgFluid` 流体渐变画布（低清 180px + CSS 放大 42px 重模糊，5 色斑 Lissajous 漂移，alpha 3%–11% 无光污染）+ `#bgDust` 尘埃粒子（20–44 颗上浮微尘）+ `#bgGrain` 噪点纹理；单 rAF 30fps 上限、页签隐藏即停、`prefers-reduced-motion` 静态一帧、`prefers-contrast: more` 与无 backdrop-filter 均回退实底。② 液态玻璃：新增 `--glass-*` 令牌，主卡/弹层/抽屉「透明底+blur+1px 高光边+内折射+液面斜光」，列表卡与控件仅半透明底不叠 blur（性能），Hero 深蓝渐变卡保持不动。CSS 集中在 `</style>` 前的「V8 — Liquid Glass」块，JS 引擎在 `</body>` 前独立 `<script>`。顺手修掉 DOM 自检过期断言（「距2027年初试」→ 查 `#countdownDays`），自检 15/15。已在浅/深色 + 移动视口端到端截图验证。
- **数学课程视频排查结论（2026-07-01）**：数据通路正常（Worker `/r2` 取 course.json OK，已上传的视频可播、支持 Range 206）。"看不了"的根因是 **R2 上传覆盖率不全**——course.json 登记 133 节，但桶里只传了一部分（如概率章首节 206，中段/末段多为 404），用户仍在持续上传。
- **课程→做题联动已打通（2026-07-01）**：视频播放器新增「配套练习」按钮，通过 `MC_QUIZ_MAP` 映射表（高数/线代两题集分章关键词匹配）一键进入对应章节练习。练习页带课程上下文 + 「返回课程」入口。
- **播放器按钮栏 + 联动逻辑修复（2026-07-02）**：① 布局改为「上一节/标记已学/下一节」三个 grid 等宽一致选项框同行 + 「配套练习」独立一行、样式与前三者**完全一致的普通 btn-sm（无蓝色）**（见 `mcPlay()` 约 4780 行）；② `I.layers` 图标补 `width/height`（原缺失膨胀成 186px，约 1543 行）；③ `mcQuizForLesson()`（约 4868 行）逻辑改为**有对应分类题才跳转，无题仅弹窗留在当前页**，并先 `loadMathSets()` 再取题避免误报无题。已端到端验证（匹配→跳转做题、非匹配→弹窗不跳转）。
- **英语内容扩充试水（2026-07-02）**：离线手写并提交静态 `data/`——阅读 +3 篇双语精读、长难句填掉 clauses/inversion 两个占位库（各 4 句，`parts` 成分拆解已脚本校验拼接还原原句）、作文 +3 题（感谢/邀请/现象类，含范文解析）。均零改渲染器，已在 App 端验证三模块正常渲染。生成方式=直接编写（本批未用 DeepSeek 脚本）。
- 待办候选：把 course.json 与 R2 实际对象做覆盖率核对/裁剪（只登记已上传的）；填数学 `logic` 占位题集；校对 zyx 清洗题；概率/综合章节的对应题集清洗导入后扩展 `MC_QUIZ_MAP`；英语内容按需继续扩量（可沿用本批 JSON 结构，或写离线生成脚本批量产出）。
