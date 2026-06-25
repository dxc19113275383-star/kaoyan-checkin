/**
 * syntaxStore —— 长难句进度切片读写。句库由 data/syntax 静态 JSON 提供。
 */
import { readSlice, writeSlice } from '@/lib/storage/appStateStore';
import type { SyntaxState } from './syntaxTypes';

export const getSyntax = (): SyntaxState => readSlice('syntax');
export const setSyntax = (next: SyntaxState): void => writeSlice('syntax', next);
export function updateSyntax(patch: Partial<SyntaxState>): SyntaxState {
  const next = { ...getSyntax(), ...patch };
  setSyntax(next);
  return next;
}
