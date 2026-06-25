/**
 * mistakesStore —— 跨模块错题索引读写 + 聚合/重练查询。
 * 对应现役 window.recordMistake / resolveMistake 的持久化层。
 */
import { readSlice, writeSlice } from '@/lib/storage/appStateStore';
import type { MistakesState, MistakeEntry, MistakeMod } from './mistakesTypes';

export const getMistakes = (): MistakesState => readSlice('mistakes');
export const setMistakes = (next: MistakesState): void => writeSlice('mistakes', next);

/** 错题 key。 */
export const mistakeKey = (mod: string, refId: string): string => `${mod}:${refId}`;

/** 登记一次错题（同 refId 累计 count）。 */
export function recordMistake(mod: MistakeMod | string, refId: string, info?: Partial<MistakeEntry>): void {
  const all = getMistakes();
  const k = mistakeKey(mod, refId);
  const now = new Date().toISOString();
  const cur: MistakeEntry = all[k] ?? { mod, refId, title: '', tag: '', count: 0, firstAt: now, lastAt: now, resolved: false };
  cur.count += 1;
  cur.lastAt = now;
  cur.resolved = false;
  if (info) Object.assign(cur, info, { count: cur.count, lastAt: now });
  all[k] = cur;
  setMistakes(all);
}

/** 标记已解决。 */
export function resolveMistake(mod: string, refId: string): void {
  const all = getMistakes();
  const k = mistakeKey(mod, refId);
  if (all[k]) {
    all[k].resolved = true;
    all[k].resolvedAt = new Date().toISOString();
    setMistakes(all);
  }
}

/** 未解决错题列表（重练用），可按模块过滤。 */
export function listOpenMistakes(mod?: string): MistakeEntry[] {
  return Object.values(getMistakes()).filter((m) => !m.resolved && (!mod || m.mod === mod));
}
