#!/usr/bin/env node
// 用 AI 清洗 OCR 提取的考研数学单选题（去扫描水印/页眉、修明显 OCR 噪声、规范化），
// 生成 App 可用题集 data/math/zyx-<module>.json 并登记到 data/math/index.json。
//
// 安全原则：只处理「已带正确答案」的题；AI 只做清洗/格式化，**不解题、不改答案**；
// 公式被 OCR 破坏到无法还原的题，AI 标 ok=false 自动丢弃。生成题集统一标注「AI清洗·待校」。
//
// 用法：node scripts/clean-questions.mjs [来源json路径] [--limit N] [--batch 8]
//   默认来源 E:/yyky/question_bank/index/questions_clean.json，可断点续跑。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const getArg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const SRC = args.find(a => !a.startsWith('--') && a.endsWith('.json')) || 'E:/yyky/question_bank/index/questions_clean.json';
const LIMIT = parseInt(getArg('--limit', '0'), 10) || 0;
const BATCH = parseInt(getArg('--batch', '8'), 10) || 8;
// 直连 DeepSeek（绕开未部署的 Netlify 函数后端）；key 从环境变量 DEEPSEEK_API_KEY 读取，不入库
const DEEPSEEK = 'https://api.deepseek.com/chat/completions';
const KEY = process.env.DEEPSEEK_API_KEY || '';
const OUTDIR = path.join(ROOT, 'data/math');
const STATE = path.join(OUTDIR, '_zyx800_state.json'); // { id: cleanedItem | {ok:false} }

const MOD2SET = { '高数': 'zyx-gaoshu', '线代': 'zyx-xiandai', '概率': 'zyx-gailv', '综合': 'zyx-zonghe' };
const MOD2NAME = { '高数': '周洋鑫800题·高数', '线代': '周洋鑫800题·线代', '概率': '周洋鑫800题·概率', '综合': '周洋鑫800题·综合' };

const SYS = '你是严谨的考研数学题库校对助手。只输出 JSON 数组，不要 markdown、不要解释。';

const optCount = o => (o && typeof o === 'object' && !Array.isArray(o)) ? Object.keys(o).length : (Array.isArray(o) ? o.length : 0);
const trunc = (s, n) => String(s || '').replace(/\s+/g, ' ').slice(0, n);

function buildPrompt(batch) {
  const items = batch.map(q => ({
    id: q.id, module: q.module || '',
    stem: trunc(q.stem, 400),
    options: q.options,
    answer: (q.answer || '').trim(),
    explanation: trunc(q.explanation, 400),
    rawText: trunc(q.rawText, 500),
  }));
  return '下面是 OCR 提取的若干道考研数学单选题（含扫描水印、页眉、换行噪声，公式可能损坏）。逐题清洗成规范题目。\n'
    + '严格输出 JSON 数组，每项：{"id":"原id","ok":true/false,"stem":"清洗后的题干","options":["A文本","B","C","D"(可含E)],"answer":正确项下标(从0开始,按给定答案字母换算),"explain":"简短解析(据给定解析精简,无则空串)"}\n'
    + '规则：① 删掉「CS扫描全能王」「线性代数篇/第X章」「高数篇」等水印/页眉/分册名；② 修明显 OCR 错误，数学用能读懂的通俗文本/简单符号表达；③ **不要自己解题、不要改动给定答案**；④ 公式被破坏到无法还原 → ok=false；⑤ 只输出 JSON 数组。\n\n'
    + JSON.stringify(items);
}

function parseArr(reply) {
  let s = String(reply || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const a = s.indexOf('['), b = s.lastIndexOf(']');
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
}

async function genBatch(batch, tries = 3) {
  for (let t = 1; t <= tries; t++) {
    try {
      const r = await fetch(DEEPSEEK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY },
        body: JSON.stringify({ model: 'deepseek-chat', temperature: 0.2, max_tokens: 3600, messages: [{ role: 'system', content: SYS }, { role: 'user', content: buildPrompt(batch) }] }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 100));
      const data = await r.json();
      const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      const arr = parseArr(reply);
      if (!Array.isArray(arr)) throw new Error('not array');
      return arr;
    } catch (e) { console.warn('  ! batch retry', t, e.message); if (t < tries) await new Promise(r => setTimeout(r, 1500 * t)); }
  }
  return null;
}

function load(file, fb) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fb; } }

(async function main() {
  if (!KEY) { console.error('缺少 DEEPSEEK_API_KEY 环境变量'); process.exit(1); }
  const raw = load(SRC, null);
  const all = Array.isArray(raw) ? raw : (raw && (raw.questions || raw.items)) || [];
  if (!all.length) { console.error('读不到题库', SRC); process.exit(1); }
  const cands = all.filter(q => q.type === 'single_choice' && optCount(q.options) >= 4 && /^[A-E]$/.test((q.answer || '').trim()));
  const state = load(STATE, {});
  let todo = cands.filter(q => !(q.id in state));
  if (LIMIT) todo = todo.slice(0, LIMIT);
  console.log(`候选(单选+≥4选项+有答案) ${cands.length}；已处理 ${Object.keys(state).length}；本次 ${todo.length}（每批 ${BATCH}）`);

  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    const arr = await genBatch(batch);
    if (arr) {
      const byId = {}; arr.forEach(o => { if (o && o.id) byId[o.id] = o; });
      batch.forEach(q => {
        const o = byId[q.id];
        if (o && o.ok && Array.isArray(o.options) && o.options.length >= 4 && Number.isInteger(o.answer) && o.answer >= 0 && o.answer < o.options.length && o.stem) {
          state[q.id] = { id: q.id, module: q.module || '综合', cat: q.section || q.module || '', stem: String(o.stem), options: o.options.map(String), answer: o.answer, explain: String(o.explain || '') };
        } else { state[q.id] = { ok: false }; }
      });
      fs.writeFileSync(STATE, JSON.stringify(state));
    }
    process.stdout.write(`\r进度 ${Math.min(i + BATCH, todo.length)}/${todo.length}  可用 ${Object.values(state).filter(v => v && v.stem).length}   `);
  }

  // 汇总成题集
  const bySet = {};
  Object.values(state).forEach(v => {
    if (!v || !v.stem) return;
    const set = MOD2SET[v.module] || 'zyx-zonghe';
    (bySet[set] = bySet[set] || []).push({ id: v.id, cat: v.cat || v.module, stem: v.stem, options: v.options, answer: v.answer, level: '', explain: v.explain });
  });
  const idx = load(path.join(OUTDIR, 'index.json'), { sets: [] });
  Object.keys(bySet).forEach(setId => {
    const mod = Object.keys(MOD2SET).find(k => MOD2SET[k] === setId) || '综合';
    const qs = bySet[setId];
    fs.writeFileSync(path.join(OUTDIR, setId + '.json'), JSON.stringify({ id: setId, name: MOD2NAME[mod], cat: mod, desc: '周洋鑫396数学800题 · AI清洗待校 · ' + qs.length + '题', questions: qs }, null, 1));
    if (!idx.sets.find(s => s.id === setId)) idx.sets.push({ id: setId, name: MOD2NAME[mod], desc: 'AI清洗待校 · ' + qs.length + '题', cat: mod, file: setId + '.json', count: qs.length });
    else { const s = idx.sets.find(s => s.id === setId); s.count = qs.length; s.desc = 'AI清洗待校 · ' + qs.length + '题'; }
    console.log('\n题集', setId, '→', qs.length, '题');
  });
  fs.writeFileSync(path.join(OUTDIR, 'index.json'), JSON.stringify(idx, null, 2));
  console.log('完成。');
})();
