import { Card } from '@/components/ui/Card';
import { getCheckin } from '@/modules/checkin/checkinStore';
import { computeTotalDays } from '@/modules/checkin/checkinLogic';
import { buildHeatmap } from './dashboardLogic';

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

/** 学习热力图：当前阶段最近 8 周 × 7 天的打卡格子。 */
export function Heatmap() {
  const c = getCheckin();
  const rows = buildHeatmap(c, 8);
  return (
    <Card title={`学习热力图 · ${c.p === 1 ? '全职' : '在职'}阶段 · 累计 ${computeTotalDays(c)} 天`}>
      <div className="ky-heat">
        <div className="ky-heat__head">
          <span className="ky-heat__wk" />
          {DAY_LABELS.map((d) => (
            <span key={d} className="ky-heat__dl">{d}</span>
          ))}
        </div>
        {rows.map((r) => (
          <div key={r.wk} className="ky-heat__row">
            <span className="ky-heat__wk">W{r.wk}</span>
            {r.days.map((done, i) => (
              <span key={i} className={`ky-heat__cell ${done ? 'is-on' : ''}`} title={`第${r.wk}周 周${DAY_LABELS[i]}`} />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
