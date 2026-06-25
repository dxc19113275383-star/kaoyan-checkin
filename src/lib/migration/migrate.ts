/**
 * migrate —— V7.0 迁移编排。
 *
 * 目标：在 *不破坏* 现役 `kaoyan_v2`（index.html 仍在用）的前提下，
 * 从旧数据派生出新版 AppState 信封（键 `ky_app_state_v7`），供未来 React 版 / 云同步消费。
 *
 * 安全约束（见任务书「六、localStorage 迁移要求」）：
 *  1. 首次启动检测数据版本。
 *  2. 旧版本数据执行迁移。
 *  3. 迁移前备份旧数据（原始字符串，字节级）。
 *  4. 迁移失败不删除原数据。
 *  5. 迁移成功写入新版本号。
 *  6. 新结构含 userId 字段，为 V7.1 云同步预留。
 *  7. 不直接散落操作 localStorage —— 一律走 storage client。
 */

import type { StorageClient } from '@/lib/storage/localStorageClient';
import { storage } from '@/lib/storage/localStorageClient';
import {
  APP_STATE_KEY,
  SCHEMA_VERSION_KEY,
  backupKey,
} from '@/lib/storage/storageKeys';
import type { AppState } from '@/lib/storage/storageTypes';
import { SCHEMA_VERSION } from '@/lib/storage/storageTypes';
import { CURRENT_SCHEMA_VERSION, isCurrentSchema } from './versions';
import { readLegacy, readLegacyRaw, type LegacyMonolith } from './legacyImport';

import { defaultCheckinState } from '@/modules/checkin/checkinTypes';
import { defaultDashboardState } from '@/modules/dashboard/dashboardTypes';
import { defaultVocabState } from '@/modules/learn/vocab/vocabTypes';
import { defaultMathState } from '@/modules/learn/math/mathTypes';
import { defaultReadingState } from '@/modules/learn/reading/readingTypes';
import { defaultSyntaxState } from '@/modules/learn/syntax/syntaxTypes';
import { defaultMistakesState, type MistakeEntry } from '@/modules/learn/mistakes/mistakesTypes';
import { defaultAiState } from '@/modules/ai/aiTypes';
import { defaultPushState } from '@/modules/push/pushTypes';
import { defaultResourcesState } from '@/modules/resources/resourceTypes';

export interface MigrationResult {
  state: AppState;
  /** 是否发生了从旧数据的迁移（false = 全新安装或已是最新）。 */
  migrated: boolean;
  /** 备份键（若有备份）。 */
  backupKey?: string;
  /** 迁移失败时的错误信息（state 会回退为安全值，旧数据保持不动）。 */
  error?: string;
}

/** 全新（空）AppState。 */
export function defaultAppState(): AppState {
  return {
    version: SCHEMA_VERSION,
    userId: undefined, // V7.1 云同步后写入
    checkin: defaultCheckinState(),
    dashboard: defaultDashboardState(),
    vocab: defaultVocabState(),
    math: defaultMathState(),
    reading: defaultReadingState(),
    syntax: defaultSyntaxState(),
    mistakes: defaultMistakesState(),
    ai: defaultAiState(),
    push: defaultPushState(),
    resources: defaultResourcesState(),
    updatedAt: new Date().toISOString(),
  };
}

