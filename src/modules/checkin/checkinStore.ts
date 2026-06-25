/**
 * checkinStore —— 打卡切片的读写（统一走 appStateStore，不直接碰 localStorage）。
 */
import { readSlice, writeSlice } from '@/lib/storage/appStateStore';
import type { CheckinState } from './checkinTypes';

export function getCheckin(): CheckinState {
  return readSlice('checkin');
}

export function setCheckin(next: CheckinState): void {
  writeSlice('checkin', next);
}

export function updateCheckin(patch: Partial<CheckinState>): CheckinState {
  const next = { ...getCheckin(), ...patch };
  setCheckin(next);
  return next;
}
