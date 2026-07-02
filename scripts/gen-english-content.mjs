#!/usr/bin/env node
// P2 英语内容批量生成：阅读（含配套题）/ 长难句（成分拆解硬校验）/ 作文（含范文）。
// 本地直连 DeepSeek（key 不入库：环境变量 DEEPSEEK_API_KEY 优先，其次本地 key 文件）。
// 所有产出经硬校验（结构/长度/parts 拼接还原原句/答案位重排），不合格自动重试，仍失败则丢弃并报告。
//
// 用法：
//   node scripts/gen-english-content.mjs reading   # 生成 14 篇阅读 → data/reading/ + 登记 index
//   node scripts/gen-english-content.mjs syntax    # 生成 44 句长难句 → 并入三个句库 + 更新 count
//   node scripts/gen-english-content.mjs writing   # 生成 8 道作文题 → 并入 prompts + 更新 index
//   加 --limit N 只试跑前 N 条；重跑自动跳过已存在的条目（幂等，可断点续跑）。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const KEY_FILE = 'E:\\BaiduNetdiskDownload\\kaoyan_asset_organizer\\.deepseek_key';

function apiKey() {
  if (process.env.DEEPSEEK_API_KEY) return process.env.DEEPSEEK_API_KEY.trim();
  try { return fs.readFileSync(KEY_FILE, 'utf8').trim(); } catch (e) {}
  console.error('缺少 DEEPSEEK_API_KEY（环境变量或 ' + KEY_FILE + '）'); process.exit(1);
}
const KEY = apiKey();

const args = process.argv.slice(2);
const MODE = args[0];
const LIMIT = (() => { const i = args.indexOf('--limit'); return i >= 0 ? parseInt(args[i + 1], 10) : 0; })();

async function chat(system, user, maxTokens, tries = 3) {
  for (let t = 1; t <= tries; t++) {
    try {
      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          max_tokens: maxTokens, temperature: 0.8,
          response_format: { type: 'json_object' }
        })
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status + ' ' + (await resp.text()).slice(0, 150));
      const j = await resp.json();
      const txt = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      if (!txt) throw new Error('空回复');
      return JSON.parse(txt);
    } catch (e) {
      console.warn('  ! 调用失败(第' + t + '次): ' + e.message.slice(0, 160));
      if (t < tries) await new Promise(r => setTimeout(r, 2000 * t));
    }
  }
  return null;
}

const loadJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const saveJson = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n', 'utf8');
function shuffleOptions(q) {
  // 重排选项防"答案总在B"：记住正确项文本 → 洗牌 → 回填 answer
  const correct = q.options[q.answer];
  for (let i = q.options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
  }
  q.answer = q.options.indexOf(correct);
}

