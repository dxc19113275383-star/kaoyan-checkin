/**
 * pushSettings —— 推送/提醒设置切片读写。对应现役 notificationSettings + reminderSettings。
 */
import { readSlice, writeSlice } from '@/lib/storage/appStateStore';
import type { PushState } from './pushTypes';

export const getPush = (): PushState => readSlice('push');
export const setPush = (next: PushState): void => writeSlice('push', next);
export function updatePush(patch: Partial<PushState>): PushState {
  const next = { ...getPush(), ...patch };
  setPush(next);
  return next;
}
