/**
 * BlurText —— 基于 react-bits「BlurText」思路的轻量重写（TS 版，零依赖）。
 * 文本按词/字逐个从模糊+下移渐入清晰，用于 Hero 问候语等"出现一次"的标题。
 *
 * 改编自 DavidHDev/react-bits（MIT），适配本项目：
 *  - 不引库，纯 CSS 动画（@keyframes ky-blur-word 在组件内注入一次）。
 *  - 接 prefers-reduced-motion 降级（直接显示，无动画）。
 *  - 一次性播放（不循环、不随滚动重复触发）。
 */
import { useMemo, type CSSProperties } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

let injected = false;
function ensureKeyframes() {
  if (injected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent =
    '@keyframes ky-blur-word{from{opacity:0;filter:blur(8px);transform:translateY(6px)}to{opacity:1;filter:blur(0);transform:none}}';
  document.head.appendChild(style);
  injected = true;
}

export interface BlurTextProps {
  text: string;
  /** 按 'word' 或 'char' 切分，默认 'word'。 */
  splitBy?: 'word' | 'char';
  /** 每个单元间隔（ms），默认 60。 */
  stagger?: number;
  /** 单元动画时长（ms），默认 420。 */
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

export function BlurText({
  text,
  splitBy = 'word',
  stagger = 60,
  duration = 420,
  className,
  style,
}: BlurTextProps) {
  const reduced = usePrefersReducedMotion();
  ensureKeyframes();

  const units = useMemo(
    () => (splitBy === 'char' ? Array.from(text) : text.split(/(\s+)/)),
    [text, splitBy],
  );

  if (reduced) {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    );
  }

  return (
    <span className={className} style={style} aria-label={text}>
      {units.map((u, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            display: 'inline-block',
            whiteSpace: 'pre',
            animation: `ky-blur-word ${duration}ms cubic-bezier(.16,1,.3,1) both`,
            animationDelay: `${i * stagger}ms`,
          }}
        >
          {u}
        </span>
      ))}
    </span>
  );
}
