/**
 * learnTypes —— 学习中心聚合类型，忠实映射现役 `state.learn`（defaultLearn）。
 *
 * 「脊柱」字段（log/mistakes/weakness/daily/profile/lastPack）是 V8 训练舱引入的
 * 统一学习事件流与画像，本次只补类型，逻辑仍在 index.html 内（window.logEvent 等）。
 */
import type { VocabState } from './vocab/vocabTypes';
import { defaultVocabState } from './vocab/vocabTypes';
import type { MathState } from './math/mathTypes';
import { defaultMathState } from './math/mathTypes';
import type { ReadingState } from './reading/readingTypes';
import { defaultReadingState } from './reading/readingTypes';
import type { SyntaxState } from './syntax/syntaxTypes';
import { defaultSyntaxState } from './syntax/syntaxTypes';
import type { MistakesState } from './mistakes/mistakesTypes';
import { defaultMistakesState } from './mistakes/mistakesTypes';

/** 作文：草稿 + 批改历史。 */
export interface WritingState {
  active: string;
  drafts: Record<string, string>;
  history: unknown[];
}

/** append-only 学习事件。 */
export interface LearnEvent {
  id: string;
  ts: string;
  mod: string;
  action: string;
  refId: string;
  correct: boolean | null;
  durMs: number;
  meta: { tag: string; cat: string; title: string };
}

export interface WeaknessBucket {
  total: number;
  wrong: number;
}

export interface WeaknessState {
  byMod: Record<string, WeaknessBucket>;
  byTag: Record<string, WeaknessBucket>;
  byCat: Record<string, WeaknessBucket>;
  updatedAt: string;
  window: number;
}

export interface DailyState {
  date: string;
  xp: number;
  quests: Record<string, number>;
  streak: number;
  lastDate: string;
}

export interface ProfileState {
  level: number;
  totalXp: number;
  examTarget: string;
  strict: boolean;
}

export interface TrainingPack {
  generatedAt: string;
  source: string;
  items: unknown[];
  idx: number;
  correct: number;
}

/** 学习中心完整状态，对应 defaultLearn() 的返回值。 */
export interface LearnState {
  vocab: VocabState;
  reading: ReadingState;
  math: MathState;
  syntax: SyntaxState;
  writing: WritingState;
  exams: { progress: Record<string, unknown> };
  mock: { history: unknown[] };
  // ===== 训练舱脊柱 =====
  log: LearnEvent[];
  mistakes: MistakesState;
  weakness: WeaknessState;
  daily: DailyState;
  profile: ProfileState;
  lastPack: TrainingPack | null;
}

export const defaultWritingState = (): WritingState => ({
  active: 'kaoyan-eng2-prompts',
  drafts: {},
  history: [],
});

export const defaultLearnState = (): LearnState => ({
  vocab: defaultVocabState(),
  reading: defaultReadingState(),
  math: defaultMathState(),
  syntax: defaultSyntaxState(),
  writing: defaultWritingState(),
  exams: { progress: {} },
  mock: { history: [] },
  log: [],
  mistakes: defaultMistakesState(),
  weakness: { byMod: {}, byTag: {}, byCat: {}, updatedAt: '', window: 14 },
  daily: { date: '', xp: 0, quests: {}, streak: 0, lastDate: '' },
  profile: { level: 1, totalXp: 0, examTarget: 'kaoyan_eng2', strict: true },
  lastPack: null,
});
