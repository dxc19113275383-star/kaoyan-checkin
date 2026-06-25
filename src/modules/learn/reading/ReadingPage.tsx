import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { getReading } from './readingStore';

export function ReadingPage() {
  const r = getReading();
  return (
    <ModuleScaffold
      title="阅读"
      legacyHash="#learn"
      responsibilities={[
        '文章加载 / 阅读进度 / 生词与重点句记录',
        '读取 data/reading 下的文章',
      ]}
    >
      <Card title="当前进度">
        <ul className="ky-list">
          <li>已记录文章数：{Object.keys(r.progress).length}</li>
        </ul>
      </Card>
    </ModuleScaffold>
  );
}
