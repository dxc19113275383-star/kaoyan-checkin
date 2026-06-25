import { Card } from '@/components/ui/Card';
import { getCheckin } from '@/modules/checkin/checkinStore';
import { isTodayDone, weekDoneDays } from '@/modules/checkin/checkinLogic';
import { daysUntil } from '@/lib/utils/date';
import { Progress } from '@/components/ui/Progress';

/** 今日任务概览（派生自 checkin）。完整任务清单仍在现役训练舱。 */
export function TodayTasks() {
  const c = getCheckin();
  const done = isTodayDone(c);
  const left = daysUntil(c.examDate);
  return (
    <Card title="今日 · 倒计时">
      <p className="ky-today__line">
        {done ? '✅ 今天已打卡' : '⬜ 今天还没打卡'} · 第 {c.wk} 周第 {c.day + 1} 天
        {left >= 0 ? ` · 距考试 ${left} 天` : ` · 已过考试 ${-left} 天`}
      </p>
      <Progress done={weekDoneDays(c)} total={7} label="本周打卡" />
    </Card>
  );
}
