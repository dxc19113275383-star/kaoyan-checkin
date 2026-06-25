import { Card } from '@/components/ui/Card';
import { readSlice } from '@/lib/storage/appStateStore';
import { getMistakes } from '@/modules/learn/mistakes/mistakesStore';
import { weaknessByMod, topWeakTags } from './dashboardLogic';

const MOD_LABELS: Record<string, string> = {
  vocab: '词汇', reading: '阅读', math: '数学', syntax: '长难句', writing: '作文', listening: '听力',
};
const label = (m: string) => MOD_LABELS[m] ?? m;

/** 偏科预警 / 薄弱点：按模块、考点聚合未解决错题 + 薄弱点笔记。 */
export function WeaknessPanel() {
  const mistakes = getMistakes();
  const byMod = weaknessByMod(mistakes).filter((x) => x.open > 0);
  const tags = topWeakTags(mistakes, 5);
  const notes = readSlice('dashboard').notes;
  const noteList = Object.entries(notes).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 3);

  return (
    <Card title="偏科预警 · 薄弱点">
      {byMod.length === 0 ? (
        <p className="ky-data-hint">暂无未解决错题。做题答错后会自动出现在这里。</p>
      ) : (
        <div className="ky-weak">
          {byMod.map((x) => (
            <span key={x.mod} className="ky-weak__chip">
              {label(x.mod)} <strong>{x.open}</strong> 待解决
            </span>
          ))}
        </div>
      )}
      {tags.length > 0 && (
        <p className="ky-weak__tags">
          高频考点：{tags.map((t) => `${t.tag}(${t.open})`).join(' · ')}
        </p>
      )}
      {noteList.length > 0 && (
        <ul className="ky-list ky-weak__notes">
          {noteList.map(([date, n]) => (
            <li key={date}><span className="ky-tag">{n.weakSubject || '笔记'}</span> {date}：{n.text}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
