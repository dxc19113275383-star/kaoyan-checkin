/**
 * mathStore —— 数学进度/错题切片读写。题库由 data/math 静态 JSON 提供。
 */
import { readSlice, writeSlice } from '@/lib/storage/appStateStore';
import type { MathState } from './mathTypes';

export const getMath = (): MathState => readSlice('math');
export const setMath = (next: MathState): void => writeSlice('math', next);
export function updateMath(patch: Partial<MathState>): MathState {
  const next = { ...getMath(), ...patch };
  setMath(next);
  return next;
}
