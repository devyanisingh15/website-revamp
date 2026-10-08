import { Check } from 'lucide-react';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/api/orders';
import { cx } from '@/lib/format';

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const idx = ORDER_STATUSES.findIndex((s) => s.id === status);
  return (
    <ol className="grid gap-0 sm:grid-cols-5" aria-label="Order progress">
      {ORDER_STATUSES.map((s, i) => {
        const done = i <= idx;
        return (
          <li key={s.id} className="relative flex items-center gap-3 pb-6 sm:flex-col sm:items-start sm:pb-0" aria-current={i === idx ? 'step' : undefined}>
            {i < ORDER_STATUSES.length - 1 && (
              <span aria-hidden className={cx('absolute left-[13px] top-7 h-full w-px sm:left-7 sm:top-[13px] sm:h-px sm:w-[calc(100%-28px)]', i < idx ? 'bg-proof-400' : 'bg-white/15')} />
            )}
            <span className={cx('relative z-10 grid size-7 shrink-0 place-items-center rounded-full border', done ? 'border-proof-400 bg-proof-400 text-ink-950' : 'border-white/25 bg-ink-950')}>
              {done ? <Check className="size-4" aria-hidden /> : <span className="size-1.5 rounded-full bg-white/30" />}
            </span>
            <span className={cx('text-sm sm:mt-3', i === idx ? 'font-semibold text-white' : done ? 'text-bone-200' : 'text-bone-400')}>
              {s.label}
              <span className="sr-only">{done ? ' — done' : ' — pending'}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
