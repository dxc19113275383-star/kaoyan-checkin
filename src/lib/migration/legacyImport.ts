/**
 * legacyImport —— 读取并归一化现役 `kaoyan_v2` 单体状态。
 *
 * 只负责「读 + 形状描述」，不负责写。读取出错（损坏 / 缺失）返回 null，
 * 由 migrate 层决定回退策略，从而保证迁移失败不会丢用户数据。
 */

import type { StorageClient } from '@/lib/storage/localStorageClient';
import { LEGACY_STATE_KEY } from '@/lib/storage/storageKeys';

/**
 * 现役主状态的形状（宽松版，字段都可能缺失，迁移时逐个兜底）。
 * 与 index.html 默认 state 一一对应。
 */
export interface LegacyMonolith {
  version?: number;
  p?: number;
  wk?: number;
  day?: number;
  data?: Record<string, number[]>;
  startDate?: string | null;
  examDate?: string;
  customTasks?: Record<string, string[]>;
  deletedDefaults?: Record<string, number[]>;
  notes?: Record<string, { weakSubject?: string; text?: string; ts?: string }>;
  resources?: unknown[];
  studySessions?: unknown[];
  aiChats?: unknown[];
  reminderSettings?: Record<string, unknown>;
  reminderLog?: Record<string, unknown>;
  notificationSettings?: Record<string, unknown>;
  learn?: Record<string, unknown>;
  [k: string]: unknown;
}

/** 读取原始 legacy 字符串（备份用，保持字节级一致）。 */
export function readLegacyRaw(client: StorageClient): string | null {
  return client.getRaw(LEGACY_STATE_KEY);
}

/** 读取并解析 legacy 状态；不存在或损坏返回 null。 */
export function readLegacy(client: StorageClient): LegacyMonolith | null {
  const raw = client.getRaw(LEGACY_STATE_KEY);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as LegacyMonolith;
    return null;
  } catch {
    return null;
  }
}

/** legacy 数据是否存在（用于判定首次启动 vs 老用户）。 */
export function hasLegacy(client: StorageClient): boolean {
  return client.has(LEGACY_STATE_KEY);
}