// ============ 阅读 ============
const READING_TOPICS = [
  { id: 'supply-demand',      title: 'The Invisible Hand of Supply and Demand', hint: '供需与价格机制：价格如何协调千万人的决策；短缺与过剩' },
  { id: 'opportunity-cost',   title: 'What Everything Really Costs',            hint: '机会成本：选择的代价是放弃的次优选项；沉没成本误区' },
  { id: 'externalities',      title: 'When Markets Fail: The Problem of Externalities', hint: '外部性：污染的社会成本、疫苗的正外部性、税收与补贴矫正' },
  { id: 'exchange-rates',     title: 'Why Currencies Rise and Fall',            hint: '汇率：升贬值对出口进口的影响、央行干预' },
  { id: 'monopoly-competition', title: 'The Price of Too Much Power',           hint: '垄断与竞争：垄断定价、创新激励、反垄断监管' },
  { id: 'public-goods',       title: 'Who Pays for the Lighthouse?',            hint: '公共物品与搭便车：灯塔/国防、市场为何供给不足、政府角色' },
  { id: 'remote-work',        title: 'The Office Is Not Dead Yet',              hint: '远程办公：效率与协作的权衡、混合办公趋势、对城市的影响' },
  { id: 'aging-population',   title: 'The Economics of Growing Old',            hint: '人口老龄化：劳动力萎缩、养老金压力、延迟退休与自动化应对' },
  { id: 'ai-employment',      title: 'Will Machines Take Your Job?',            hint: 'AI 与就业：替代与创造并存、技能转型、历史上的技术焦虑' },
  { id: 'green-economy',      title: 'The Business Case for Going Green',       hint: '绿色经济：碳定价、新能源产业、环保与增长非零和' },
  { id: 'consumerism',        title: 'Why We Buy What We Do Not Need',          hint: '消费主义：广告与身份认同、冲动消费、理性消费观' },
  { id: 'credit-debt',        title: 'Living on Borrowed Money',                hint: '信用与债务：信贷的作用、过度负债风险、年轻人超前消费' },
  { id: 'brand-loyalty',      title: 'The Hidden Value of a Name',              hint: '品牌价值：品牌溢价、信任降低交易成本、品牌危机' },
  { id: 'sharing-economy',    title: 'Owning Less, Using More',                 hint: '共享经济：闲置资源再配置、信任机制、与传统行业冲突' }
];
async function genReading() {
  const idxFile = path.join(ROOT, 'data/reading/index.json');
  const idx = loadJson(idxFile);
  const todo = READING_TOPICS.filter(t => !idx.passages.some(p => p.id === t.id));
  const list = LIMIT ? todo.slice(0, LIMIT) : todo;
  console.log('阅读：待生成 ' + list.length + ' 篇');
  const SYS = '你是考研英语二命题人。只输出一个 JSON 对象，不要 markdown 围栏和多余文字。英文地道自然、难度对齐考研英语二真题（有从句和高级词但不堆砌）；中文准确通顺。';
  let ok = 0;
  for (const t of list) {
    console.log('  生成: ' + t.id);
    const user = '写一篇考研英语二风格阅读文章并配套出题。主题：' + t.title + '（' + t.hint + '）。\n'
      + '输出 JSON 对象，字段：\n'
      + 'intro: 一句中文导语（20字内，引起兴趣）\n'
      + 'paragraphs: 恰好4段英文，每段55-75词，整体结构=引入现象→机制/原理→反方或问题→结论/启示\n'
      + 'cn: 恰好4段，与 paragraphs 一一对应的准确中文翻译\n'
      + 'glossary: 10-12个词条，选文中真实出现的考研大纲词，每条 {"w":"原形或文中形式","ph":"/音标/","def":"词性.中文释义","ex":"文中或自拟短语","exCn":"短语翻译"}\n'
      + 'questions: 恰好4题（题型依次：主旨题、细节题、推断题、细节或语义题），每题 {"q":"英文问题","options":["英文选项x4"],"answer":正确项下标0-3,"explain":"中文解析：定位第几段+为什么对+干扰项为何错"}。'
      + '注意：explain 里**严禁出现 A/B/C/D 等选项字母或"选项3"这类位置词**（选项顺序会被程序重排），一律用选项内容指代，如"「农民转向种小麦」一项"。';
    const o = await chat(SYS, user, 4000);
    if (!o) { console.warn('  x 失败丢弃: ' + t.id); continue; }
    const bad =
      !Array.isArray(o.paragraphs) || o.paragraphs.length !== 4 ||
      !Array.isArray(o.cn) || o.cn.length !== 4 ||
      !Array.isArray(o.glossary) || o.glossary.length < 8 ||
      !Array.isArray(o.questions) || o.questions.length !== 4 ||
      o.questions.some(q => !q.q || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3 || !q.explain);
    if (bad) { console.warn('  x 校验不过丢弃: ' + t.id); continue; }
    o.questions.forEach(shuffleOptions);
    const out = { id: t.id, title: t.title, source: 'AI生成·待校 · 经济与社会', level: '考研英语二', intro: o.intro || '',
                  paragraphs: o.paragraphs, cn: o.cn, glossary: o.glossary, questions: o.questions };
    saveJson(path.join(ROOT, 'data/reading', t.id + '.json'), out);
    idx.passages.push({ id: t.id, title: t.title, source: 'AI生成·待校 · 经济与社会', level: '考研英语二', file: t.id + '.json' });
    saveJson(idxFile, idx);
    ok++;
  }
  console.log('阅读完成：新增 ' + ok + ' 篇，总计 ' + idx.passages.length + ' 篇');
}