/** 把现役 `kaoyan_v2` 单体派生为新版 AppState（逐字段兜底，缺失用默认值）。 */
export function mapLegacyToAppState(legacy: LegacyMonolith): AppState {
  const base = defaultAppState();
  const learn = (legacy.learn || {}) as Record<string, any>;

  // ---- checkin 切片 ----
  base.checkin = {
    p: (legacy.p as 0 | 1) ?? 0,
    wk: legacy.wk ?? 1,
    day: legacy.day ?? 0,
    data: legacy.data ?? {},
    startDate: legacy.startDate ?? null,
    examDate: legacy.examDate ?? base.checkin.examDate,
    customTasks: legacy.customTasks ?? {},
    deletedDefaults: legacy.deletedDefaults ?? {},
  };

  // ---- dashboard 切片（薄弱点笔记）----
  base.dashboard = {
    notes: Object.fromEntries(
      Object.entries(legacy.notes ?? {}).map(([k, v]) => [
        k,
        { weakSubject: v?.weakSubject ?? '', text: v?.text ?? '', ts: v?.ts },
      ]),
    ),
  };

  // ---- learn 子模块切片 ----
  if (learn.vocab) base.vocab = { ...base.vocab, ...learn.vocab };
  if (learn.math) base.math = { ...base.math, ...learn.math };
  if (learn.reading) base.reading = { ...base.reading, ...learn.reading };
  if (learn.syntax) base.syntax = { ...base.syntax, ...learn.syntax };
  if (learn.mistakes && typeof learn.mistakes === 'object') {
    base.mistakes = learn.mistakes as Record<string, MistakeEntry>;
  }

  // ---- ai 切片 ----
  base.ai = { chats: Array.isArray(legacy.aiChats) ? (legacy.aiChats as any[]) : [] };

  // ---- push 切片 ----
  base.push = {
    notificationSettings: {
      ...base.push.notificationSettings,
      ...(legacy.notificationSettings as object),
    },
    reminderSettings: {
      ...base.push.reminderSettings,
      ...(legacy.reminderSettings as object),
    },
    reminderLog: (legacy.reminderLog as Record<string, unknown>) ?? {},
  };

  // ---- resources 切片 ----
  base.resources = {
    resources: Array.isArray(legacy.resources) ? (legacy.resources as any[]) : [],
    studySessions: Array.isArray(legacy.studySessions) ? (legacy.studySessions as any[]) : [],
  };

  base.updatedAt = new Date().toISOString();
  return base;
}

/**
 * 运行迁移。幂等：已是最新 schema 时直接返回，不重复迁移、不重复备份。
 *
 * @param client 注入用，默认应用单例。测试可传入内存版 client。
 */
export function runMigration(client: StorageClient = storage): MigrationResult {
  // 0) 存储不可用（隐私模式 / SSR）：返回内存默认，不写盘。
  if (!client.isAvailable()) {
    return { state: defaultAppState(), migrated: false, error: 'storage-unavailable' };
  }

  // 1) 已存在且为最新 schema → 直接复用。
  const existing = client.get<AppState | null>(APP_STATE_KEY, null);
  if (existing && isCurrentSchema(existing.version)) {
    return { state: existing, migrated: false };
  }

  // 2) 读取 legacy。两者都没有 → 全新安装。
  const legacy = readLegacy(client);
  if (!legacy && !existing) {
    const fresh = defaultAppState();
    client.set(APP_STATE_KEY, fresh);
    client.setRaw(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
    return { state: fresh, migrated: false };
  }

  // 3) 迁移前备份原始数据（字节级；旧数据原封不动保留）。
  const ts = Date.now();
  const bKey = backupKey(ts);
  try {
    const legacyRaw = readLegacyRaw(client);
    const existingRaw = client.getRaw(APP_STATE_KEY);
    client.set(bKey, {
      ts,
      reason: 'pre-migration-v7.0.0',
      legacy: legacyRaw, // 原始字符串
      previousAppState: existingRaw,
    });
  } catch {
    /* 备份失败不应阻断；但也不继续删任何东西 */
  }

  // 4) 执行映射 + 写入。任何异常都不删旧数据。
  try {
    const next = legacy ? mapLegacyToAppState(legacy) : (existing as AppState);
    // 若旧信封存在但版本旧，保留其 userId（云同步标识不能丢）。
    if (existing?.userId && !next.userId) next.userId = existing.userId;

    const ok = client.set(APP_STATE_KEY, next);
    if (!ok) throw new Error('write-failed');
    client.setRaw(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
    return { state: next, migrated: true, backupKey: bKey };
  } catch (e) {
    // 5) 失败回滚：不删 legacy、不删旧信封；返回内存安全态。
    return {
      state: existing ?? defaultAppState(),
      migrated: false,
      backupKey: bKey,
      error: e instanceof Error ? e.message : 'migration-failed',
    };
  }
}
