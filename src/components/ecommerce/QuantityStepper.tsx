import { Minus, Plus } from 'lucide-react';
import { cx } from '@/lib/format';

export function QuantityStepper({ value, onChange, min = 1, max = 10, label = 'Quantity', size = 'md' }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label?: string; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-9' : 'h-12';
  return (
    <div className={cx('inline-flex items-center rounded-sm border border-current/20', h)} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} className={cx('grid place-items-center disabled:opacity-30', size === 'sm' ? 'w-9' : 'w-11', h)} aria-label="Decrease quantity">
        <Minus className="size-4" />
      </button>
      <output aria-live="polite" className="w-8 text-center font-mono text-sm tabular-nums">
        {value}
      </output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} className={cx('grid place-items-center disabled:opacity-30', size === 'sm' ? 'w-9' : 'w-11', h)} aria-label="Increase quantity">
        <Plus className="size-4" />
      </button>
    </div>
  );
}
