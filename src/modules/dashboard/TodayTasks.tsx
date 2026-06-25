import { Card } from '@/components/ui/Card';
import { getCheckin } from '@/modules/checkin/checkinStore';
import { keyFor } from '@/modules/checkin/checkinLogic';

/** 今日任务概览（派生自 checkin 切片）。完整任务清单仍由现役 index.html 渲染。 */
export function TodayTasks() {
  const c = getCheckin();
  const doneCount = (c.data[keyFor(c.p, c.wk, c.day)] ?? []).length;
  return (
    <Card title="今日任务">
      <p>今日已完成 {doneCount} 项（第 {c.wk} 周 第 {c.day + 1} 天）。</p>
    </Card>
  );
}
