import { describe, it, expect } from 'vitest';
import { defaultCheckinState, type CheckinState } from '@/modules/checkin/checkinTypes';
import type { MistakesState } from '@/modules/learn/mistakes/mistakesTypes';
import { buildHeatmap, weaknessByMod, topWeakTags } from './dashboardLogic';

describe('dashboardLogic', () => {
  it('buildHeatmap returns weeksBack rows ending at current week', () => {
    const c: CheckinState = { ...defaultCheckinState(), p: 0, wk: 5, day: 0, data: { p0w5d0: [0], p0w5d3: [0] } };
    const rows = buildHeatmap(c, 3);
    expect(rows.map((r) => r.wk)).toEqual([3, 4, 5]);
    const w5 = rows.find((r) => r.wk === 5)!;
    expect(w5.days[0]).toBe(true);
    expect(w5.days[1]).toBe(false);
    expect(w5.days[3]).toBe(true);
  });

  it('buildHeatmap clamps start week to 1', () => {
    const c: CheckinState = { ...defaultCheckinState(), p: 0, wk: 2 };
    expect(buildHeatmap(c, 8).map((r) => r.wk)).toEqual([1, 2]);
  });

  const mistakes: MistakesState = {
    'math:q1': { mod: 'math', refId: 'q1', title: '', tag: '极限', count: 1, firstAt: '', lastAt: '', resolved: false },
    'math:q2': { mod: 'math', refId: 'q2', title: '', tag: '极限', count: 1, firstAt: '', lastAt: '', resolved: true },
    'vocab:w1': { mod: 'vocab', refId: 'w1', title: '', tag: '词汇', count: 1, firstAt: '', lastAt: '', resolved: false },
  };

  it('weaknessByMod aggregates open/total sorted by open', () => {
    const r = weaknessByMod(mistakes);
    expect(r[0].mod).toBe('math');
    expect(r.find((x) => x.mod === 'math')).toMatchObject({ open: 1, total: 2 });
    expect(r.find((x) => x.mod === 'vocab')).toMatchObject({ open: 1, total: 1 });
  });

  it('topWeakTags counts only unresolved tags', () => {
    const tags = topWeakTags(mistakes);
    expect(tags).toEqual([
      { tag: '极限', open: 1 },
      { tag: '词汇', open: 1 },
    ]);
  });
});
