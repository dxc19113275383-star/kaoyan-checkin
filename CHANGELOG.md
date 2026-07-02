# Changelog

本项目遵循语义化版本。日期格式 YYYY-MM-DD。

## [Unreleased]

### Added
- **P2 英语内容批量扩量（阅读 20 / 长难句 60 / 作文 15）**：新增 `scripts/gen-english-content.mjs`（本地直连 DeepSeek，key 走环境变量或本地 key 文件不入库；幂等可断点续跑；产出全部经硬校验，不合格重试三次仍败则丢弃）。
  - 阅读 6→20 篇：+14 篇经济与社会主题（供需/机会成本/外部性/汇率/垄断/公共物品/远程办公/老龄化/AI就业/绿色经济/消费主义/信贷/品牌/共享经济），每篇 4 段中英对照 + 10-12 生词 + 4 道配套题（答案位程序重排；解析禁止引用选项字母——试跑时发现字母引用会被重排打乱，已修）。
  - 长难句 16→60 句：core 24 / clauses 20 / inversion 16，结构覆盖分词/独立主格/虚拟/比较/插入语/各类从句/各类倒装强调；**每句 parts 拼接必须一字不差还原原句**的硬校验全部通过；「省略引导词定语从句」模型六次切分失败，手写补齐（c15）。cat 采用模型自报实际结构（试跑发现指定结构与实际产出可能有出入）。
  - 作文 7→15 题：+建议/投诉/咨询/祝贺/申请五类信函 + 线图/饼图/柱图三道图表大作文，均含高分范文与亮点解析，直接可用于 P1.4 默写模式。
  - 所有生成内容在来源/描述上标注「AI生成/扩充·待校」；index 计数同步更新；App 端已验证三模块渲染与配套题/默写联动正常。
- **P1.3 长难句复习队列（遮译自测）**：跨句库聚合"还不懂"且到期的句子（`syntaxDueKeys()`：unsure 且 `due<=今天`，未设 due 视为今天），句库首页出现「复习待巩固 · N 句」CTA。复习流程=只看英文先默拆默译 → 展开对照成分拆解/译文/思路 → 自评：「记住了」出队（known + resolveMistake）/「还不熟」due 推到明天继续排队。今日学习页长难句计数改为同口径。
- **P1.4 作文范文默写（本地 diff，零 AI 依赖）**：作文题新增「默写范文」——范文逐句遮挡，已默出句子显示在上方作上下文，可提示首词；每句 LCS 词级对照，漏写/写错的词在原句上标红下划线，给出本句还原 x/y 词；全篇结束出还原度%，存 `writing.dict[promptId]` 并在题目页回显"上次默写还原度"。完全离线可用。
- **P1.7 AI 失败体验**：AI 教练请求失败不再向用户展示 `HTTP 500` 等技术文案，改为人话说明 + **问题自动放回输入框（点发送即重试）** + 提示离线可先背单词/做题/精读；技术细节仍进 console 便于排查。
- **P1.2 阅读配套题（阅读闭环补全）**：6 篇精读各配 4 道理解选择题（共 24 题，题型覆盖主旨/细节/写作目的/推断/概念应用，四选一 + 中文定位解析，答案位已分散），离线手写进各 passage JSON 新增的 `questions` 字段，脚本校验全部合法。
  - 文章底部新增「配套练习」区：即时判分（选项锁定、标绿标红）+ 展示正确答案与解析；答错 `recordMistake('reading', ...)` 入错题中心（今日学习页错题数同步），重开文章答对同一题自动 `resolveMistake` 解除；`logEvent('reading','answer')` 计入薄弱点/XP（不影响精读 quest，quest 仍按标记已读计）。
  - 全部答完把成绩存 `progress[id].quiz = {correct,total,at}`，文章列表显示「题 x/4」（全对绿色），进文章时显示「上次 x/4」，可整套重做。
  - 端到端验证：4 题渲染/答错反馈与登记/答对解除/成绩持久化/列表徽标/错题中心与今日页联动，DOM 自检 15/15。
