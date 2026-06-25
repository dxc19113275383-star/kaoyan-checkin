/**
 * syntax 模块类型 —— 长难句学习状态。
 * 对应现役 `state.learn.syntax`（句库走 data/syntax 静态 JSON）。
 * 进度键 = `${setId}:${sid}` → { known, lastAt }。
 */

export interface SyntaxProgressEntry {
  known?: boolean;
  lastAt?: string;
}

export interface SyntaxState {
  /** 当前激活句集 id。 */
  active: string;
  progress: Record<string, SyntaxProgressEntry>;
}

export const defaultSyntaxState = (): SyntaxState => ({
  active: 'kaoyan-eng2-core',
  progress: {},
});
