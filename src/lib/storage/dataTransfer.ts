/**
 * dataTransfer —— 全量数据导出 / 导入（V7.1 云同步前的本地安全网，无需后端）。
 *
 * 覆盖范围：现役主状态 `kaoyan_v2` + 一次性标记 + 所有用户自建内容
 * （`vocab_lib_*` / `reading_*` / `math_set_*`）。导入前自动备份，校验失败不写入。
 *
 * 设计：纯逻辑（收/发 bundle 对象）与浏览器 IO（下载/读文件）分离，前者可单测。
 */
import type { StorageClient } from './localStorageClient';
import { storage } from './localStorageClient';
import {
  LEGACY_STATE_KEY,
  LEGACY_NOTIFY_HINT_KEY,
  VOCAB_LIB_PREFIX,
  READING_PREFIX,
  MATH_SET_PREFIX,
  backupKey,
} from './storageKeys';
import { SCHEMA_VERSION } from './storageTypes';

export const EXPORT_MAGIC = 'kaoyan-checkin';

export interface ExportBundle {
  app: typeof EXPORT_MAGIC;
  schema: string;
  exportedAt: string;
  /** 主状态 kaoyan_v2 的解析对象（null 表示导出时本地无数据）。 */
  legacy: unknown;
  /** 其余键的原始字符串映射（用户库 + 一次性标记等）。 */
  aux: Record<string, string>;
}

const AUX_PREFIXES = [VOCAB_LIB_PREFIX, READING_PREFIX, MATH_SET_PREFIX];

function isAuxKey(key: string): boolean {
  if (key === LEGACY_NOTIFY_HINT_KEY) return true;
  return AUX_PREFIXES.some((p) => key.startsWith(p));
}

/** 收集当前全部数据为一个可序列化 bundle。 */
export function exportAll(client: StorageClient = storage): ExportBundle {
  const legacyRaw = client.getRaw(LEGACY_STATE_KEY);
  const aux: Record<string, string> = {};
  for (const key of client.keys()) {
    if (isAuxKey(key)) {
      const v = client.getRaw(key);
      if (v !== null) aux[key] = v;
    }
  }
  return {
    app: EXPORT_MAGIC,
    schema: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    legacy: legacyRaw !== null ? safeParse(legacyRaw) : null,
    aux,
  };
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** 序列化为 JSON 文本。 */
export function serializeExport(bundle: ExportBundle): string {
  return JSON.stringify(bundle, null, 2);
}

/** 解析并校验导入文本，非法则抛错。 */
export function parseImport(text: string): ExportBundle {
  let obj: any;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error('文件不是合法 JSON');
  }
  if (!obj || obj.app !== EXPORT_MAGIC) {
    throw new Error('不是「考研打卡助手」的导出文件');
  }
  if (typeof obj.aux !== 'object' || obj.aux === null) obj.aux = {};
  return obj as ExportBundle;
}

export interface ImportResult {
  legacyWritten: boolean;
  auxKeys: number;
  backupKey: string;
}

/**
 * 导入 bundle。默认导入前对现有数据做一次备份。
 * 失败（写入异常）会抛出，但已备份的数据可据 backupKey 找回。
 */
export function importAll(
  bundle: ExportBundle,
  client: StorageClient = storage,
  opts: { backup?: boolean } = {},
): ImportResult {
  const { backup = true } = opts;
  const ts = Date.now();
  const bKey = backupKey(ts);

  if (backup) {
    const current = exportAll(client);
    client.set(bKey, { ts, reason: 'pre-import', snapshot: current });
  }

  let legacyWritten = false;
  if (bundle.legacy != null) {
    legacyWritten = client.set(LEGACY_STATE_KEY, bundle.legacy);
  }

  let auxKeys = 0;
  for (const [key, value] of Object.entries(bundle.aux || {})) {
    if (isAuxKey(key) && client.setRaw(key, value)) auxKeys++;
  }

  return { legacyWritten, auxKeys, backupKey: bKey };
}

// ===== 浏览器 IO（仅在 DOM 环境调用）=====

/** 触发浏览器下载导出文件。 */
export function downloadExport(bundle: ExportBundle = exportAll(), filename?: string): void {
  const name = filename ?? `kaoyan-backup-${bundle.exportedAt.slice(0, 10)}.json`;
  const blob = new Blob([serializeExport(bundle)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/** 从 File 读取并导入。 */
export async function importFromFile(file: File, client: StorageClient = storage): Promise<ImportResult> {
  const text = await file.text();
  const bundle = parseImport(text);
  return importAll(bundle, client);
}
