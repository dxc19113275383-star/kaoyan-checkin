import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { getMath } from './mathStore';

export function MathPage() {
  const m = getMath();
  return (
    <ModuleScaffold
      title="数学"
      legacyHash="#learn"
      responsibilities={[
        '题目加载 / 做题状态 / 答案判断 / 解析展示 / 错题记录',
        '读取 data/math 下的题库（V7.0 保持选择题结构）',
      ]}
    >
      <Card title="当前进度">
        <ul className="ky-list">
          <li>已作答题数：{Object.keys(m.progress).length}</li>
          <li>错题数：{m.wrongBook.length}</li>
        </ul>
      </Card>
    </ModuleScaffold>
  );
}
