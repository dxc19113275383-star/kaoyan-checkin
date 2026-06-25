import { useState } from 'react';
import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { useAsync } from '@/app/useAsync';
import { loadVocabLibs, loadVocabLib } from '@/lib/content/contentClient';
import { getVocab, setVocab } from './vocabStore';
import { recordMistake } from '@/modules/learn/mistakes/mistakesStore';

export function VocabPage() {
  const libsState = useAsync(loadVocabLibs, []);
  const libs = (libsState.data ?? []).filter((l) => !l.placeholder);
  const [activeId, setActiveId] = useState<string | null>(null);
  const lib = libs.find((l) => l.id === activeId) ?? libs[0];

  const fileState = useAsync(() => (lib ? loadVocabLib(lib.file) : Promise.resolve(null)), [lib?.file]);
  const words = fileState.data?.words ?? [];

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const word = words[idx];

  const pickLib = (id: string) => {
    setActiveId(id);
    setIdx(0);
    setRevealed(false);
    const v = getVocab();
    setVocab({ ...v, active: id });
  };

  const grade = (known: boolean) => {
    if (!word) return;
    const v = getVocab();
    v.progress[word.w] = {
      known,
      level: (v.progress[word.w]?.level ?? 0) + (known ? 1 : 0),
      lastAt: new Date().toISOString(),
    };
    setVocab(v);
    if (!known) recordMistake('vocab', word.w, { title: word.w, tag: '词汇' });
    setRevealed(false);
    setIdx((i) => Math.min(i + 1, words.length - 1));
  };

  const v = getVocab();
  const knownCount = Object.values(v.progress).filter((p) => p.known).length;

  return (
    <ModuleScaffold
      title="词汇"
      legacyHash="#learn"
      responsibilities={[
        '单词卡 / 学习进度 / 复习状态 / 错词记录（统一走 kaoyan_v2）',
        '内容读自 data/words',
      ]}
    >
      {libs.length > 1 && (
        <Tabs items={libs.map((l) => ({ id: l.id, label: l.name }))} active={lib?.id ?? ''} onChange={pickLib} />
      )}

      {libsState.loading || fileState.loading ? (
        <Card>加载词库中…</Card>
      ) : !word ? (
        <Card>该词库暂无单词。</Card>
      ) : (
        <Card title={`${lib?.name} · 第 ${idx + 1}/${words.length} 个`}>
          <div className="ky-flash">
            <p className="ky-flash__w">{word.w}</p>
            {word.ph && <p className="ky-flash__ph">{word.ph}</p>}
            {revealed ? (
              <>
                <p className="ky-flash__def">{word.def}</p>
                {word.ex && <p className="ky-flash__ex">{word.ex}</p>}
                {word.exCn && <p className="ky-flash__excn">{word.exCn}</p>}
                <div className="ky-flash__actions">
                  <Button variant="danger" onClick={() => grade(false)}>不认识</Button>
                  <Button variant="primary" onClick={() => grade(true)}>认识</Button>
                </div>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setRevealed(true)}>显示释义</Button>
            )}
          </div>
        </Card>
      )}

      <Card title="进度">已认识 {knownCount} 词 · 学过 {Object.keys(v.progress).length} 词。</Card>
    </ModuleScaffold>
  );
}
