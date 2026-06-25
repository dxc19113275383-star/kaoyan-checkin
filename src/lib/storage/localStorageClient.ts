/**
 * localStorageClient —— 统一的 localStorage 读写封装。
 *
 * 为什么需要它（见 ARCHITECTURE.md「localStorage 策略」）：
 *  1. JSON parse/stringify 的 try/catch 只写一次，避免每个模块重复样板。
 *  2. 损坏数据 / 隐私模式 / 配额超限时优雅降级（返回默认值，不抛异常）。
 *  3. 统一默认值处理。
 *  4. 为 V7.1 云同步预留唯一入口：未来把这里换成「本地优先 + 远端同步」即可，
 *     模块层无需改动（前提是模块都走这个 client，不直接碰 localStorage）。
 */

export interface StorageClient {
  /** 读取并 JSON.parse；不存在或解析失败返回 fallback。 */
  get<T>(key: string, fallback: T): T;
  /** 读取原始字符串；不存在返回 null。 */
  getRaw(key: string): string | null;
  /** JSON.stringify 后写入；失败（如配额超限）返回 false，不抛异常。 */
  set<T>(key: string, value: T): boolean;
  /** 写入原始字符串。 */
  setRaw(key: string, value: string): boolean;
  /** 删除某键。 */
  remove(key: string): void;
  /** 键是否存在。 */
  has(key: string): boolean;
  /** 列出所有键（用于备份 / 导出 / 调试）。 */
  keys(): string[];
  /** 底层是否可用（隐私模式 / SSR 下可能为 false）。 */
  isAvailable(): boolean;
}

function getBackend(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // 触发一次访问以暴露隐私模式下的异常。
      const probe = '__ky_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return window.localStorage;
    }
  } catch {
    /* 隐私模式 / 被禁用 */
  }
  return null;
}

/**
 * 创建一个 StorageClient。默认绑定浏览器 localStorage；
 * 测试时可注入自定义后端（任何实现了 Storage 子集的对象）。
 */
export function createStorageClient(backend: Storage | null = getBackend()): StorageClient {
  const available = backend !== null;

  return {
    isAvailable: () => available,

    get<T>(key: string, fallback: T): T {
      if (!backend) return fallback;
      try {
        const raw = backend.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },

    getRaw(key: string): string | null {
      if (!backend) return null;
      try {
        return backend.getItem(key);
      } catch {
        return null;
      }
    },

    set<T>(key: string, value: T): boolean {
      if (!backend) return false;
      try {
        backend.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    setRaw(key: string, value: string): boolean {
      if (!backend) return false;
      try {
        backend.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },

    remove(key: string): void {
      if (!backend) return;
      try {
        backend.removeItem(key);
      } catch {
        /* noop */
      }
    },

    has(key: string): boolean {
      if (!backend) return false;
      try {
        return backend.getItem(key) !== null;
      } catch {
        return false;
      }
    },

    keys(): string[] {
      if (!backend) return [];
      try {
        const out: string[] = [];
        for (let i = 0; i < backend.length; i++) {
          const k = backend.key(i);
          if (k !== null) out.push(k);
        }
        return out;
      } catch {
        return [];
      }
    },
  };
}

/** 应用级单例：绝大多数模块直接 import 这个。 */
export const storage = createStorageClient();
