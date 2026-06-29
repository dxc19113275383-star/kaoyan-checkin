#!/usr/bin/env node
// 批量预生成「考研大纲词 5500」的词义详解（词根助记 + 地道例句 + 翻译），
// 写入 data/words/kaoyan-5500-detail.json，供前端查词卡离线零 Token 使用。
//
// 释义本身已内置在词库 def 字段（前端 splitDefSenses 拆分），本脚本只补 root/ex/exCn。
// 走已部署的 Netlify gen 代理（服务端持有 DEEPSEEK_API_KEY），无需本地密钥。
//
// 用法：
//   node scripts/gen-word-details.mjs            # 跑全部未完成的词（可中断，重跑自动续）
//   node scripts/gen-word-details.mjs --limit 200 # 只跑前 200 个未完成的词（试跑）
//   node scripts/gen-word-details.mjs --batch 12  # 自定义每批词数（默认 15）
//
// 成本提示：DeepSeek 很便宜，整套 5490 词约几角钱；脚本每批即时落盘，随时可断点续跑。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'data/words/kaoyan-5500.json');
const OUT = path.join(ROOT, 'data/words/kaoyan-5500-detail.json');
const ENDPOINT = 'https://inquisitive-chimera-50c9e9.netlify.app/.netlify/functions/chat';

const args = process.argv.slice(2);
const getArg = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const LIMIT = parseInt(getArg('--limit', '0'), 10) || 0;
const BATCH = parseInt(getArg('--batch', '15'), 10) || 15;

const SYS = '你是严谨的考研英语词汇老师。只输出 JSON 数组，不要 markdown、不要代码围栏、不要任何解释文字。';

function buildPrompt(words) {
  return '为下列考研英语单词各生成三项内容：'
    + 'root（一句话词根/词缀联想助记，没有合适的就用空字符串）、'
    + 'ex（一个不超过16词、地道且能体现常见用法的英文例句）、'
    + 'exCn（该例句的准确中文翻译）。\n'
    + '严格输出 JSON 数组，每个元素形如 {"w":"原词","root":"...","ex":"...","exCn":"..."}，'
    + '顺序与下面输入完全一致，不要遗漏、不要多余文字：\n'
    + words.join(', ');
}

function parseArray(reply) {
  let s = String(reply || '').trim();
  s = s.replace(/^```(?:json)?/i, '').replace(/```$/,'').trim();
  const a = s.indexOf('['), b = s.lastIndexOf(']');
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
}

async function genBatch(words, tries = 3) {
  for (let t = 1; t <= tries; t++) {
    try {
      const resp = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'gen', system: SYS, question: buildPrompt(words), maxTokens: 2600 })
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status + ' ' + (await resp.text()).slice(0, 120));
      const { reply, error } = await resp.json();
      if (error) throw new Error(error);
      const arr = parseArray(reply);
      if (!Array.isArray(arr) || !arr.length) throw new Error('空数组');
      return arr;
    } catch (e) {
      console.warn(`  ! 批次失败(第${t}次): ${e.message}`);
      if (t < tries) await new Promise(r => setTimeout(r, 1500 * t));
    }
  }
  return null;
}

function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

(async function main() {
  const lib = loadJson(SRC, null);
  const words = (lib && (lib.words || lib)) || [];
  if (!words.length) { console.error('读不到词库', SRC); process.exit(1); }

  const detail = loadJson(OUT, {});
  let todo = words.map(w => w.w).filter(w => w && !detail[w.toLowerCase()]);
  if (LIMIT) todo = todo.slice(0, LIMIT);

  console.log(`词库共 ${words.length} 词；已完成 ${Object.keys(detail).length}；本次待生成 ${todo.length}（每批 ${BATCH}）`);
  let done = 0;
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    const arr = await genBatch(batch);
    if (arr) {
      const byW = {};
      arr.forEach(o => { if (o && o.w) byW[String(o.w).toLowerCase()] = o; });
      batch.forEach(w => {
        const o = byW[w.toLowerCase()];
        if (o) detail[w.toLowerCase()] = { root: o.root || '', ex: o.ex || '', exCn: o.exCn || '' };
      });
      fs.writeFileSync(OUT, JSON.stringify(detail) + '\n');
      done += batch.length;
    }
    process.stdout.write(`\r进度 ${Math.min(i + BATCH, todo.length)}/${todo.length}  已落盘 ${Object.keys(detail).length} 词   `);
  }
  console.log(`\n完成。详解库共 ${Object.keys(detail).length} 词 → ${path.relative(ROOT, OUT)}`);
})();