- **P1.1 今日学习聚合页（占位变真）**：学习中心新增置顶通栏「今日学习」卡（`lc-wide`），进入后一屏回答"今天该干什么"——
  - 三项 quest 进度（背单词 x/20 · 精读 x/1 · 数学 x/5，达标显「已达标」徽标）+ 到期复习词数（按 SRS due 异步统计当前词库）+ 错题未解决数 + 长难句"不确定"待复习数；每行卡片直达对应模块。
  - 「一键开始」CTA：按 背单词→精读→数学 顺序直达第一个未达标项（带"还差 N 个"文案）；三项全达标且有错题时转「清错题 N 条」；全干净则隐藏。
  - 实现：`openToday()`（只读脊柱与各模块进度，零新数据结构）；`showLearnView` 加 today 分支，原"敬请期待"占位页移除，未知视图回落学习中心。已端到端验证（全达标态/未达标 CTA 态/行卡与 CTA 跳转）。
- **P0 全部完成（0.2-0.6，详见 PLAN.md）**：
  - **0.2 占位大扫除**：`words/index.json` 删 cet4/cet6/major-en 占位、`math/index.json` 删 logic 占位；学习中心撤下「今日学习/真题题库/AI模拟考」三张"敬请期待"卡（今日学习将在 P1.1 以真功能回归）；三个模块加载层过滤 `placeholder` 条目 + active 指向已移除库时自动回退首个可用库。写作模板经核实有真数据（2.4KB groups），审计误报，未处理。
  - **0.3 SW 缓存修正（v22）**：同源 `*.json`（data/、manifest）从 cache-first 改为 stale-while-revalidate——先回缓存保离线，后台拉新写缓存，新内容提交后刷新两次内可见，无需再手动 bump SW 版本。
  - **0.4 备份加固**：导出时记录 `kaoyan_last_backup`；设置抽屉数据行新增 `#backupHint` 显示「版本号 + 距上次备份 N 天」（≥14 天提醒尽快导出）。导出文件名带日期、导入 p/wk/day/data 字段校验经核实已存在。
  - **0.5 视频覆盖率**：新增 `scripts/check-r2-coverage.mjs`（拉 R2 在线 course.json，HEAD 探测每节视频，生成 `data/courses/coverage.json`，id 哈希与前端 `_hash32` 一致）；前端 `mcUploaded()` 据此把未上传节灰显 +「未上传」badge + 章节卡/总览"N 节待上传"计数，未收录的当可播处理。**首跑结果：133/133 全部已上传**——此前"视频看不了"的覆盖率缺口已由用户补传完毕。
  - **0.6 streak 宽恕**：`computeStreak()` 允许漏 1 天不断链（漏的那天不计数，连漏 2 天才断），照顾在职易断档场景。
  - 端到端验证：学习中心 8 卡 0 占位；词库/题库选择器无"待导入"；数学课程 4 章 133 节无待上传标记；备份提示正常；构造数据验证宽恕 streak（d3✓ d2漏 d1✓ d0✓ → 3）；DOM 自检 15/15。
- **P0.1 打卡×学习打通（消除双轨脱节）+ PLAN.md 立项**：
  - 审计发现打卡（`state.data` 手动勾选）与学习脊柱（`state.learn` 自动记录）互不通信：背完词 quest 环走满但打卡任务不动、热力图/周报不吃学习行为、两套 streak 数字互相矛盾。
  - 打通：`_bumpQuest()` 在 quest 达标瞬间调用新增的 `_autoCheckTask(mod)`——按科目关键词（单词/阅读·精读/数学·高数·线代·概率 + `t-math` tag）自动勾选"今天"（`_todayPos()`：起始日期 `calcPosition` 定位，未设则当前视图）的打卡任务；**回顾/保底类任务（t-rev）不自动勾**，留给手动。勾选走 `setDone`+`save`，热力图/周报/streak 全部自然吃到学习行为。
  - streak 统一：`computeStreak()` 改为从"今天"回溯且**今天未打卡不清零（从昨天起算）**；Hero 训练舱模式不再显示独立的"连续训练"（`daily.streak`），统一显示打卡 streak，全 App 只有一个数字。
  - 端到端验证：模拟精读1篇/数学5题/背词20个 → 打卡页三科任务自动点亮、回顾项保持手动、Hero 显示"✓ 今日已达标 + 连续打卡 1"。
  - 新增 `PLAN.md`：审计结论 + P0-P3 分阶段项目计划（占位大扫除/SW缓存修正/备份加固/视频覆盖率/streak宽恕/今日学习聚合页/阅读配套题/长难句复习/作文默写/逻辑题库等），作为功能规划唯一权威来源。
