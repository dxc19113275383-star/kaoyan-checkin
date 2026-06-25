/**
 * mistakes 模块类型 —— 跨模块错题/错词聚合索引。
 * 对应现役 `state.learn.mistakes`（键 = `${mod}:${refId}`）。
 *
 * V7.0 仅形式化类型并预留 `cause`（错因）字段；
 * 智能复习（按错因/间隔重排）留待 V7.1 / V7.2。
 */

/** 错题来源模块。 */
export type MistakeMod = 'vocab' | 'reading' | 'math' | 'writing' | 'listening' | 'syntax';

export interface MistakeEntry {
  mod: MistakeMod | string;
  refId: string;
  title: string;
  tag: string;
  /** 分类（题型/考点），可选。 */
  cat?: string;
  /** 累计出错次数。 */
  count: number;
  firstAt: string;
  lastAt: string;
  resolved: boolean;
  resolvedAt?: string;
  /**
   * 错因（V7.0 预留，暂不强制写入）：
   * 'careless' 粗心 | 'knowledge' 知识点不会 | 'misread' 审题错 | 'forgot' 遗忘 | string 自定义。
   */
  cause?: 'careless' | 'knowledge' | 'misread' | 'forgot' | string;
}

/** 错题索引：键 = `${mod}:${refId}`。 */
export type MistakesState = Record<string, MistakeEntry>;

export const defaultMistakesState = (): MistakesState => ({});
