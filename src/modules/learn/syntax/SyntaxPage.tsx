import { useState } from 'react';
import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { useAsync } from '@/app/useAsync';
import { loadSyntaxSets, loadSyntaxSet } from '@/lib/content/contentClient';
import { getSyntax, setSyntax } from './syntaxStore';

export function SyntaxPage() {
  const setsState = useAsync(loadSyntaxSets, []);
  const sets = (setsState.data ?? []).filter((s) => !s.placeholder);
  const [activeId, setActiveId] = useState<string | null>(null);
  const meta = sets.find((s) => s.id === activeId) ?? sets[0];

  const fileState = useAsync(() => (meta ? loadSyntaxSet(meta.file) : Promise.resolve(null)), [meta?.file]);
  const sentences = fileState.data?.sentences ?? [];

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const s = sentences[idx];

  const pickSet = (id: string) => {
    setActiveId(id);
    setIdx(0);
    setRevealed(false);
    const st = getSyntax();
    setSyntax({ ...st, active: id });
  };

  const mark = (known: boolean) => {
    if (!s) return;
    if (known) {
      const st = getSyntax();
      st.progress[`${meta!.id}:${s.id}`] = { known: true, lastAt: new Date().toISOString() };
      setSyntax(st);
    }
    setRevealed(false);
    setIdx((i) => Math.min(i + 1, sentences.length - 1));
  };

  const knownCount = Object.values(getSyntax().progress).filter((p) => p.known).length;

  return (
    <ModuleScaffold
      title="长难句"
      legacyHash="#learn"
      responsibilities={[
        '长难句加载 / 成分拆解展示 / 学习状态（统一走 kaoyan_v2）',
        '内容读自 data/syntax',
      ]}
    >
      {sets.length > 1 && (
        <Tabs items={sets.map((x) => ({ id: x.id, label: x.name }))} active={meta?.id ?? ''} onChange={pickSet} />
      )}

      {setsState.loading || fileState.loading ? (
        <Card>加载长难句中…</Card>
      ) : !s ? (
        <Card>该句集暂无句子。</Card>
      ) : (
        <Card title={`${meta?.name} · 第 ${idx + 1}/${sentences.length} 句${s.cat ? ` · ${s.cat}` : ''}`}>
          <p className="ky-syntax__en">{s.en}</p>
          {revealed ? (
            <>
              <p className="ky-syntax__cn">{s.cn}</p>
              {s.parts && s.parts.length > 0 && (
                <ul className="ky-syntax__parts">
                  {s.parts.map((p, i) => (
                    <li key={i}>
                      <span className="ky-syntax__text">{p.text}</span>
                      {p.role && <span className="ky-tag">{p.role}</span>}
                      {p.note && <span className="ky-syntax__note">{p.note}</span>}
                    </li>
                  ))}
                </ul>
              )}
              <div className="ky-flash__actions">
                <Button variant="ghost" onClick={() => mark(false)}>再看看</Button>
                <Button variant="primary" onClick={() => mark(true)}>已掌握</Button>
              </div>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setRevealed(true)}>显示翻译 + 成分拆解</Button>
          )}
        </Card>
      )}

      <Card title="进度">已掌握 {knownCount} 句。</Card>
    </ModuleScaffold>
  );
}