- **V8 Liquid Glass 视觉层（流体背景 + 尘埃粒子 + 液态玻璃表面）**：整站前端观感重构，零功能改动。
  - **流体背景**：新增 `#bgFluid` 低分辨率画布（180px 宽）+ CSS 放大与 42px 重模糊，5 个品牌蓝/冷灰蓝/微暖橙色斑以 Lissajous 轨迹缓慢漂移；透明度压在 3%–11%，**无发光无光晕（无光污染）**。
  - **尘埃粒子**：`#bgDust` 全分辨率画布，20–44 颗（按视口面积）亚像素微尘缓慢上浮 + 正弦横摆 + 呼吸式明暗，峰值 alpha 仅 ~12%。
  - **颗粒噪点**：`#bgGrain` feTurbulence SVG 数据 URI 平铺，~2.5% 透明度打破数字平面感。
  - **性能与可达性**：单 rAF 循环 30fps 上限；页签隐藏即停；`prefers-reduced-motion` 只画一帧静态；`prefers-contrast: more` 整层隐藏并回退实底；不支持 `backdrop-filter` 的浏览器回退实底。
  - **液态玻璃表面**：新增 `--glass-*` 令牌（透明底/高光边/内折射/液面斜光）。主卡（`.card`/`.learn-card`/`.hq-card`）与弹层（modal/抽屉/词卡/查词浮层）用「透明底 + backdrop-blur + 1px 高光边 + 内折射高光 + 液面斜光」；列表卡（res/syn/wr/mist 等）与控件/输入框只用半透明底不叠 blur（控性能）；底部导航/AI 输入栏透明度加深露出流体；次级浅灰填充 `--color-bg-secondary` 改半透明让流体隐约透过。Hero 深蓝渐变卡保持原样（品牌锚点）。
- **英语内容扩充（阅读/长难句/作文，试水各 3-5）**：均离线手写、提交为静态 `data/`，零改渲染器即可用。
  - 阅读 +3 篇双语精读（行为经济学·助推 / 货币政策·通胀 / 零工经济），各含 4 段中英对照 + 生词表，登记进 `data/reading/index.json`（3→6 篇）。
  - 长难句填掉 2 个占位句库：`clauses`（从句嵌套，4 句）+ `inversion`（倒装强调，4 句），每句带成分拆解 `parts` + 拆解思路 + 易错点；`data/syntax/index.json` 去掉 `placeholder`、补 `count`。已脚本校验每句 `parts` 拼接精确还原原句、role 全部合法。
  - 作文 +3 题：感谢信、邀请信（小作文）+ 现象类（大作文），含范文与范文解析；`data/writing/*` 计数 4→7。
- **数学课程→配套做题联动**：视频播放器新增「配套练习」按钮（高数/线代章节），调用 `MC_QUIZ_MAP` 按关键词将课程标题映射到题集分类，一键进入对应章节习题练习。练习页顶部显示课程上下文 + 「返回课程」入口，完成页同样可回退。高数配 `zyx-gaoshu`（233题，分三章），线代配 `zyx-xiandai`（92题，分四章）。概率/综合暂无可清洗题集，按钮不出现。

