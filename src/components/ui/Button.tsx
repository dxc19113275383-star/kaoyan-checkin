import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  children: ReactNode;
}

/** 复用按钮，沿用现役 UI 的暖色调（见 styles/tokens.css）。 */
export function Button({ variant = 'primary', children, className = '', ...rest }: ButtonProps) {
  return (
    <button className={`ky-btn ky-btn--${variant} ${className}`} {...rest}>
      {children}
    </button>
  );
}
