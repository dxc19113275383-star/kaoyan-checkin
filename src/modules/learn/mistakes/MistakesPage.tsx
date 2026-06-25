import { useMemo, useState } from 'react';
import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { getMistakes, resolveMistake } from './mistakesStore';
import type { MistakeEntry } from './mistakesTypes';

const MOD_LABELS: Record<string, string> = {
  vocab: '词汇',
  reading: '阅读',
  math: '数学',
  syntax: '长难句',
  writing: '作文',
  listening: '听力',
};

function modLabel(mod: string): string {
  return MOD_LABELS[mod] ?? mod;
}

function shortDate(iso: string): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

/**
 * 错题中心（V7.0 → V7.1 试点）：把现役错题聚合逻辑迁成可运行的 React 页面。
 *
 * 数据来源：统一真相来源 `kaoyan_v2`（经 appStateStore 投影为 AppState）。
 * 「标记已解决」会就地写回 `kaoyan_v2.learn.mistakes`，现役 index.html 下次加载即可见（无分叉）。
 * 真实「再练」仍走现役训练舱（/index.html#mistakes）。
 */
export function MistakesPage() {
  const [tick, setTick] = useState(0);
  const [activeMod, setActiveMod] = useState('all');
  const [showResolved, setShowResolved] = useState(false);

  // tick 变化时重新从存储读取，确保「标记已解决」后列表刷新。
  const all = useMemo<MistakeEntry[]>(() => Object.values(getMistakes()), [tick]);

  // 动态生成模块筛选标签（按数据里出现过的模块）。
  const modTabs = useMemo(() => {
    const mods = Array.from(new Set(all.map((m) => m.mod)));
    return [{ id: 'all', label: '全部' }, ...mods.map((m) => ({ id: m, label: modLabel(m) }))];
  }, [all]);

  const filtered = all
    .filter((m) => (showResolved ? true : !m.resolved))
    .filter((m) => (activeMod === 'all' ? true : m.mod === activeMod))
    .sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''));

  const openCount = all.filter((m) => !m.resolved).length;
  const resolvedCount = all.length - openCount;

  const onResolve = (m: MistakeEntry) => {
    resolveMistake(m.mod, m.refId);
    setTick((t) => t + 1);
  };

  return (
    <ModuleScaffold
      title="错题中心"
      legacyHash="#mistakes"
      responsibilities={[
        '跨模块错题聚合 / 来源标记 / 一键重练',
        '错因字段预留（cause），智能复习接口留待 V7.1 / V7.2',
      ]}
    >
      <Card title={`概览 · 未解决 ${openCount} · 已解决 ${resolvedCount}`}>
        <label className="ky-inline">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
          />
          显示已解决
        </label>
      </Card>

      {modTabs.length > 1 && <Tabs items={modTabs} active={activeMod} onChange={setActiveMod} />}

      {filtered.length === 0 ? (
        <Card>
          <p>暂无{showResolved ? '' : '未解决的'}错题。去现役训练舱做题后，错题会自动汇集到这里。</p>
        </Card>
      ) : (
        <ul className="ky-mistakes">
          {filtered.map((m) => (
            <li key={`${m.mod}:${m.refId}`} className={`ky-mistake ${m.resolved ? 'is-resolved' : ''}`}>
              <div className="ky-mistake__main">
                <span className="ky-tag">{modLabel(m.mod)}</span>
                <span className="ky-mistake__title">{m.title || m.refId}</span>
                {m.tag && <span className="ky-mistake__sub">· {m.tag}</span>}
              </div>
              <div className="ky-mistake__meta">
                <span>错 {m.count} 次</span>
                {m.lastAt && <span>· 最近 {shortDate(m.lastAt)}</span>}
              </div>
              <div className="ky-mistake__actions">
                {!m.resolved && (
                  <Button variant="ghost" onClick={() => onResolve(m)}>
                    标记已解决
                  </Button>
                )}
                <a className="ky-btn ky-btn--primary" href={`/index.html#mistakes`}>
                  去再练
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ModuleScaffold>
  );
}
