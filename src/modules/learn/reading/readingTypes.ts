/**
 * reading 模块类型 —— 阅读进度 / 生词 / 重点句。
 * 对应现役 `state.learn.reading`（文章走 data/reading 静态 JSON；
 * 阅读生词本另存 localStorage `vocab_lib_reading`）。
 */

export interface ReadingProgressEntry {
  /** 是否读完。 */
  done?: boolean;
  /** 标记的生词。 */
  words?: string[];
  /** 标记的重点句下标。 */
  marks?: number[];
  lastAt?: string;
}

export interface ReadingState {
  /** 进度表：键 = 文章 id。 */
  progress: Record<string, ReadingProgressEntry>;
}

export const defaultReadingState = (): ReadingState => ({
  progress: {},
});
