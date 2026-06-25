import { describe, it, expect } from 'vitest';
import { defaultCheckinState, type CheckinState } from './checkinTypes';
import {
  keyFor,
  isTodayDone,
  todayKey,
  weekDoneDays,
  markTodayDone,
  computeTotalDays,
} from './checkinLogic';

describe('checkinLogic', () => {
  it('keyFor / todayKey format', () => {
    const s: CheckinState = { ...defaultCheckinState(), p: 1, wk: 3, day: 2 };
    expect(keyFor(1, 3, 2)).toBe('p1w3d2');
    expect(todayKey(s)).toBe('p1w3d2');
  });

  it('markTodayDone toggles today record without touching other days', () => {
    let s: CheckinState = { ...defaultCheckinState(), p: 0, wk: 2, day: 1, data: { p0w2d0: [0, 1] } };
    s = markTodayDone(s, true);
    expect(isTodayDone(s)).toBe(true);
    expect(s.data['p0w2d0']).toEqual([0, 1]); // 其它天不动
    expect(computeTotalDays(s)).toBe(2);

    s = markTodayDone(s, false);
    expect(isTodayDone(s)).toBe(false);
    expect(s.data['p0w2d1']).toBeUndefined();
    expect(computeTotalDays(s)).toBe(1);
  });

  it('markTodayDone(true) is idempotent (keeps existing items)', () => {
    let s: CheckinState = { ...defaultCheckinState(), p: 0, wk: 1, day: 0, data: { p0w1d0: [0, 2, 3] } };
    s = markTodayDone(s, true);
    expect(s.data['p0w1d0']).toEqual([0, 2, 3]);
  });

  it('weekDoneDays counts only current p+wk', () => {
    const s: CheckinState = {
      ...defaultCheckinState(),
      p: 0,
      wk: 2,
      day: 3,
      data: { p0w2d0: [0], p0w2d1: [0], p0w1d0: [0], p1w2d0: [0] },
    };
    expect(weekDoneDays(s)).toBe(2);
  });
});
