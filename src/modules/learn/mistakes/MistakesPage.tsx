import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { getMistakes, listOpenMistakes } from './mistakesStore';

export function MistakesPage() {
  const all = getMistakes();
  const open = listOpenMistakes();
  return (
    <ModuleScaffold
      title="错题中心"
      legacyHash="#mistakes"
      responsibilities={[
        '跨模块错题聚合 / 来源标记 / 一键重练',
        '错因字段预留（cause），智能复习接口留待 V7.1 / V7.2',
      ]}
    >
      <Card title="错题概览">
        <ul className="ky-list">
          <li>错题总数：{Object.keys(all).length}</li>
          <li>未解决：{open.length}</li>
        </ul>
      </Card>
    </ModuleScaffold>
  );
}
