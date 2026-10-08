import { Star } from 'lucide-react';
import { Ph } from './Placeholder';
import { cx } from '@/lib/format';

/** "★ 4.x · [N] verified reviews" — renders placeholders until reviews API is connected */
export function Rating({ rating, count, compact, className }: { rating: number | null; count: number | null; compact?: boolean; className?: string }) {
  return (
    <div className={cx('flex items-center gap-1.5 text-sm', className)}>
      <Star className="size-3.5 fill-amber-signal text-amber-signal" aria-hidden />
      {rating != null ? <span className="font-semibold tabular-nums">{rating.toFixed(1)}</span> : <Ph label="rating to be connected">4.x</Ph>}
      {!compact && (
        <>
          <span className="opacity-40" aria-hidden>·</span>
          <span className="opacity-75">
            {count != null ? count.toLocaleString('en-IN') : <Ph label="review count to be connected">[N]</Ph>} verified reviews
          </span>
        </>
      )}
    </div>
  );
}
