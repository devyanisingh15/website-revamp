import { cx } from '@/lib/format';

/**
 * Renders a dynamic-data token such as [price] or [N] so missing data is
 * always visible, never guessed. Screen readers hear "to be confirmed".
 */
export function Ph({ children, className, label }: { children: string; className?: string; label?: string }) {
  return (
    <span className={cx('placeholder-token', className)} title={label ?? 'Placeholder — connect to live data'}>
      <span aria-hidden>{children}</span>
      <span className="sr-only">{label ?? 'to be confirmed'}</span>
    </span>
  );
}

/** Small "demo / mock" marker used next to mocked values and services. */
export function MockTag({ children = 'Demo', className }: { children?: string; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-xs border border-amber-signal/40 px-1 py-px font-mono text-[9px] font-semibold uppercase tracking-wider text-amber-signal',
        className,
      )}
    >
      {children}
    </span>
  );
}
