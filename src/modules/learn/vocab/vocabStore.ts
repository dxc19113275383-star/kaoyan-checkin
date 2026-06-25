/**
 * vocabStore —— 单词进度切片读写。内容库（词条）仍由 data/words 静态 JSON 提供。
 */
import { readSlice, writeSlice } from '@/lib/storage/appStateStore';
import type { VocabState } from './vocabTypes';

export const getVocab = (): VocabState => readSlice('vocab');
export const setVocab = (next: VocabState): void => writeSlice('vocab', next);
export function updateVocab(patch: Partial<VocabState>): VocabState {
  const next = { ...getVocab(), ...patch };
  setVocab(next);
  return next;
}