### Fixed
- **DOM 自检过期断言**：启动自检找的「距2027年初试」文案在旧版顶栏改版时已移除，导致每次加载误报 1/15 失败；改为检查 `#countdownDays` 元素存在，现 15/15 全过。
- **数学课程播放器按钮栏 + 配套练习联动逻辑修复**：
  - 布局：上次加「配套练习」后 4 个 `flex:1` 按钮挤爆窄屏、文字换行被 40px 固定高裁切。改为「上一节 / 标记已学 / 下一节」三个**等宽一致**的选项框同一行（`grid` 三等分强制等宽，实测各 94px），「配套练习」作为独立动作单独一行（仅高数/线代章节显示）。
  - 图标：`I.layers`（配套练习图标）缺 `width/height` 且无兜底 CSS，在 flex 按钮里膨胀到 186px；补 `width="16" height="16"` 与其它图标一致。
  - 样式统一：「配套练习」去掉蓝色 CTA，改为与上一节/下一节**完全一致的普通 `btn-sm`**（白底/灰边/深色字/40px 高），仅独占一行。
  - 联动逻辑：原「匹配不到关键词就 confirm→跳整套题」的兜底不合理。改为**只有确实匹配到本节对应分类且该分类下有题目时才跳转**；否则（章节未收录 / 标题无匹配关键词 / 分类无题）一律留在当前视频页，仅弹窗「本节暂无配套练习题」，不再切走。
  - 顺带修依赖隐患：`mcQuizForLesson` 先 `loadMathSets()` 再取题——未进过「数学」模块时 `_mathSets` 未加载会导致 `loadMathQuestions` 找不到题集文件而误报无题。
- **数学课程视频加载失败有提示了（SW 升 v21）**：`mcMountVideo` 给 `<video>` 与 HLS 加 `error` 处理——视频取不到（多为该节尚未上传到 R2 → 404）时，不再是一片黑无反馈，改为清晰提示「该节视频暂时打不开（可能尚未上传），可先学已上传章节」+ 重试 / 新窗口打开。排查确认数据通路正常（Worker `/r2` 拉 course.json OK、已上传视频 206 可播），"看不了"根因是 R2 上传覆盖率不全（133 节登记、桶内仅部分已传）。
- 新增 `CLAUDE.md` 接手须知（真实架构/部署拓扑/内容管线/红线），并约定**每次改动同步回写该文档**。

### Added
- **Worker 地址内置 + 数学课程二级菜单**：`DEFAULT_BACKEND` 直接写成已部署的 Worker `https://kaoyan-ai.dxc19113275383.workers.dev`（实测 /chat 返回 OK、/r2 拉到 course.json），开箱即用无需手填。数学课程改**两级下钻**：一级章节卡（高数/线代/概率/综合，含节数+进度），点进去才看该章课程列表，消除「134 节一屏眼花」；播放返回回到所在章。SW 升 v20。
- **可配 AI 后端 + Cloudflare Worker**：AI 端点改为可配 `backendBase()`（`localStorage.backend_url` || 旧 Netlify 默认）；设置抽屉加「AI 后端」输入框（填 Worker 地址 → 保存刷新 / 测试）。新增 `cloudflare-worker/worker.js`：DeepSeek 代理（qa/err/plan/gen 模式，gen 支持 maxTokens）+ R2 JSON 代理（`/r2?key=`），免费、无构建额度问题，替代已停的 Netlify 函数。数学课程加载新增「后端 `/r2` 代理拉 R2 → 直连 R2 → 内置文件」三级兜底（配 Worker 即自动同步新课，无需 R2 CORS）。
- **对接 R2 资源库（周洋鑫396数学）**：本地 `kaoyan_asset_organizer` 整理 → 上传 Cloudflare R2 → App 接入。
  - **数学课程**：133 节视频（高数74/线代24/概率14/综合21）接入「数学课程」模块，每节 R2 直链 mp4(h264) + 封面缩略图 + 时长。加载策略「直连 R2 `index/course.json`（配了 CORS 则自动同步）→ 回退仓库内置 `data/courses/math.json`（由 course.json 生成，80KB）」；视频/封面 `<video>/<img>` 跨域免 CORS。
  - **数学题库**：`scripts/clean-questions.mjs` 直连 DeepSeek（本地 key）清洗 OCR 题——只处理已带答案的单选题，AI 仅去扫描水印/修 OCR/规范化、**不解题不改答案**，公式无法还原者丢弃；候选 366 → 可用 325，生成「周洋鑫800题·高数 233 / ·线代 92」两套，标「AI清洗·待校」。
  - **部署现实**：App 实为 GitHub Pages（纯静态、无函数）；原 Netlify 后端额度不足无法再部署函数——故新内容一律走「离线脚本生成 + 提交为静态 data」，不依赖在线后端。移除无法部署的 `netlify/functions/r2.js`。
