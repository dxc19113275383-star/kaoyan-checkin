/**
 * registerServiceWorker —— Service Worker 注册封装。
 *
 * 现役 index.html 内联注册了 `/sw.js`（缓存 + Web Push）。本文件是 React 工程外壳
 * （preview.html / 未来 React 版）使用的等价注册器，指向同一个 `sw.js`（构建后位于站点根）。
 *
 * 注意：sw.js 由 `public/sw.js` 提供，构建后落在 dist 根，作用域为站点根 `/`。
 */

export interface SwRegisterOptions {
  /** sw 脚本路径，默认站点根 `/sw.js`。 */
  url?: string;
  /** 注册成功回调。 */
  onReady?: (reg: ServiceWorkerRegistration) => void;
  /** 注册失败回调。 */
  onError?: (err: unknown) => void;
}

export function registerServiceWorker(opts: SwRegisterOptions = {}): void {
  const { url = '/sw.js', onReady, onError } = opts;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(url)
      .then((reg) => onReady?.(reg))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('[sw] register failed', err);
        onError?.(err);
      });
  });
}

/** 主动解除注册（调试 / 重置缓存用）。 */
export async function unregisterServiceWorkers(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));
}
