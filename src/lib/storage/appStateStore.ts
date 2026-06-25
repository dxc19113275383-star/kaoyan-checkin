/**
 * appStateStore —— 新版 AppState 信封的读写入口（模块 store 的共同底座）。
 *
 * 所有模块 store 通过 readSlice/writeSlice 操作各自切片，绝不直接碰 localStorage。
 * 这样 V7.1 把底层换成「本地优先 + 云同步」时，只需改这里，模块层零改动。
 */
import { storage } from './localStorageClient';
import { APP_STATE_KEY } from './storageKeys';
import type { AppState } from './storageTypes';
import { runMigration, defaultAppState } from '@/lib/migration/migrate';

/** 读取完整 AppState；不存在则触发一次迁移/初始化。 */
export function getAppState(): AppState {
  const existing = storage.get<AppState | null>(APP_STATE_KEY, null);
  if (existing) return existing;
  return runMigration(storage).state;
}

/** 写回完整 AppState，并刷新 updatedAt。返回是否写入成功。 */
export function setAppState(next: AppState): boolean {
  next.updatedAt = new Date().toISOString();
  return storage.set(APP_STATE_KEY, next);
}

/** 读取某个切片。 */
export function readSlice<K extends keyof AppState>(key: K): AppState[K] {
  return getAppState()[key];
}

/** 写入某个切片（不可变更新 + 落盘）。 */
export function writeSlice<K extends keyof AppState>(key: K, value: AppState[K]): void {
  const state = getAppState();
  state[key] = value;
  setAppState(state);
}

export { defaultAppState };
