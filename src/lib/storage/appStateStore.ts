/**
 * appStateStore —— 模块 store 的共同底座。
 *
 * V7.1 统一数据源（本次变更）：运行期读写**直接投影/落回现役主状态 `kaoyan_v2`**，
 * 而不再使用独立的 `ky_app_state_v7` 信封。这样 React 工程层与现役 index.html 共用同一份
 * 数据，编辑互相可见，彻底消除状态分叉。
 *
 * - `ky_app_state_v7` 信封 + 备份（由 migrate.ts / bootstrap 维护）退化为「一次性快照 / 安全备份 /
 *   V7.1 云上传的种子」，不再是运行期真相来源。
 * - 模块层不直接碰 localStorage，仍只调 readSlice/writeSlice —— 接入云同步时只改这里。
 */
import { storage } from './localStorageClient';
import { LEGACY_STATE_KEY } from './storageKeys';
import type { AppState } from './storageTypes';
import { mapLegacyToAppState, defaultAppState } from '@/lib/migration/migrate';
import { readLegacy } from '@/lib/migration/legacyImport';
import { defaultLegacyMonolith, applySliceToLegacy } from './legacyAdapter';

/** 读取完整 AppState —— 现役 `kaoyan_v2` 的实时投影。 */
export function getAppState(): AppState {
  const legacy = readLegacy(storage) ?? defaultLegacyMonolith();
  return mapLegacyToAppState(legacy);
}

/** 读取某个切片（投影自 `kaoyan_v2`）。 */
export function readSlice<K extends keyof AppState>(key: K): AppState[K] {
  return getAppState()[key];
}

/** 写入某个切片：读整个单体 → 只改相关字段 → 存回 `kaoyan_v2`（保留现役独有字段）。 */
export function writeSlice<K extends keyof AppState>(key: K, value: AppState[K]): void {
  const legacy = readLegacy(storage) ?? defaultLegacyMonolith();
  applySliceToLegacy(legacy, key, value);
  storage.set(LEGACY_STATE_KEY, legacy);
}

/** 写回完整 AppState（逐切片落回单体）。返回是否成功。 */
export function setAppState(next: AppState): boolean {
  const legacy = readLegacy(storage) ?? defaultLegacyMonolith();
  (Object.keys(next) as (keyof AppState)[]).forEach((k) => {
    if (k === 'version' || k === 'userId' || k === 'updatedAt') return;
    applySliceToLegacy(legacy, k, next[k]);
  });
  return storage.set(LEGACY_STATE_KEY, legacy);
}

export { defaultAppState };
