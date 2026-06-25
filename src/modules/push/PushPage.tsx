import { useState } from 'react';
import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getPush, updatePush } from './pushSettings';
import { requestPermission, subscribe, sendTest } from './pushClient';
import { supportsWebPush, isIOS, isStandalonePWA } from '@/lib/pwa/pwaUtils';

export function PushPage() {
  const [, force] = useState(0);
  const refresh = () => force((x) => x + 1);
  const [msg, setMsg] = useState('');
  const p = getPush();

  const onEnable = async () => {
    const perm = await requestPermission();
    updatePush({ notificationSettings: { ...p.notificationSettings, permission: perm, enabled: perm === 'granted' } });
    setMsg(`通知权限：${perm}`);
    refresh();
  };

  const onSubscribe = async () => {
    setMsg('订阅中…');
    const sub = await subscribe();
    if (sub) {
      updatePush({ notificationSettings: { ...getPush().notificationSettings, subscriptionSaved: true } });
      setMsg('订阅成功，已上报后端。');
    } else {
      setMsg('订阅失败（需 HTTPS/已部署 + 浏览器支持；iOS 需先添加到主屏）。');
    }
    refresh();
  };

  const onTest = async () => {
    setMsg('发送测试推送…');
    const ok = await sendTest();
    setMsg(ok ? '已请求发送，注意通知栏。' : '测试发送失败（需后端可用 + 已订阅）。');
  };

  const onTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePush({ notificationSettings: { ...getPush().notificationSettings, reminderTime: e.target.value } });
    refresh();
  };

  return (
    <ModuleScaffold
      title="推送 / 提醒"
      legacyHash="#settings"
      responsibilities={[
        '通知授权 / Web Push 订阅 / 测试发送（调 Netlify push 函数）',
        '提醒设置持久化（统一走 kaoyan_v2）',
      ]}
    >
      <Card title="环境">
        <ul className="ky-list">
          <li>Web Push 支持：{supportsWebPush() ? '是' : '否'}</li>
          <li>独立 PWA：{isStandalonePWA() ? '是' : '否'}{isIOS() ? '（iOS 需 16.4+ 且添加到主屏才能推送）' : ''}</li>
          <li>当前权限：{p.notificationSettings.permission}</li>
          <li>已订阅：{p.notificationSettings.subscriptionSaved ? '是' : '否'}</li>
        </ul>
      </Card>

      <Card title="操作">
        <div className="ky-data-actions">
          <Button onClick={onEnable}>请求通知权限</Button>
          <Button variant="ghost" onClick={onSubscribe}>订阅 Web Push</Button>
          <Button variant="ghost" onClick={onTest}>发送测试推送</Button>
        </div>
        {msg && <p className="ky-data-msg">{msg}</p>}
      </Card>

      <Card title="提醒设置">
        <label className="ky-inline">
          每日提醒时间：
          <input type="time" defaultValue={p.notificationSettings.reminderTime} onChange={onTime} className="ky-date" />
        </label>
      </Card>
    </ModuleScaffold>
  );
}
