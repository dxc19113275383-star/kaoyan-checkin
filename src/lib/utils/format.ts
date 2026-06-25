/**
 * format —— 展示层格式化工具（纯函数）。
 */

/** 数字千分位。 */
export function thousands(n: number): string {
  return n.toLocaleString('en-US');
}

/** 毫秒 → 「Xm Ys」/「Ys」。 */
export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return rs ? `${m}m ${rs}s` : `${m}m`;
}

/** 截断长文本，超出加省略号。 */
export function truncate(text: string, max = 40): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

/** 安全百分号文本。 */
export function pct(value0to1: number): string {
  return `${Math.round(value0to1 * 100)}%`;
}
