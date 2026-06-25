/**
 * legacyAdapter —— AppState 切片 ⇄ 现役 `kaoyan_v2` 单体 的双向映射。
 *
 * V7.1 统一数据源的关键：让 React 工程层与现役 index.html **共用同一份 `kaoyan_v2`**，
 * 不再各写各的键，从根本上消除「改了 React 页面、现役应用看不到」的分叉。
 *
 * - 读：`mapLegacyToAppState`（在 migrate.ts）把单体投影成 AppState。
 * - 写：`applySliceToLegacy` 把某个切片**就地写回**单体的对应位置；采用「读整个单体 →
 *   只改相关字段 → 整体存回」，因此现役独有字段（learn.log / weakness / writing / lastPack 等）
 *   原样保留，绝不丢失。
 */
import type { AppState } from './storageTypes';
import type { LegacyMonolith } from '@/lib/migration/legacyImport';
import { LATEST_LEGACY_NUMERIC_VERSION } from '@/lib/migration/versions';

/** 最小但合法的空单体（仅在本地从未有过 `kaoyan_v2` 时用作起点）。 */
export function defaultLegacyMonolith(): LegacyMonolith {
  return { version: LATEST_LEGACY_NUMERIC_VERSION, learn: {} };
}

/**
 * 把一个 AppState 切片写回单体的对应位置（就地修改并返回同一对象）。
 * 注意：仅触碰该切片相关字段，其余字段（含现役独有字段）保持不动。
 */
export function applySliceToLegacy<K extends keyof AppState>(
  legacy: LegacyMonolith,
  key: K,
  value: AppState[K],
): LegacyMonolith {
  const L = legacy as Record<string, any>;
  L.learn = L.learn || {};

  switch (key) {
    case 'checkin': {
      const c = value as AppState['checkin'];
      L.p = c.p;
      L.wk = c.wk;
      L.day = c.day;
      L.data = c.data;
      L.startDate = c.startDate;
      L.examDate = c.examDate;
      L.customTasks = c.customTasks;
      L.deletedDefaults = c.deletedDefaults;
      break;
    }
    case 'dashboard':
      L.notes = (value as AppState['dashboard']).notes;
      break;
    case 'vocab':
      L.learn.vocab = value;
      break;
    case 'math':
      L.learn.math = value;
      break;
    case 'reading':
      L.learn.reading = value;
      break;
    case 'syntax':
      L.learn.syntax = value;
      break;
    case 'mistakes':
      L.learn.mistakes = value;
      break;
    case 'ai':
      L.aiChats = (value as AppState['ai']).chats;
      break;
    case 'push': {
      const p = value as AppState['push'];
      L.notificationSettings = p.notificationSettings;
      L.reminderSettings = p.reminderSettings;
      L.reminderLog = p.reminderLog;
      break;
    }
    case 'resources': {
      const r = value as AppState['resources'];
      L.resources = r.resources;
      L.studySessions = r.studySessions;
      break;
    }
    // version / userId / updatedAt 不落到单体（由信封/同步层管理）。
  }
  return legacy;
}
