import { describe, it, expect, beforeEach } from 'vitest';
import { createStorageClient } from './localStorageClient';
import { LEGACY_STATE_KEY, vocabLibKey, BACKUP_KEY_PREFIX } from './storageKeys';
import { exportAll, parseImport, serializeExport, importAll, EXPORT_MAGIC } from './dataTransfer';

describe('dataTransfer', () => {
  let client = createStorageClient();
  beforeEach(() => {
    window.localStorage.clear();
    client = createStorageClient();
  });

  it('exports legacy + aux (user libs) and round-trips', () => {
    client.set(LEGACY_STATE_KEY, { version: 8, p: 1, learn: { mistakes: {} } });
    client.setRaw(vocabLibKey('mine'), JSON.stringify([{ w: 'hello' }]));

    const bundle = exportAll(client);
    expect(bundle.app).toBe(EXPORT_MAGIC);
    expect((bundle.legacy as any).p).toBe(1);
    expect(bundle.aux[vocabLibKey('mine')]).toContain('hello');

    const text = serializeExport(bundle);
    const parsed = parseImport(text);
    expect(parsed.app).toBe(EXPORT_MAGIC);
  });

  it('rejects non-app files', () => {
    expect(() => parseImport('{"foo":1}')).toThrow();
    expect(() => parseImport('not json')).toThrow();
  });

  it('imports into a clean store and backs up existing data', () => {
    // 现有数据
    client.set(LEGACY_STATE_KEY, { version: 8, p: 0 });
    const bundle = {
      app: EXPORT_MAGIC as typeof EXPORT_MAGIC,
      schema: '7.0.0',
      exportedAt: new Date().toISOString(),
      legacy: { version: 8, p: 1, wk: 7 },
      aux: { [vocabLibKey('x')]: JSON.stringify([{ w: 'a' }]) },
    };
    const r = importAll(bundle, client);
    expect(r.legacyWritten).toBe(true);
    expect(r.auxKeys).toBe(1);
    expect(client.get<any>(LEGACY_STATE_KEY, null).wk).toBe(7);
    expect(client.keys().some((k) => k.startsWith(BACKUP_KEY_PREFIX))).toBe(true);
  });

  it('skips aux keys that are not recognized prefixes', () => {
    const bundle = {
      app: EXPORT_MAGIC as typeof EXPORT_MAGIC,
      schema: '7.0.0',
      exportedAt: new Date().toISOString(),
      legacy: null,
      aux: { evil_key: 'x', [vocabLibKey('ok')]: '[]' },
    };
    const r = importAll(bundle, client, { backup: false });
    expect(r.auxKeys).toBe(1);
    expect(client.has('evil_key')).toBe(false);
  });
});
