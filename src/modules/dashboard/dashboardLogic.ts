/**
 * dashboardLogic —— 仪表盘派生计算（纯函数，便于单测）。
 * 仪表盘是「派生视图」：数据来自 checkin（打卡）与 mistakes（错题），不自存业务数据。
 */
import type { CheckinState } from '@/modules/checkin/checkinTypes';
import { isDayDone } from '@/modules/checkin/checkinLogic';
import type { MistakesState } from '@/modules/learn/mistakes/mistakesTypes';

export interface HeatRow {
  wk: number;
  days: boolean[]; // 长度 7，true=当天有打卡
}

/** 生成最近 weeksBack 周（当前阶段 p）的热力图行。 */
export function buildHeatmap(c: CheckinState, weeksBack = 8): HeatRow[] {
  const rows: HeatRow[] = [];
  const startWk = Math.max(1, c.wk - weeksBack + 1);
  for (let wk = startWk; wk <= c.wk; wk++) {
    const days: boolean[] = [];
    for (let d = 0; d < 7; d++) days.push(isDayDone(c, c.p, wk, d));
    rows.push({ wk, days });
  }
  return rows;
}

export interface ModWeak {
  mod: string;
  open: number;
  total: number;
}

/** 按模块聚合错题（open=未解决，total=总数）。 */
export function weaknessByMod(m: MistakesState): ModWeak[] {
  const map: Record<string, ModWeak> = {};
  for (const e of Object.values(m)) {
    const x = (map[e.mod] = map[e.mod] || { mod: e.mod, open: 0, total: 0 });
    x.total++;
    if (!e.resolved) x.open++;
  }
  return Object.values(map).sort((a, b) => b.open - a.open);
}

export interface TagWeak {
  tag: string;
  open: number;
}

/** 未解决错题按 tag(考点) 排序，取前 n。 */
export function topWeakTags(m: MistakesState, n = 5): TagWeak[] {
  const map: Record<string, number> = {};
  for (const e of Object.values(m)) {
    if (!e.resolved && e.tag) map[e.tag] = (map[e.tag] || 0) + 1;
  }
  return Object.entries(map)
    .map(([tag, open]) => ({ tag, open }))
    .sort((a, b) => b.open - a.open)
    .slice(0, n);
}
