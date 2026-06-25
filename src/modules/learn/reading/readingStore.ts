/**
 * readingStore —— 阅读进度切片读写。文章由 data/reading 静态 JSON 提供。
 */
import { readSlice, writeSlice } from '@/lib/storage/appStateStore';
import type { ReadingState } from './readingTypes';

export const getReading = (): ReadingState => readSlice('reading');
export const setReading = (next: ReadingState): void => writeSlice('reading', next);
export function updateReading(patch: Partial<ReadingState>): ReadingState {
  const next = { ...getReading(), ...patch };
  setReading(next);
  return next;
}
