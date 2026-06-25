/**
 * bootstrap —— 现役单文件应用（index.html）的渐进增强入口。
 *
 * 设计要点（务必保持）：
 *  - 只读不写 `kaoyan_v2`：迁移产物写入新键 `ky_app_state_v7` + 备份键，绝不触碰旧主状态，
 *    因此与 index.html 自身的 load()/save() 完全无冲突。
 *  - 全程 try/catch：任何异常都不得冒泡，绝不能影响现役应用运行（验收：不破坏 PWA）。
 *  - 不引入 React / 重依赖：只用 storage + migration 这两层轻量模块。
 *
 * 作用：
 *  1. 启动时运行 V7.0 迁移，建立新版 AppState 信封 + 旧数据备份（为 V7.1 云同步铺路）。
 *  2. 暴露 window.KY 桥，供后续从 index.html 内逐步改为「走 storage client」而非散落 localStorage。
 */
import { storage } from '@/lib/storage/localStorageClient';
import { runMigration } from '@/lib/migration/migrate';
import { getAppState } from '@/lib/storage/appStateStore';
import type { AppState } from '@/lib/storage/storageTypes';

declare global {
  interface Window {
    KY?: {
      version: string;
      storage: typeof storage;
      getAppState: () => AppState;
      runMigration: typeof runMigration;
    };
  }
}

function boot(): void {
  try {
    const result = runMigration(storage);
    window.KY = {
      version: '7.0.0',
      storage,
      // 统一数据源：返回现役 kaoyan_v2 的实时投影（与 React 工程层一致）。
      getAppState,
      runMigration,
    };
    if (result.error) {
      // eslint-disable-next-line no-console
      console.warn('[KY bootstrap] migration soft-failed (legacy data preserved):', result.error);
    } else if (result.migrated) {
      // eslint-disable-next-line no-console
      console.info('[KY bootstrap] migrated legacy data → AppState v7, backup:', result.backupKey);
    }
  } catch (e) {
    // 绝不让增强层影响现役应用。
    // eslint-disable-next-line no-console
    console.warn('[KY bootstrap] skipped:', e);
  }
}

boot();
