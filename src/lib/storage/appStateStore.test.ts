import { describe, it, expect, beforeEach } from 'vitest';
import { LEGACY_STATE_KEY } from './storageKeys';
import { getAppState, readSlice, writeSlice } from './appStateStore';

/** 直接读 kaoyan_v2 原始单体，验证写入落点。 */
function rawLegacy(): any {
  return JSON.parse(window.localStorage.getItem(LEGACY_STATE_KEY) || '{}');
}

describe('appStateStore（统一数据源：投影/落回 kaoyan_v2）', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // 预置一个含「现役独有字段」的单体（learn.log / learn.weakness 等）。
    window.localStorage.setItem(
      LEGACY_STATE_KEY,
      JSON.stringify({
        version: 8,
        p: 1,
        wk: 5,
        day: 3,
        data: { p1w5d3: [0] },
        examDate: '2027-12-25',
        learn: {
          mistakes: { 'math:q1': { mod: 'math', refId: 'q1', count: 1, resolved: false, title: '', tag: '', firstAt: '', lastAt: '' } },
          log: [{ id: 'ev_1', mod: 'vocab', action: 'answer' }],
          weakness: { byMod: { math: { total: 3, wrong: 2 } }, byTag: {}, byCat: {}, updatedAt: '', window: 14 },
        },
      }),
    );
  });

  it('reads slices as a projection of kaoyan_v2', () => {
    const s = getAppState();
    expect(s.checkin.p).toBe(1);
    expect(s.checkin.wk).toBe(5);
    expect(readSlice('mistakes')['math:q1'].count).toBe(1);
  });

  it('writeSlice(mistakes) writes back into learn.mistakes and preserves learn.log/weakness', () => {
    const m = readSlice('mistakes');
    m['vocab:w1'] = { mod: 'vocab', refId: 'w1', count: 2, resolved: false, title: 'hello', tag: '', firstAt: '', lastAt: '' };
    writeSlice('mistakes', m);

    const L = rawLegacy();
    expect(Object.keys(L.learn.mistakes)).toContain('vocab:w1');
    // 现役独有字段必须原样保留
    expect(L.learn.log).toEqual([{ id: 'ev_1', mod: 'vocab', action: 'answer' }]);
    expect(L.learn.weakness.byMod.math.wrong).toBe(2);
    // 顶层打卡字段不受影响
    expect(L.p).toBe(1);
  });

  it('writeSlice(checkin) writes top-level fields, learn untouched', () => {
    const c = readSlice('checkin');
    writeSlice('checkin', { ...c, p: 0, day: 4 });

    const L = rawLegacy();
    expect(L.p).toBe(0);
    expect(L.day).toBe(4);
    expect(L.learn.log).toHaveLength(1); // learn 仍在
  });

  it('writes are visible to a subsequent projection read (no fork)', () => {
    const c = readSlice('checkin');
    writeSlice('checkin', { ...c, wk: 9 });
    expect(getAppState().checkin.wk).toBe(9);
  });
});
