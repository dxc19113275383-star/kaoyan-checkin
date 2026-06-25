/**
 * pwaUtils —— PWA 运行环境探测工具。
 * 对应现役 index.html 内的 isStandalonePWA / iOS 判定逻辑。
 */

/** 是否运行在「已添加到主屏」的独立 PWA 模式。 */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  // iOS Safari 用 navigator.standalone
  const iosStandalone = (window.navigator as any).standalone === true;
  return Boolean(mq || iosStandalone);
}

/** 是否 iOS 设备（iOS PWA 限制较多，见 README）。 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ 伪装成 Mac
    (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
}

/** 浏览器是否支持 Web Push（iOS 需 16.4+ 且已添加到主屏）。 */
export function supportsWebPush(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}
