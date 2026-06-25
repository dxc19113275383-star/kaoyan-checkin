/**
 * FadeContent —— 基于 react-bits「FadeContent」思路的轻量重写（TS 版，零依赖）。
 * 元素进入视口时柔和淡入上浮（IntersectionObserver，不用 scroll 监听）。
 *
 * 改编自 DavidHDev/react-bits（MIT），适配本项目 design tokens：
 *  - 不引整个库，只取单个组件思路；用原生 IntersectionObserver + CSS transition。
 *  - 接 prefers-reduced-motion 降级（直接显示，不动画）。
 *  - 仅用 transform/opacity（GPU 友好），时长 120–450ms 区间内。
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface FadeContentProps {
  children: ReactNode;
  /** 动画时长（ms），默认 420。 */
  duration?: number;
  /** 进入前的延迟（ms），用于 stagger，默认 0。 */
  delay?: number;
  /** 上浮距离（px），默认 14。 */
  offsetY?: number;
  /** 进入视口比例阈值，默认 0.12。 */
  threshold?: number;
  className?: string;
  style?: CSSProperties;
}

export function FadeContent({
  children,
  duration = 420,
  delay = 0,
  offsetY = 14,
  threshold = 0.12,
  className,
  style,
}: FadeContentProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, threshold]);

  const animatedStyle: CSSProperties = reduced
    ? {}
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : `translateY(${offsetY}px)`,
        transition: `opacity ${duration}ms cubic-bezier(.16,1,.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(.16,1,.3,1) ${delay}ms`,
        willChange: 'opacity, transform',
      };

  return (
    <div ref={ref} className={className} style={{ ...animatedStyle, ...style }}>
      {children}
    </div>
  );
}
