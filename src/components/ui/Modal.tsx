import type { ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  title?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

/** 轻量模态框。 */
export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="ky-modal__overlay" onClick={onClose} role="presentation">
      <div className="ky-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {title != null && <header className="ky-modal__title">{title}</header>}
        <div className="ky-modal__body">{children}</div>
        <button className="ky-modal__close" onClick={onClose} aria-label="关闭">×</button>
      </div>
    </div>
  );
}
