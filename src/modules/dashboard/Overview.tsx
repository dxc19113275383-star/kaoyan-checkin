import { Card } from '@/components/ui/Card';
import { getAppState } from '@/lib/storage/appStateStore';
import { computeTotalDays } from '@/modules/checkin/checkinLogic';
import { listOpenMistakes } from '@/modules/learn/mistakes/mistakesStore';

interface Stat {
  label: string;
  value: number | string;
}

/** 学习概览：跨模块进度一览（全部派生自 kaoyan_v2 各切片）。 */
export function Overview() {
  const s = getAppState();
  const stats: Stat[] = [
    { label: '累计打卡', value: computeTotalDays(s.checkin) },
    { label: '已认识词', value: Object.values(s.vocab.progress).filter((p) => p.known).length },
    { label: '已作答题', value: Object.keys(s.math.progress).length },
    { label: '掌握难句', value: Object.values(s.syntax.progress).filter((p) => p.known).length },
    { label: '已读文章', value: Object.values(s.reading.progress).filter((p) => p.done).length },
    { label: '待解错题', value: listOpenMistakes().length },
  ];
  return (
    <Card title="学习概览">
      <div className="ky-stats">
        {stats.map((st) => (
          <div key={st.label} className="ky-stat">
            <span className="ky-stat__v">{st.value}</span>
            <span className="ky-stat__l">{st.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