// ============ 长难句 ============
const ROLES = ['subj', 'verb', 'obj', 'attr', 'adv', 'appos', 'mark', 'plain'];
const SYNTAX_SPECS = [
  // core 句库 +16（s9..s24）：混合高频结构
  ...['宾语从句中嵌套定语从句', '过去分词短语作后置定语', '现在分词短语作结果状语', '形式主语 it + 不定式真主语',
      '状语从句省略主语和be动词', '比较结构 more...than + 从句', 'as 引导的非限定性定语从句', '插入语分隔主谓',
      '并列谓语 + 共享主语的长句', '介词 + which 引导的定语从句', '虚拟语气 + if 条件句', 'not...but... 对比结构',
      '名词性从句作表语', '独立主格结构作伴随状语', 'so...that 结果状语从句', 'whether 引导的主语从句'
     ].map((s, i) => ({ set: 'kaoyan-eng2-core', id: 's' + (9 + i), struct: s })),
  // clauses 句库 +16（c5..c20）：从句专项
  ...['定语从句嵌套定语从句', '同位语从句 + 定语从句连用', '宾语从句中的间接引语', '让步状语从句 although + 转折',
      '时间状语从句 + 主句倒装均衡', '原因状语从句 not because...but because', '条件状语从句 unless', '目的状语从句 so that',
      '定语从句修饰整个主句（which 指代前句）', '限定性与非限定性定语从句对比', '省略引导词的定语从句', 'what 引导的宾语从句',
      '主语从句 that 开头', '多重宾语从句层层转述', '定语从句中介词前置 to whom', '同位语从句解释抽象名词 evidence/claim'
     ].map((s, i) => ({ set: 'kaoyan-eng2-clauses', id: 'c' + (5 + i), struct: s })),
  // inversion 句库 +12（v5..v16）：倒装/强调/特殊句式
  ...['Only + 状语开头的部分倒装', 'Not until 开头的倒装', 'Hardly...when 倒装', '否定词 Never 开头倒装',
      'So + 形容词开头的倒装', '地点状语开头的完全倒装', 'It is...that 强调句强调状语', 'It is...that 强调句强调主语',
      '虚拟条件句省略 if 的倒装 Had...', 'Nor/Neither 开头的倒装', 'as 引导让步倒装（Adj as S is）', 'Not only...but also 倒装'
     ].map((s, i) => ({ set: 'kaoyan-eng2-inversion', id: 'v' + (5 + i), struct: s }))
];
async function genSyntax() {
  const files = { 'kaoyan-eng2-core': 'kaoyan-eng2-core.json', 'kaoyan-eng2-clauses': 'kaoyan-eng2-clauses.json', 'kaoyan-eng2-inversion': 'kaoyan-eng2-inversion.json' };
  const data = {}; Object.keys(files).forEach(k => { data[k] = loadJson(path.join(ROOT, 'data/syntax', files[k])); });
  const todo = SYNTAX_SPECS.filter(sp => !data[sp.set].sentences.some(x => x.id === sp.id));
  const list = LIMIT ? todo.slice(0, LIMIT) : todo;
  console.log('长难句：待生成 ' + list.length + ' 句');
  const SYS = '你是考研英语二长难句讲解老师。只输出一个 JSON 对象，不要 markdown 围栏。';
  const EXAMPLE = '{"en":"The argument that tourism hurts culture is one that many challenge.","cn":"认为旅游伤害文化的观点是许多人质疑的论断。","level":"中等","parts":[{"text":"The argument","role":"subj","note":"主语"},{"text":" ","role":"plain"},{"text":"that tourism hurts culture","role":"appos","note":"同位语从句"},{"text":" ","role":"plain"},{"text":"is","role":"verb","note":"系动词"},{"text":" ","role":"plain"},{"text":"one","role":"obj","note":"表语"},{"text":" ","role":"plain"},{"text":"that many challenge","role":"attr","note":"定语从句修饰one"},{"text":".","role":"plain"}],"tip":"主干是 The argument is one...","trap":"两个that角色不同..."}';
  let ok = 0;
  for (const sp of list) {
    console.log('  生成: ' + sp.set + '/' + sp.id + ' [' + sp.struct + ']');
    let done = false;
    for (let attempt = 1; attempt <= 3 && !done; attempt++) {
      const user = '造一个考研英语二真题风格的长难句（22-35词，主题从经济/商业/社会/教育/科技中任选，不要与旅游相关），核心考查结构：【' + sp.struct + '】。\n'
        + '输出 JSON 对象，字段：\n'
        + 'en: 英文原句\ncn: 准确中文翻译\nlevel: "中等"或"偏难"\ncat: 该句实际核心结构的简称（10字内，如"同位语+定语从句"）\n'
        + 'parts: 把 en 按语法成分切成数组，每项 {"text":"...","role":"...","note":"中文说明(plain可省note)"}；'
        + 'role 只能取 subj/verb/obj/attr/adv/appos/mark/plain（词间空格和标点用 {"text":" ","role":"plain"} 单独成项）；'
        + '**所有 text 按顺序直接拼接必须与 en 一字不差**（包括每个空格和标点）。\n'
        + 'tip: 中文拆解思路（主干是什么、各成分怎么识别，可用**加粗**）\ntrap: 中文易错点提醒\n'
        + '参考格式示例：' + EXAMPLE;
      const o = await chat(SYS, user, 2200);
      if (!o) break;
      const joined = Array.isArray(o.parts) ? o.parts.map(p => p.text == null ? '' : String(p.text)).join('') : '';
      const bad = !o.en || !o.cn || !o.tip || !o.trap ||
        !Array.isArray(o.parts) || o.parts.length < 3 ||
        o.parts.some(p => !ROLES.includes(p.role)) ||
        joined !== o.en ||
        o.en.split(/\s+/).length < 16 ||
        data[sp.set].sentences.some(x => x.en === o.en);
      if (bad) { console.warn('    ~ 第' + attempt + '次校验不过' + (joined !== o.en ? '（parts 拼接≠原句）' : '')); continue; }
      data[sp.set].sentences.push({ id: sp.id, cat: (o.cat && String(o.cat).slice(0, 14)) || sp.struct, level: o.level === '偏难' ? '偏难' : '中等', en: o.en, cn: o.cn, parts: o.parts, tip: o.tip, trap: o.trap });
      saveJson(path.join(ROOT, 'data/syntax', files[sp.set]), data[sp.set]);
      ok++; done = true;
    }
    if (!done) console.warn('  x 三次失败丢弃: ' + sp.id);
  }
  // 更新 index count
  const idxFile = path.join(ROOT, 'data/syntax/index.json');
  const idx = loadJson(idxFile);
  idx.sets.forEach(s => { if (data[s.id]) s.count = data[s.id].sentences.length; });
  saveJson(idxFile, idx);
  console.log('长难句完成：新增 ' + ok + ' 句，总计 ' + Object.values(data).reduce((n, d) => n + d.sentences.length, 0) + ' 句');
}

