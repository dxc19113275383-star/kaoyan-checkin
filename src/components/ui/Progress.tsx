import { percent } from '@/lib/utils/progress';

export interface ProgressProps {
  done: number;
  total: number;
  label?: string;
}

/** 进度条。 */
export function Progress({ done, total, label }: ProgressProps) {
  const p = percent(done, total);
  return (
    <div className="ky-progress" aria-label={label}>
      <div className="ky-progress__track">
        <div className="ky-progress__fill" style={{ width: `${p}%` }} />
      </div>
      <span className="ky-progress__text">{label ? `${label} ` : ''}{p}%</span>
    </div>
  );
}