- **Edge 神经语音朗读（客户端直连）**：阅读/单词/例句朗读优先用微软 Edge 神经语音（`en-US-AriaNeural` / 英式 `en-GB-SoniaNeural`），音质接近真人。
  - **为何客户端**：edge-tts 的 read-aloud WebSocket 会**封数据中心 IP**（实测 Netlify/Lambda 等服务端 403），只有住宅 IP 能用——故直接在**浏览器端**发起 WS（用用户自己的网络），无需 Key、免费。
  - 实现：`crypto.subtle` 算 `Sec-MS-GEC` 签名 → WSS 连 `speech.platform.bing.com` → 收 MP3 二进制 → `Audio` 播放；统一 `speak({lang,rate,onend})`，阅读逐句播放并**预取下一句**减少停顿；blob 内存缓存。
  - **稳健回退**：失败/离线/被拦截自动回退系统 `speechSynthesis`（保留自然嗓音挑选）；连续 3 次失败本会话停用神经语音。
  - 设置抽屉新增「朗读语音」开关 + 「试听一句」自检；偏好存 `localStorage.tts_neural`。
  - SW 缓存升 v19。

### Changed
- **首页精简 + 修顶部留白 + TTS 更自然**：
  - 删除首页「学习中心 / 资料·网课 / AI 学习教练」快捷入口 bento（与底栏 Tab 重复）。
  - **修复 iPhone 顶部大片留白**：`--safe-top` 原本在 `body` 和 `.appbar` 上各加一次（双倍安全区），移除 `.appbar` 的 `padding-top`、`body` 顶 padding 收为 `safe-top+6px`。
  - AppBar 的**倒计时与设置位置互换**（`.ab-actions` 改 `row-reverse`）。
  - **TTS 选最自然嗓音**：`_pickVoice()` 优先 natural/neural/online/enhanced 等高品质英文音色（在线嗓音优先），词卡/例句/阅读试听统一走它，语速 0.96、音高 1.02，缓解"机器人腔"。
- **学习中心分组 + 去「可用」标签**：模块卡按 `group` 分「英语 / 数学 / 综合」三段（带分组标题），英语聚合背单词·阅读·长难句·作文，数学聚合数学·数学课程，综合不动；移除「可用」徽章（未完成的仍保留「敬请期待」并淡化）。
- **配色调柔 + 蓝色渐变**：品牌蓝由 `#0070E0` 调柔为 `#1A6FD4`（hover `#1257B0`）；新增 `--brand-gradient`（`#2B82E2→#135FB6→#0A3C84`）用于首页 hero 与主按钮 `.btn-cta`，由纯色块改为更柔和的蓝色渐变。
- **数学课程增强**：播放器加 **倍速**（0.75/1/1.25/1.5/2×，记忆上次设置）、**课堂笔记**（每节自动保存到进度）、**导出备份**（一键下载课程+进度+笔记 JSON，导入框可粘贴备份恢复）。
- **主题换肤：PayPal 蓝 / 白**：品牌色由墨绿改为 PayPal 蓝（`--color-primary #0070E0`，hover `#0059B3`，软色 `#E5F0FB`）；首页 hero 深色容器改 PayPal 深蓝 `#003087`；信息色高亮、`.t-eng/.t-write` 标签、长难句"主语"高亮、`learn-card` 边框等硬编码墨绿一并换蓝。深色模式品牌色改亮蓝 `#409CFF`。PWA `manifest` theme_color、`icon.svg` 渐变改 PayPal 蓝。语义色（成功绿/危险红）与暖橙强调（错词/连续训练等稀缺标识）保留。

