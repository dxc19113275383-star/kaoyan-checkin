import { useState } from 'react';
import { Providers } from './providers';
import { Tabs } from '@/components/ui/Tabs';
import { routes, DEFAULT_ROUTE } from './routes';
import { BlurText, FadeContent } from '@/components/motion';

/**
 * App —— V7.x React 工程外壳（preview.html 入口）。
 *
 * 目的：验证 Vite + React + TS 工具链可运行可构建，并以「模块注册表」的形式
 * 展示重构后的模块边界。现役完整功能仍在 index.html；React 版逐模块接管见 ROADMAP。
 *
 * V7.2：接入 Apple-inspired 设计语言 + react-bits 思路动效（BlurText / FadeContent，
 * 均接 prefers-reduced-motion 降级）。
 */
export function App() {
  const [active, setActive] = useState(DEFAULT_ROUTE);
  const current = routes.find((r) => r.id === active) ?? routes[0];
  const Current = current.component;

  return (
    <Providers>
      <div className="ky-app">
        <header className="ky-app__header">
          <h1>
            <BlurText text="燕燕考研助手" />
          </h1>
          <p className="ky-app__sub">
            模块化预览 · 现役应用见 <a href="/index.html">index.html</a>
          </p>
        </header>
        <Tabs items={routes} active={active} onChange={setActive} />
        <main className="ky-app__main">
          <FadeContent key={active}>
            <Current />
          </FadeContent>
        </main>
      </div>
    </Providers>
  );
}