// ============ 作文 ============
const WRITING_SPECS = [
  { id: 'w8',  type: 'small', cat: '小作文·建议信', score: 10, scene: '外国朋友 Anna 下月来你所在的城市旅游一周，写邮件给她 2-3 条游玩建议并说明理由' },
  { id: 'w9',  type: 'small', cat: '小作文·投诉信', score: 10, scene: '你网购的耳机使用一周后出现故障，向客服部门写信说明问题并提出解决要求（退款或换货）' },
  { id: 'w10', type: 'small', cat: '小作文·咨询信', score: 10, scene: '你想报名一个线上英语写作课程，写信向机构咨询课程安排、师资和费用' },
  { id: 'w11', type: 'small', cat: '小作文·祝贺信', score: 10, scene: '你的同学 Wang Lei 在全国大学生创业大赛中获一等奖，写信祝贺并请教经验' },
  { id: 'w12', type: 'small', cat: '小作文·申请信', score: 10, scene: '学校图书馆招聘学生助理，写信申请该职位，说明你的优势和可工作时间' },
  { id: 'w13', type: 'big',   cat: '大作文·图表(线图)', score: 15, scene: '折线图：某市 2015-2024 年实体书店数量与线上图书销售额的变化趋势（书店从 480 家降到 260 家后回升到 310 家；线上销售额持续上升），要求描述图表、分析原因、给出评论' },
  { id: 'w14', type: 'big',   cat: '大作文·图表(饼图)', score: 15, scene: '饼图：某高校大学生周末时间分配（学习 35%、兼职 20%、社交 18%、运动 12%、其他 15%），要求描述图表、分析现象、谈你的看法' },
  { id: 'w15', type: 'big',   cat: '大作文·图表(柱图)', score: 15, scene: '柱状图：2019 与 2024 年某市居民三种通勤方式占比对比（私家车 45%→32%、公共交通 38%→41%、骑行+步行 17%→27%），要求概括变化、分析原因、指出意义' }
];
async function genWriting() {
  const file = path.join(ROOT, 'data/writing/kaoyan-eng2-prompts.json');
  const doc = loadJson(file);
  const todo = WRITING_SPECS.filter(sp => !doc.prompts.some(p => p.id === sp.id));
  const list = LIMIT ? todo.slice(0, LIMIT) : todo;
  console.log('作文：待生成 ' + list.length + ' 题');
  const SYS = '你是考研英语二作文命题与范文老师。只输出一个 JSON 对象，不要 markdown 围栏。范文语言地道、结构清晰、可背诵。';
  let ok = 0;
  for (const sp of list) {
    console.log('  生成: ' + sp.id + ' ' + sp.cat);
    const words = sp.type === 'small' ? '约 100 词' : '约 150 词';
    const user = '为考研英语二出一道' + sp.cat + '（满分' + sp.score + '分，' + words + '）。情境：' + sp.scene + '。\n'
      + '输出 JSON 对象，字段：\n'
      + 'title: 中文短标题（12字内，格式"XX信：一句话情境"或图表主题）\n'
      + 'prompt: 英文题目指令（真题格式：Suppose.../Write an essay based on the chart...，含分点要求，小作文注明 sign as "Li Ming"，图表题用文字描述图表数据）\n'
      + 'requirements: 3条中文要求要点\n'
      + 'sample: 高分范文（' + (sp.type === 'small' ? '95-115' : '145-170') + '词，书信含称呼落款；图表作文三段：描述-分析-评论）\n'
      + 'sampleNotes: 中文范文亮点解析（骨架句型+可复用表达，80字内）';
    const o = await chat(SYS, user, 2200);
    if (!o) { console.warn('  x 失败丢弃: ' + sp.id); continue; }
    const wc = (String(o.sample || '').match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).length;
    const bad = !o.title || !o.prompt || !Array.isArray(o.requirements) || o.requirements.length < 2 || !o.sample || wc < 70 || !o.sampleNotes;
    if (bad) { console.warn('  x 校验不过丢弃: ' + sp.id + '（范文 ' + wc + ' 词）'); continue; }
    doc.prompts.push({ id: sp.id, type: sp.type, cat: sp.cat, score: sp.score, words: words, title: o.title,
                       prompt: o.prompt, requirements: o.requirements, sample: o.sample, sampleNotes: o.sampleNotes });
    saveJson(file, doc);
    ok++;
  }
  // 更新 index
  const idxFile = path.join(ROOT, 'data/writing/index.json');
  const idx = loadJson(idxFile);
  const set = idx.sets.find(s => s.id === 'kaoyan-eng2-prompts');
  if (set) { set.count = doc.prompts.length; set.desc = '小作文 ' + doc.prompts.filter(p => p.type === 'small').length + ' 题 + 大作文 ' + doc.prompts.filter(p => p.type === 'big').length + ' 题'; }
  saveJson(idxFile, idx);
  console.log('作文完成：新增 ' + ok + ' 题，总计 ' + doc.prompts.length + ' 题');
}

(async function main() {
  if (MODE === 'reading') await genReading();
  else if (MODE === 'syntax') await genSyntax();
  else if (MODE === 'writing') await genWriting();
  else { console.log('用法: node scripts/gen-english-content.mjs reading|syntax|writing [--limit N]'); process.exit(1); }
})();
