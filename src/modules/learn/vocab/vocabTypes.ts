/**
 * vocab 模块类型 —— 单词学习进度 / 复习状态 / 错词本 / 用户词库。
 * 对应现役 `state.learn.vocab`（内容库走 data/words 静态 JSON，这里只存进度/设置）。
 */

/** 单条单词学习进度（键 = 词条 id 或 word）。 */
export interface VocabProgressEntry {
  /** 复习等级 / 熟练度。 */
  level?: number;
  /** 上次学习时间 ISO。 */
  lastAt?: string;
  /** 是否已掌握。 */
  known?: boolean;
}

export interface VocabDaily {
  date: string;
  newDone: number;
  reviewDone: number;
}

export interface VocabState {
  /** 当前激活词库 id（对应 data/words/index.json 中的库）。 */
  active: string;
  settings: { dailyNew: number };
  /** 进度表：键 = 词条标识。 */
  progress: Record<string, VocabProgressEntry>;
  /** 错词本（词条标识数组或对象，沿用现役结构）。 */
  wrongBook: unknown[];
  daily: VocabDaily;
  /** 用户自建词库元数据（实际词条另存 `vocab_lib_<id>`）。 */
  userLibs: Array<{ id: string; name: string; count?: number }>;
}

export const defaultVocabState = (): VocabState => ({
  active: 'kaoyan',
  settings: { dailyNew: 20 },
  progress: {},
  wrongBook: [],
  daily: { date: '', newDone: 0, reviewDone: 0 },
  userLibs: [],
});
