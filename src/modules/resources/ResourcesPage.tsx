import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { readSlice } from '@/lib/storage/appStateStore';

export function ResourcesPage() {
  const r = readSlice('resources');
  return (
    <ModuleScaffold
      title="资料 / 网课"
      legacyHash="#resources"
      responsibilities={['资料 / 网课入口管理', '学习会话记录']}
    >
      <Card title="概览">
        <ul className="ky-list">
          <li>资料条目：{r.resources.length}</li>
          <li>学习会话：{r.studySessions.length}</li>
        </ul>
      </Card>
    </ModuleScaffold>
  );
}
