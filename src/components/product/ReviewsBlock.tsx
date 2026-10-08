import { useState } from 'react';
import { Camera, MessageSquarePlus } from 'lucide-react';
import { Rating } from '../ui/Rating';
import { Button } from '../ui/Button';
import { useToast } from '@/lib/toast';
import { cx } from '@/lib/format';
import type { Product } from '@/data/types';

const FILTERS = ['Flavour', 'Mixability', 'Taste', 'Results', 'With photos'];

/** Reviews connect to the reviews service; with none supplied, the empty state is shown. */
export function ReviewsBlock({ product, flavourName }: { product: Product; flavourName?: string }) {
  const [active, setActive] = useState<string[]>([]);
  const { push } = useToast();
  const reviews: never[] = []; // ← reviews API
  return (
    <section aria-labelledby="reviews-title" className="border-t hairline py-20">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="reviews-title" className="display text-display-md">
              What Lifters Are Saying
            </h2>
            <Rating rating={product.rating} count={product.reviewCount} className="mt-4" />
          </div>
          <Button variant="secondary" icon={<MessageSquarePlus className="size-4" />} onClick={() => push({ tone: 'info', title: 'Review submission connects to the reviews service.', body: 'Not available in this concept build.' })}>
            Write a review
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter reviews">
          {FILTERS.map((f) => {
            const on = active.includes(f);
            return (
              <button key={f} aria-pressed={on} onClick={() => setActive((a) => (on ? a.filter((x) => x !== f) : [...a, f]))} className={cx('inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors', on ? 'border-bone-100 bg-bone-100 text-ink-950' : 'border-white/15 hover:border-white/50')}>
                {f === 'With photos' && <Camera className="size-4" aria-hidden />}
                {f}
              </button>
            );
          })}
        </div>
        {reviews.length === 0 && (
          <div className="mt-10 rounded-md border border-dashed border-white/15 p-10 text-center">
            <p className="display-tight text-2xl">Be the first to review this flavour.</p>
            {flavourName && <p className="mt-2 text-sm text-bone-400">{flavourName}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
