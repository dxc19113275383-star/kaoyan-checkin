/**
 * contentTypes —— 静态内容库（data/）的类型，忠实映射现有 JSON 结构。
 * 内容与组件逻辑分离：这些只是「读」契约，data 文件才是真相。
 */

// ---- 词汇 data/words ----
export interface WordEntry {
  w: string;
  ph?: string;
  def: string;
  ex?: string;
  exCn?: string;
}
export interface VocabLibMeta {
  id: string;
  name: string;
  desc?: string;
  file: string;
  tag?: string;
  required?: boolean;
  placeholder?: boolean;
}
export interface VocabLibFile {
  id: string;
  name: string;
  desc?: string;
  words: WordEntry[];
}

// ---- 阅读 data/reading ----
export interface ReadingPassageMeta {
  id: string;
  title: string;
  source?: string;
  level?: string;
  file: string;
}
export interface ReadingPassageFile {
  id: string;
  title: string;
  source?: string;
  level?: string;
  intro?: string;
  paragraphs: string[];
  /** 生词表（部分文章带）。 */
  glossary?: WordEntry[];
}

// ---- 数学 data/math ----
export interface MathQuestion {
  id: string;
  cat?: string;
  stem: string;
  options: string[];
  answer: number;
  level?: string;
  explain?: string;
}
export interface MathSetMeta {
  id: string;
  name: string;
  desc?: string;
  cat?: string;
  file: string;
  count?: number;
  placeholder?: boolean;
}
export interface MathSetFile {
  id: string;
  name: string;
  cat?: string;
  desc?: string;
  questions: MathQuestion[];
}

// ---- 长难句 data/syntax ----
export interface SyntaxPart {
  text: string;
  role?: string;
  note?: string;
}
export interface SyntaxSentence {
  id: string;
  cat?: string;
  level?: string;
  en: string;
  cn: string;
  parts?: SyntaxPart[];
}
export interface SyntaxSetMeta {
  id: string;
  name: string;
  desc?: string;
  cat?: string;
  file: string;
  count?: number;
  placeholder?: boolean;
}
export interface SyntaxSetFile {
  id: string;
  name: string;
  cat?: string;
  desc?: string;
  sentences: SyntaxSentence[];
}
