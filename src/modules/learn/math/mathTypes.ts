/**
 * math 模块类型 —— 数学做题进度 / 错题本。
 * 对应现役 `state.learn.math`（题库走 data/math 静态 JSON）。
 * V7.0 暂保持选择题结构，不引入复杂公式输入。
 */

export interface MathProgressEntry {
  /** 已作答选项下标。 */
  answer?: number;
  /** 是否答对。 */
  correct?: boolean;
  lastAt?: string;
}

export interface MathState {
  /** 错题本：题目标识数组（沿用现役结构）。 */
  wrongBook: unknown[];
  /** 进度表：键 = `${setId}:${qid}`。 */
  progress: Record<string, MathProgressEntry>;
}

export const defaultMathState = (): MathState => ({
  wrongBook: [],
  progress: {},
});
