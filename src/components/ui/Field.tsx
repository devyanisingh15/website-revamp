import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '@/lib/format';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  tone?: 'dark' | 'light';
  hideLabel?: boolean;
  trailing?: ReactNode;
}

/** Labelled input with hint + error wired through aria-describedby. */
export const Field = forwardRef<HTMLInputElement, Props>(function Field(
  { label, hint, error, tone = 'dark', hideLabel, trailing, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  const hintId = hint ? `${fid}-hint` : undefined;
  const errId = error ? `${fid}-err` : undefined;
  return (
    <div className={className}>
      <label htmlFor={fid} className={cx('mb-1.5 block text-[13px] font-medium', hideLabel && 'sr-only', tone === 'dark' ? 'text-bone-200' : 'text-ink-700')}>
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={fid}
          aria-invalid={!!error || undefined}
          aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined}
          className={cx(
            'h-12 w-full rounded-sm border px-4 text-[15px] outline-none transition-colors placeholder:opacity-50',
            tone === 'dark'
              ? 'border-white/15 bg-ink-850 text-bone-100 focus:border-proof-400'
              : 'border-ink-950/15 bg-white text-ink-950 focus:border-ink-950',
            error && 'border-blaze-400!',
            !!trailing && 'pr-28',
          )}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-1 right-1 flex items-center">{trailing}</div>}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs opacity-60">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className={cx('mt-1.5 text-xs font-medium', tone === 'dark' ? 'text-blaze-300' : 'text-blaze-600')}>
          {error}
        </p>
      )}
    </div>
  );
});
