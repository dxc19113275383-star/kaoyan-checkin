/**
 * progress —— 进度 / 正确率计算工具（纯函数）。
 */

/** 完成率 0~1。total 为 0 时返回 0。 */
export function ratio(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, done / total));
}

/** 百分比整数 0~100。 */
export function percent(done: number, total: number): number {
  return Math.round(ratio(done, total) * 100);
}

/** 错误率 0~1（wrong / total）。 */
export function wrongRate(wrong: number, total: number): number {
  return ratio(wrong, total);
}

/** XP → 等级（简单平方根曲线，与训练舱「关卡」语义一致，可在 V7.3 调参）。 */
export function levelFromXp(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}
