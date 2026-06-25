/**
 * date —— 日期工具，与现役 index.html 的 todayStr / vAddDays 行为一致（本地时区，YYYY-MM-DD）。
 */

/** 本地今天 YYYY-MM-DD。 */
export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

/** 在 YYYY-MM-DD 上加 days 天（可负），返回 YYYY-MM-DD。 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr || todayStr()}T00:00:00`);
  d.setDate(d.getDate() + days);
  return todayStr(d);
}

/** 两个 YYYY-MM-DD 之间相差天数（b - a）。 */
export function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`).getTime();
  const db = new Date(`${b}T00:00:00`).getTime();
  return Math.round((db - da) / 86400000);
}

/** 距离目标日期还有多少天（负数表示已过）。 */
export function daysUntil(dateStr: string): number {
  return daysBetween(todayStr(), dateStr);
}
