import { Card } from '@/components/ui/Card';
import { getCheckin } from '@/modules/checkin/checkinStore';
import { computeTotalDays } from '@/modules/checkin/checkinLogic';

/** 学习热力图概览（占位：完整热力图仍由现役 index.html 渲染）。 */
export function Heatmap() {
  const c = getCheckin();
  return (
    <Card title="学习热力图">
      <p>共有 {computeTotalDays(c)} 天打卡记录。完整热力图见现役应用首页。</p>
    </Card>
  );
}
