import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { getPush } from './pushSettings';
import { supportsWebPush, isIOS } from '@/lib/pwa/pwaUtils';

export function PushPage() {
  const p = getPush();
  return (
    <ModuleScaffold
      title="推送 / 提醒"
      legacyHash="#settings"
      responsibilities={[
        '浏览器通知授权 / Web Push 订阅',
        '调用 Netlify push 函数（public-key / subscribe / send-test / scheduled）',
        '应用内提醒设置 / iOS PWA 兼容',
      ]}
    >
      <Card title="当前设置">
        <ul className="ky-list">
          <li>Web Push 支持：{supportsWebPush() ? '是' : '否'}{isIOS() ? '（iOS 需 16.4+ 且已添加到主屏）' : ''}</li>
          <li>推送开关：{p.notificationSettings.enabled ? '已开' : '关闭'}</li>
          <li>提醒时间：{p.notificationSettings.reminderTime}</li>
          <li>应用内提醒：{p.reminderSettings.enabled ? '已开' : '关闭'}</li>
        </ul>
      </Card>
    </ModuleScaffold>
  );
}
