#!/usr/bin/env node
// 核对 R2 课程索引登记的视频哪些真的已上传（HEAD 探测）。
// 优先取 R2 在线 index/course.json（与 App 运行时一致），失败回退仓库内置 math.json。
// 输出 data/courses/coverage.json：{ checkedAt, total, ok, missing, map: { lessonId: 0|1 } }
// 用法：node scripts/check-r2-coverage.mjs   （R2 上传新视频后重跑一次并提交）
const R2 = 'https://pub-3e6c60a8d9f9400bae5689777ed59538.r2.dev';

// 与 index.html 的 _hash32 保持一致（id 必须对得上）
function hash32(s) { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; } return h.toString(36); }

async function getLessons() {
  try {
    const r = await fetch(R2 + '/index/course.json');
    if (!r.ok) throw 0;
    const j = await r.json();
    const out = [];
    for (const sub of j.subjects || []) for (const mod of sub.modules || []) for (const it of mod.items || []) {
      if (it.type !== 'video' || !it.url) continue;
      out.push({ id: 'r2_' + hash32(it.path || it.url), title: it.title || '', url: it.url });
    }
    if (out.length) return { src: 'R2 index/course.json', lessons: out };
    throw 0;
  } catch (e) {
    const fs = await import('node:fs');
    const j = JSON.parse(fs.readFileSync(new URL('../data/courses/math.json', import.meta.url), 'utf8'));
    return { src: 'local data/courses/math.json', lessons: (j.lessons || []).map(l => ({ id: l.id, title: l.title, url: l.url })) };
  }
}

async function head(url) {
  for (let a = 0; a < 2; a++) {
    try {
      const r = await fetch(url, { method: 'HEAD' });
      if (r.status === 200 || r.status === 206) return true;
      if (r.status === 404 || r.status === 403) return false;
    } catch (e) { /* 网络抖动重试一次 */ }
  }
  return false;
}

const { src, lessons } = await getLessons();
console.log('来源: ' + src + ' · ' + lessons.length + ' 节');
const map = {};
let ok = 0, i = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (i < lessons.length) {
    const l = lessons[i++];
    const up = await head(l.url);
    map[l.id] = up ? 1 : 0;
    if (up) ok++; else console.log('  缺: ' + l.title);
  }
}));
const out = { checkedAt: new Date().toISOString().slice(0, 10), total: lessons.length, ok, missing: lessons.length - ok, map };
const fs = await import('node:fs');
fs.writeFileSync(new URL('../data/courses/coverage.json', import.meta.url), JSON.stringify(out));
console.log('已上传 ' + ok + '/' + lessons.length + ' → data/courses/coverage.json');
