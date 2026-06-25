import type { ReactNode } from 'react';

export interface CardProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** 卡片容器，对应现役 UI 的圆角卡片。 */
export function Card({ title, children, className = '' }: CardProps) {
  return (
    <section className={`ky-card ${className}`}>
      {title != null && <header className="ky-card__title">{title}</header>}
      <div className="ky-card__body">{children}</div>
    </section>
  );
}
