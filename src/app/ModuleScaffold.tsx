import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

export interface ModuleScaffoldProps {
  title: string;
  /** 该模块在现役 index.html 中对应的 hash 锚点（点击跳回现役实现）。 */
  legacyHash?: string;
  responsibilities: string[];
  children?: ReactNode;
}

/**
 * V7.0 渐进式重构占位：每个模块页面声明自身职责，并链接回现役 index.html 的对应实现。
 * 现役完整 UI/交互仍在 index.html；React 版页面在 V7.1+ 逐模块接管。
 */
export function ModuleScaffold({ title, legacyHash, responsibilities, children }: ModuleScaffoldProps) {
  return (
    <div className="ky-module">
      <h2 className="ky-module__title">{title}</h2>
      <Card title="模块职责（V7.0 边界）">
        <ul className="ky-list">
          {responsibilities.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Card>
      {children}
      <p className="ky-module__legacy">
        现役完整实现仍在单文件应用中：
        <a href={`/index.html${legacyHash ?? ''}`}>打开 index.html{legacyHash}</a>
      </p>
    </div>
  );
}
