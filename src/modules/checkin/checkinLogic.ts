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

/** 「今天」对应的打卡键（按现役维护的 p/wk/day 位置）。 */
export function todayKey(state: CheckinState): string {
  return keyFor(state.p, state.wk, state.day);
}

/** 今天是否已打卡。 */
export function isTodayDone(state: CheckinState): boolean {
  return isDayDone(state, state.p, state.wk, state.day);
}

/** 当前周（同一 p+wk）已打卡天数。 */
export function weekDoneDays(state: CheckinState): number {
  const prefix = `p${state.p}w${state.wk}d`;
  return Object.entries(state.data).filter(
    ([k, v]) => k.startsWith(prefix) && Array.isArray(v) && v.length > 0,
  ).length;
}

/**
 * 返回「把今天标记为 done/未done」后的新 state（纯函数，不落盘）。
 * done=true 写入保底完成项 [0]（与现役按任务下标存储兼容）；done=false 清空当天记录。
 */
export function markTodayDone(state: CheckinState, done: boolean): CheckinState {
  const key = todayKey(state);
  const data = { ...state.data };
  if (done) {
    if (!Array.isArray(data[key]) || data[key].length === 0) data[key] = [0];
  } else {
    delete data[key];
  }
  return { ...state, data };
}
