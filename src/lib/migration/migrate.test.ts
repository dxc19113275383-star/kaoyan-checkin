import { describe, it, expect, beforeEach } from 'vitest';
import { createStorageClient } from '@/lib/storage/localStorageClient';
import {
  APP_STATE_KEY,
  SCHEMA_VERSION_KEY,
  LEGACY_STATE_KEY,
  BACKUP_KEY_PREFIX,
} from '@/lib/storage/storageKeys';
import { runMigration, mapLegacyToAppState, defaultAppState } from './migrate';
import { CURRENT_SCHEMA_VERSION } from './versions';

const legacySample = {
  version: 8,
  p: 1,
  wk: 3,
  day: 2,
  data: { p1w3d2: [0, 1] },
  startDate: '2026-01-01',
  examDate: '2027-12-25',
  customTasks: { p1w3d2: ['复习单词'] },
  deletedDefaults: {},
  notes: { '2026-06-01': { weakSubject: '数学', text: '导数不熟' } },
  resources: [{ id: 'r1', title: '网课' }],
  studySessions: [{ id: 's1', date: '2026-06-01' }],
  aiChats: [{ id: 'c1', mode: 'qa', messages: [], createdAt: '' }],
  notificationSettings: { enabled: true, permission: 'granted', subscriptionSaved: true, reminderTime: '21:00', tone: 'strict' },
  reminderSettings: { enabled: true, tone: 'normal', quietHours: { start: '23:30', end: '08:00' }, systemNotificationEnabled: false },
  reminderLog: {},
  learn: {
    vocab: { active: 'kaoyan', settings: { dailyNew: 30 }, progress: { hello: { known: true } }, wrongBook: [], daily: { date: '', newDone: 0, reviewDone: 0 }, userLibs: [] },
    math: { wrongBook: ['math:q1'], progress: {} },
    reading: { progress: {} },
    syntax: { active: 'kaoyan-eng2-core', progress: {} },
    mistakes: { 'math:q1': { mod: 'math', refId: 'q1', title: '极限', tag: '高数', count: 2, firstAt: '', lastAt: '', resolved: false } },
  },
};

describe('mapLegacyToAppState', () => {
  it('maps each module slice faithfully', () => {
    const s = mapLegacyToAppState(legacySample as any);
    expect(s.version).toBe(CURRENT_SCHEMA_VERSION);
    expect(s.checkin.p).toBe(1);
    expect(s.checkin.data).toEqual({ p1w3d2: [0, 1] });
    expect(s.dashboard.notes['2026-06-01'].weakSubject).toBe('数学');
    expect(s.vocab.settings.dailyNew).toBe(30);
    expect(s.math.wrongBook).toEqual(['math:q1']);
    expect(s.mistakes['math:q1'].count).toBe(2);
    expect(s.push.notificationSettings.tone).toBe('strict');
    expect(s.ai.chats.length).toBe(1);
    expect(s.resources.resources.length).toBe(1);
  });

  it('fills defaults when legacy fields missing', () => {
    const s = mapLegacyToAppState({} as any);
    expect(s.checkin.examDate).toBe('2027-12-25');
    expect(s.vocab.active).toBe('kaoyan');
  });
});

describe('runMigration', () => {
  let client = createStorageClient();
  beforeEach(() => {
    window.localStorage.clear();
    client = createStorageClient();
  });

  it('fresh install writes default AppState, not migrated', () => {
    const r = runMigration(client);
    expect(r.migrated).toBe(false);
    expect(client.get(APP_STATE_KEY, null)).not.toBeNull();
    expect(client.getRaw(SCHEMA_VERSION_KEY)).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('migrates legacy data, backs up, keeps legacy intact', () => {
    const rawLegacy = JSON.stringify(legacySample);
    window.localStorage.setItem(LEGACY_STATE_KEY, rawLegacy);

    const r = runMigration(client);
    expect(r.migrated).toBe(true);
    expect(r.state.checkin.wk).toBe(3);
    // 旧数据原封不动
    expect(window.localStorage.getItem(LEGACY_STATE_KEY)).toBe(rawLegacy);
    // 有备份
    expect(r.backupKey).toBeDefined();
    const backupExists = client.keys().some((k) => k.startsWith(BACKUP_KEY_PREFIX));
    expect(backupExists).toBe(true);
  });

  it('is idempotent: second run does not re-migrate', () => {
    window.localStorage.setItem(LEGACY_STATE_KEY, JSON.stringify(legacySample));
    const first = runMigration(client);
    expect(first.migrated).toBe(true);
    const second = runMigration(client);
    expect(second.migrated).toBe(false);
  });

  it('preserves userId across re-migration', () => {
    const env = defaultAppState();
    env.userId = 'user-123';
    env.version = '6.0.0'; // 旧 schema，迫使再次迁移
    client.set(APP_STATE_KEY, env);
    window.localStorage.setItem(LEGACY_STATE_KEY, JSON.stringify(legacySample));
    const r = runMigration(client);
    expect(r.state.userId).toBe('user-123');
  });
});
