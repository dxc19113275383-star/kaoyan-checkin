import { useEffect, type ReactNode } from 'react';
import { runMigration } from '@/lib/migration/migrate';
import { registerServiceWorker } from '@/lib/pwa/registerServiceWorker';

/**
 * Providers —— 应用级副作用（V7.0 简化版）：
 *  - 启动时运行迁移，确保 AppState 信封就绪。
 *  - 注册 Service Worker（与现役 sw.js 同一份）。
 * 未来可在此挂主题 / 状态管理 Context。
 */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    runMigration();
    registerServiceWorker();
  }, []);
  return <>{children}</>;
}
