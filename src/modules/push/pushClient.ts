/**
 * pushClient —— Web Push 授权 / 订阅 / 测试发送。
 *
 * 对应现役 index.html 的订阅逻辑。端点为现役生产函数（名称沿用，不改）：
 *  - 取公钥：/.netlify/functions/push-public-key
 *  - 订阅：  /.netlify/functions/push-subscribe
 *  - 测试发：/.netlify/functions/push-send-test
 *  - 定时发：/.netlify/functions/push-scheduled（由 Netlify Scheduled Functions 触发）
 *
 * VAPID 公钥由后端下发；私钥只在服务端环境变量，前端绝不接触。
 */
import { supportsWebPush } from '@/lib/pwa/pwaUtils';

export interface PushEndpoints {
  publicKey: string;
  subscribe: string;
  sendTest: string;
}

/** 默认指向同源 Netlify Functions（生产/预览均可）。 */
export const DEFAULT_PUSH_ENDPOINTS: PushEndpoints = {
  publicKey: '/.netlify/functions/push-public-key',
  subscribe: '/.netlify/functions/push-subscribe',
  sendTest: '/.netlify/functions/push-send-test',
};

/** base64url VAPID 公钥 → Uint8Array。 */
export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** 请求通知权限。 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  return Notification.requestPermission();
}

/** 取 VAPID 公钥。 */
export async function fetchPublicKey(endpoints: PushEndpoints = DEFAULT_PUSH_ENDPOINTS): Promise<string> {
  const resp = await fetch(endpoints.publicKey);
  const data = await resp.json();
  return data.publicKey as string;
}

/** 订阅并把订阅信息上报后端。返回订阅对象或 null。 */
export async function subscribe(endpoints: PushEndpoints = DEFAULT_PUSH_ENDPOINTS): Promise<PushSubscription | null> {
  if (!supportsWebPush()) return null;
  const reg = await navigator.serviceWorker.ready;
  const publicKey = await fetchPublicKey(endpoints);
  if (!publicKey) return null;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
  });
  await fetch(endpoints.subscribe, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub),
  });
  return sub;
}

/** 触发一条测试推送。 */
export async function sendTest(endpoints: PushEndpoints = DEFAULT_PUSH_ENDPOINTS): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    const resp = await fetch(endpoints.sendTest, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}
