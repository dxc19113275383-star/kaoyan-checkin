import { useState } from 'react';
import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { useAsync } from '@/app/useAsync';
import { loadMathSets, loadMathSet } from '@/lib/content/contentClient';
import type { MathSetMeta } from '@/lib/content/contentTypes';
import { getMath, setMath } from './mathStore';
import { recordMistake } from '@/modules/learn/mistakes/mistakesStore';

export function MathPage() {
  const setsState = useAsync(loadMathSets, []);
  const sets = (setsState.data ?? []).filter((s) => !s.placeholder);
  const [activeId, setActiveId] = useState<string | null>(null);
  const meta: MathSetMeta | undefined = sets.find((s) => s.id === activeId) ?? sets[0];

  const qState = useAsync(() => (meta ? loadMathSet(meta.file) : Promise.resolve(null)), [meta?.file]);
  const questions = qState.data?.questions ?? [];

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const q = questions[idx];

  const pickSet = (id: string) => {
    setActiveId(id);
    setIdx(0);
    setSelected(null);
  };

  const answer = (opt: number) => {
    if (selected !== null || !q) return;
    setSelected(opt);
    const correct = opt === q.answer;
    const m = getMath();
    m.progress[`${meta!.id}:${q.id}`] = { answer: opt, correct, lastAt: new Date().toISOString() };
    setMath(m);
    if (!correct) recordMistake('math', q.id, { title: q.stem, tag: q.cat ?? meta!.cat ?? '', cat: meta!.cat });
  };

  const next = () => {
    setSelected(null);
    setIdx((i) => Math.min(i + 1, questions.length - 1));
  };

  const answeredCount = Object.keys(getMath().progress).length;

  return (
    <ModuleScaffold
      title="数学"
      legacyHash="#learn"
      responsibilities={[
        '题目加载 / 做题 / 判分 / 解析 / 错题记录（统一走 kaoyan_v2）',
        '内容读自 data/math（V7.0 保持选择题结构）',
      ]}
    >
      {sets.length > 1 && (
        <Tabs items={sets.map((s) => ({ id: s.id, label: s.name }))} active={meta?.id ?? ''} onChange={pickSet} />
      )}

      {setsState.loading ? (
        <Card>加载题集中…</Card>
      ) : !meta ? (
        <Card>暂无可用题集。</Card>
      ) : qState.loading ? (
        <Card>加载题目中…</Card>
      ) : !q ? (
        <Card>该题集暂无题目。</Card>
      ) : (
        <Card title={`${meta.name} · 第 ${idx + 1}/${questions.length} 题${q.cat ? ` · ${q.cat}` : ''}`}>
          <p className="ky-q__stem">{q.stem}</p>
          <div className="ky-q__opts">
            {q.options.map((opt, i) => {
              const isAnswer = i === q.answer;
              const isPicked = i === selected;
              const cls =
                selected === null
                  ? ''
                  : isAnswer
                    ? 'is-correct'
                    : isPicked
                      ? 'is-wrong'
                      : '';
              return (
                <button key={i} className={`ky-opt ${cls}`} onClick={() => answer(i)} disabled={selected !== null}>
                  <span className="ky-opt__k">{String.fromCharCode(65 + i)}</span> {opt}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <div className="ky-q__feedback">
              <p>{selected === q.answer ? '✅ 答对了' : '❌ 答错了，已记入错题中心'}</p>
              {q.explain && <p className="ky-q__explain">{q.explain}</p>}
              <Button onClick={next} disabled={idx >= questions.length - 1}>
                {idx >= questions.length - 1 ? '已是最后一题' : '下一题'}
              </Button>
            </div>
          )}
        </Card>
      )}

      <Card title="进度">已作答 {answeredCount} 题（累计，跨题集）。</Card>
    </ModuleScaffold>
  );
}
