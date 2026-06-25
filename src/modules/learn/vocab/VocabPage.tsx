import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { getVocab } from './vocabStore';

export function VocabPage() {
  const v = getVocab();
  return (
    <ModuleScaffold
      title="词汇"
      legacyHash="#learn"
      responsibilities={[
        '单词列表 / 学习进度 / 复习状态 / 错词记录',
        '读取 data/words 下的词库内容',
      ]}
    >
      <Card title="当前进度">
        <ul className="ky-list">
          <li>激活词库：{v.active}</li>
          <li>每日新词目标：{v.settings.dailyNew}</li>
          <li>已记录进度词数：{Object.keys(v.progress).length}</li>
          <li>错词数：{v.wrongBook.length}</li>
        </ul>
      </Card>
    </ModuleScaffold>
  );
}
