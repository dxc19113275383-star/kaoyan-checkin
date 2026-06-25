/**
 * contentClient —— 统一从 data/ 读取静态学习内容（带内存缓存）。
 *
 * 约定：所有内容走 `data/...` 相对路径（与现役 index.html 一致）。
 * 生产由 dist/data 提供；开发由 vite.config 的 dataDir 中间件提供。
 * 非 placeholder 的库才有实际文件；缺文件时 fetch 失败 → 返回 null，调用方降级。
 */
import type {
  VocabLibMeta,
  VocabLibFile,
  ReadingPassageMeta,
  ReadingPassageFile,
  MathSetMeta,
  MathSetFile,
  SyntaxSetMeta,
  SyntaxSetFile,
} from './contentTypes';

const cache = new Map<string, unknown>();

async function getJSON<T>(path: string): Promise<T | null> {
  if (cache.has(path)) return cache.get(path) as T;
  try {
    const resp = await fetch(path);
    if (!resp.ok) return null;
    const data = (await resp.json()) as T;
    cache.set(path, data);
    return data;
  } catch {
    return null;
  }
}

// ---- 词汇 ----
export const loadVocabLibs = () =>
  getJSON<{ libraries: VocabLibMeta[] }>('data/words/index.json').then((j) => j?.libraries ?? []);
export const loadVocabLib = (file: string) => getJSON<VocabLibFile>(`data/words/${file}`);

// ---- 阅读 ----
export const loadReadingPassages = () =>
  getJSON<{ passages: ReadingPassageMeta[] }>('data/reading/index.json').then((j) => j?.passages ?? []);
export const loadReadingPassage = (file: string) => getJSON<ReadingPassageFile>(`data/reading/${file}`);

// ---- 数学 ----
export const loadMathSets = () =>
  getJSON<{ sets: MathSetMeta[] }>('data/math/index.json').then((j) => j?.sets ?? []);
export const loadMathSet = (file: string) => getJSON<MathSetFile>(`data/math/${file}`);

// ---- 长难句 ----
export const loadSyntaxSets = () =>
  getJSON<{ sets: SyntaxSetMeta[] }>('data/syntax/index.json').then((j) => j?.sets ?? []);
export const loadSyntaxSet = (file: string) => getJSON<SyntaxSetFile>(`data/syntax/${file}`);
