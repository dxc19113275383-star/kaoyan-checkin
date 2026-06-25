import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { getSyntax } from './syntaxStore';

export function SyntaxPage() {
  const s = getSyntax();
  return (
    <ModuleScaffold
      title="长难句"
      legacyHash="#learn"
      responsibilities={[
        '长难句数据加载 / 成分拆解展示 / 学习状态记录',
        '读取 data/syntax 下的句库',
      ]}
    >
      <Card title="当前进度">
        <ul className="ky-list">
          <li>激活句集：{s.active}</li>
          <li>已学句数：{Object.keys(s.progress).length}</li>
        </ul>
      </Card>
    </ModuleScaffold>
  );
}
