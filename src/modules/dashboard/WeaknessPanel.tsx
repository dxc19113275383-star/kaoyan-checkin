import { Card } from '@/components/ui/Card';
import { readSlice } from '@/lib/storage/appStateStore';
import { listOpenMistakes } from '@/modules/learn/mistakes/mistakesStore';

/** 偏科预警 / 薄弱点展示（派生自 mistakes + dashboard.notes）。 */
export function WeaknessPanel() {
  const notes = readSlice('dashboard').notes;
  const open = listOpenMistakes();
  const noteCount = Object.keys(notes).length;
  return (
    <Card title="偏科预警 · 薄弱点">
      <ul className="ky-list">
        <li>未解决错题：{open.length} 条</li>
        <li>薄弱点笔记：{noteCount} 条</li>
      </ul>
    </Card>
  );
}
