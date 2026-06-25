/**
 * checkinLogic —— 打卡纯函数（与现役 index.html 的 keyFor / computeStreak 等行为一致）。
 * 业务逻辑从组件抽离，便于单测与 V7.1 复用。
 */
import type { CheckinState } from './checkinTypes';

/** 打卡键：`p{p}w{wk}d{day}`。 */
export function keyFor(p: number, wk: number, day: number): string {
  return `p${p}w${wk}d${day}`;
}

/** 某天是否已打卡（有任意完成项）。 */
export function isDayDone(state: CheckinState, p: number, wk: number, day: number): boolean {
  const arr = state.data[keyFor(p, wk, day)];
  return Array.isArray(arr) && arr.length > 0;
}

/** 累计打卡天数（data 中非空记录数）。 */
export function computeTotalDays(state: CheckinState): number {
  return Object.values(state.data).filter((v) => Array.isArray(v) && v.length > 0).length;
}