### Added
- **数学课程模块（自托管直链视频 · 章节 · 续播）**：学习中心新增「数学课程」卡 → `pageLearnMathCourse`。
  - 应用内 `<video>` / HLS(hls.js) **内嵌播放**直链视频（`.mp4`/`.m3u8`），复用资源查看器的 `detectPlayMode`/`loadHls`。
  - 章节分组列表 + 进度（已学 N/总数、单节 %、续播「上次看到 mm:ss」）；上一节/下一节、标记已学；切页自动暂停（`_mcStop`）。
  - 「添加」单节 + 「导入」批量 JSON（`{chapter,title,url}`）；课节存 `state.learn.mathcourse`（localStorage）；可选静态内置 `data/courses/math.json`。
  - 链接校验：粘贴时提示是否为可内嵌直链；**百度网盘/外链无法内嵌**会明确提示并附「新窗口打开」。卡片内置「如何把网盘视频转直链」操作指引。
- **阅读：逐句精读 + 查词卡展开解析**：
  - **逐句渲染**——文章不再是整段，按句切分（`rdSplitEn`/`rdSplitCn`），每句独立成块、自带 🔊；「显示译文」时内置 3 篇逐句中英对照（我手写的段译按句号切分恰好与英文句数对齐，自动对齐；不齐则回退整段译文）。
  - **试听改逐句**——`_rdPlayer.units` 改为句级单元，「试听全文」逐句连读 + 高亮当前句；点某句 🔊 从该句起读。
  - **查词卡（百词斩式）**——点单词弹出富卡片：大词 + 音标 + **美/英两种发音**（`speechSynthesis` en-US/en-GB）+ 释义 + 例句；新增「AI 详解」按 DeepSeek 生成**全部释义（分条）/ 词根助记 / 地道例句+翻译**，解析缓存 `localStorage['gen_wd_<word>']`，下次秒开（不编造词频/配图）。
- **背单词也能用查词卡**：把查词卡抽成通用组件 `openWordCard(entry,opts)` + 共享浮层 `#wordCard`（移出阅读页，任意页可弹）。斩词/拼写答完的反馈卡、以及「已学单词浏览」每行都加了「词义详解」入口，点开即同款富卡片（美/英发音 + 释义 + 例句 + AI 详解；背单词侧不显示「加入背单词」）。
- **释义内置化（省 Token）+ 答错直弹详解**：
  - **删除答题后的冗长反馈块**（再记一次 / 生成例句 / 已加入错词本），只留「词义详解」+「下一个」；**答错自动弹出词义详解卡**。
  - **释义零 Token 内置**——`splitDefSenses()` 把词库 `def` 串按词性（n./v./vt./adj.…）拆成「全部释义」多行，**5500 全部词的释义都来自内置词库、不花 Token**；查词卡 AI 按钮收窄为只补「词根助记 + 地道例句」。
  - **冷门词才 AI**——只有「词库未收录释义」的词在打开卡片时才自动调一次 AI（并永久缓存 `gen_wd_<word>`）；已收录词全部走内置。阅读点词同理：收录词秒显内置释义，未收录才 AI。
- **内置词义详解库（词根+例句，离线零 Token）**：
  - 新增 `scripts/gen-word-details.mjs`——走已部署的 gen 代理分批（默认 15 词/批）生成 5500 词的「词根助记 + 地道例句 + 翻译」，落盘 `data/words/kaoyan-5500-detail.json`，**即时落盘、断点续跑**。
  - `chat.js` 的 gen 模式支持 `maxTokens`（200–4000，默认 600），便于批量生成不被截断。
  - 前端 `loadWordDetail()` 懒加载详解库；查词卡**优先用内置详解**（词根/例句，零 Token），查不到才按需 AI——绝大多数词彻底离线零成本。

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
