import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { getCheckin } from './checkinStore';
import { computeTotalDays } from './checkinLogic';

export function CheckinPage() {
  const c = getCheckin();
  return (
    <ModuleScaffold
      title="打卡"
      legacyHash="#checkin"
      responsibilities={[
        '每日打卡 / 在职·全职阶段切换 / 学习状态',
        '打卡记录的本地读写与迁移',
        '不负责：AI 聊天 / 词库 / 数学题库 / 推送发送',
      ]}
    >
      <Card title="当前状态（来自 AppState 信封）">
        <ul className="ky-list">
          <li>阶段：{c.p === 1 ? '全职' : '在职'}</li>
          <li>进度：第 {c.wk} 周 第 {c.day + 1} 天</li>
          <li>累计打卡天数：{computeTotalDays(c)}</li>
          <li>考试日期：{c.examDate}</li>
        </ul>
      </Card>
    </ModuleScaffold>
  );
}
