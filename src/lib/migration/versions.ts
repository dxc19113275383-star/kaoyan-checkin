/**
 * versions —— 版本号常量与版本判定。
 *
 * 两套版本号并存：
 *  - 现役单文件应用的「数值」版本链：1 → 4 → 5 → 6 → 7 → 8（由 index.html 内 migrate 维护）。
 *  - V7.0 新版「语义化」schema 版本：'7.0.0'（AppState 信封）。
 *
 * migration 层负责把任意旧数值版本的 `kaoyan_v2` 派生为最新语义化 AppState。
 */

import { SCHEMA_VERSION } from '@/lib/storage/storageTypes';

/** 当前目标语义化 schema 版本。 */
export const CURRENT_SCHEMA_VERSION = SCHEMA_VERSION; // '7.0.0'

/** 现役单文件应用最新数值版本（index.html defaultState.version）。 */
export const LATEST_LEGACY_NUMERIC_VERSION = 8;

/** 语义化版本比较：a < b 返回负、相等 0、a > b 正。仅比较 major.minor.patch。 */
export function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

/** 判断一个 AppState 信封是否已是当前 schema 版本。 */
export function isCurrentSchema(version: string | undefined): boolean {
  return typeof version === 'string' && compareSemver(version, CURRENT_SCHEMA_VERSION) === 0;
}
