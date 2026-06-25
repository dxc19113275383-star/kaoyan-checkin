import { useState } from 'react';
import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAsync } from '@/app/useAsync';
import { loadReadingPassages, loadReadingPassage } from '@/lib/content/contentClient';
import type { ReadingPassageMeta } from '@/lib/content/contentTypes';
import { getReading, setReading } from './readingStore';

export function ReadingPage() {
  const listState = useAsync(loadReadingPassages, []);
  const passages = listState.data ?? [];
  const [openId, setOpenId] = useState<string | null>(null);
  const meta: ReadingPassageMeta | undefined = passages.find((p) => p.id === openId) ?? undefined;

  const articleState = useAsync(
    () => (meta ? loadReadingPassage(meta.file) : Promise.resolve(null)),
    [meta?.file],
  );
  const article = articleState.data;

  const r = getReading();
  const isRead = (id: string) => Boolean(r.progress[id]?.done);

  const toggleRead = (id: string) => {
    const cur = getReading();
    cur.progress[id] = { ...cur.progress[id], done: !cur.progress[id]?.done, lastAt: new Date().toISOString() };
    setReading(cur);
    setOpenId((x) => x); // 触发重渲染
  };

  const readCount = Object.values(r.progress).filter((p) => p.done).length;

  // 详情视图
  if (meta) {
    return (
      <ModuleScaffold
        title="阅读"
        legacyHash="#learn"
        responsibilities={['文章加载 / 阅读进度（统一走 kaoyan_v2）', '内容读自 data/reading']}
      >
        <button className="ky-link" onClick={() => setOpenId(null)}>← 返回列表</button>
        {articleState.loading ? (
          <Card>加载文章中…</Card>
        ) : !article ? (
          <Card>文章加载失败。</Card>
        ) : (
          <Card title={article.title}>
            {article.intro && <p className="ky-read__intro">{article.intro}</p>}
            {article.paragraphs.map((p, i) => (
              <p key={i} className="ky-read__p">{p}</p>
            ))}
            <Button variant={isRead(meta.id) ? 'ghost' : 'primary'} onClick={() => toggleRead(meta.id)}>
              {isRead(meta.id) ? '已读 ✓（点击取消）' : '标记已读'}
            </Button>
          </Card>
        )}
      </ModuleScaffold>
    );
  }

  // 列表视图
  return (
    <ModuleScaffold
      title="阅读"
      legacyHash="#learn"
      responsibilities={['文章加载 / 阅读进度（统一走 kaoyan_v2）', '内容读自 data/reading']}
    >
      {listState.loading ? (
        <Card>加载文章列表中…</Card>
      ) : passages.length === 0 ? (
        <Card>暂无文章。</Card>
      ) : (
        <ul className="ky-read__list">
          {passages.map((p) => (
            <li key={p.id} className="ky-read__item" onClick={() => setOpenId(p.id)}>
              <div>
                <span className="ky-read__title">{p.title}</span>
                {p.level && <span className="ky-read__sub"> · {p.level}</span>}
              </div>
              {isRead(p.id) && <span className="ky-tag">已读</span>}
            </li>
          ))}
        </ul>
      )}
      <Card title="进度">已读 {readCount} 篇。</Card>
    </ModuleScaffold>
  );
}
