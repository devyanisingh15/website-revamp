import { useMemo, useState } from 'react';
import { BadgeCheck, Camera, MessageSquarePlus, Star } from 'lucide-react';
import { Rating } from '../ui/Rating';
import { Button } from '../ui/Button';
import { MockTag } from '../ui/Placeholder';
import { ProductArt } from './ProductArt';
import { useToast } from '@/lib/toast';
import { cx } from '@/lib/format';
import { getRatingBreakdown, getReviews, type Review, type ReviewTag } from '@/mocks/reviews';
import type { Product } from '@/data/types';

type Filter = 'Flavour' | ReviewTag | 'With photos';
const FILTERS: Filter[] = ['Flavour', 'Mixability', 'Taste', 'Results', 'With photos'];
const TAGS: ReviewTag[] = ['Mixability', 'Taste', 'Results'];

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cx('size-3.5', i <= value ? 'fill-amber-signal text-amber-signal' : 'text-white/20')} aria-hidden />
      ))}
    </span>
  );
}

/** Reviews — MOCK data from src/mocks/reviews.ts until the reviews service is connected. */
export function ReviewsBlock({ product, flavourId, flavourName }: { product: Product; flavourId?: string | null; flavourName?: string }) {
  const [active, setActive] = useState<Filter[]>([]);
  const { push } = useToast();
  const reviews = useMemo(() => getReviews(product), [product]); // ← reviews API
  const breakdown = useMemo(() => getRatingBreakdown(product), [product]);
  const maxCount = Math.max(...breakdown.map((b) => b.count), 1);

  const activeTags = active.filter((f): f is ReviewTag => (TAGS as string[]).includes(f));
  const shown = reviews.filter((r) => {
    if (active.includes('Flavour') && flavourId && r.flavourId !== flavourId) return false;
    if (active.includes('With photos') && !r.hasPhoto) return false;
    if (activeTags.length && !activeTags.some((t) => r.tags.includes(t))) return false;
    return true;
  });
  const flavourOf = (r: Review) => product.flavours.find((f) => f.id === r.flavourId);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-[calc(var(--header-h)+16px)] border-t hairline py-20">
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

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* Rating summary */}
          <div className="lg:col-span-4">
            <div className="rounded-md border hairline p-6">
              <p className="flex items-baseline gap-2">
                <span className="display-tight text-6xl tabular-nums">{product.rating.toFixed(1)}</span>
                <span className="text-bone-400">/ 5</span>
              </p>
              <Stars value={Math.round(product.rating)} />
              <p className="mt-2 text-sm text-bone-400">Based on {product.reviewCount.toLocaleString('en-IN')} verified reviews</p>
              <ul className="mt-6 space-y-2" aria-label="Rating breakdown">
                {breakdown.map((b) => (
                  <li key={b.stars} className="flex items-center gap-3 text-sm">
                    <span className="w-6 font-mono tabular-nums">{b.stars}★</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full bg-amber-signal" style={{ width: `${(b.count / maxCount) * 100}%` }} />
                    </span>
                    <span className="w-14 text-right font-mono text-xs tabular-nums text-bone-400">{b.count.toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5">
                <MockTag>Sample reviews</MockTag>
              </p>
            </div>
          </div>

          {/* Filters + list */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter reviews">
              {FILTERS.filter((f) => f !== 'Flavour' || flavourId).map((f) => {
                const on = active.includes(f);
                return (
                  <button key={f} aria-pressed={on} onClick={() => setActive((a) => (on ? a.filter((x) => x !== f) : [...a, f]))} className={cx('inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors', on ? 'border-bone-100 bg-bone-100 text-ink-950' : 'border-white/15 hover:border-white/50')}>
                    {f === 'With photos' && <Camera className="size-4" aria-hidden />}
                    {f === 'Flavour' && flavourName ? flavourName : f}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-bone-400" aria-live="polite">
              Showing {shown.length} of {reviews.length} recent reviews
            </p>

            {shown.length === 0 ? (
              <div className="mt-6 rounded-md border border-dashed border-white/15 p-10 text-center">
                <p className="display-tight text-2xl">{active.includes('Flavour') && flavourName ? `Be the first to review ${flavourName}.` : 'No reviews match these filters.'}</p>
                <button onClick={() => setActive([])} className="mt-3 text-sm font-semibold underline underline-offset-4">
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="mt-6 divide-y divide-white/10 border-y hairline">
                {shown.map((r) => {
                  const fl = flavourOf(r);
                  return (
                    <li key={r.id} className="flex gap-5 py-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <Stars value={r.rating} />
                          <p className="font-semibold">{r.title}</p>
                        </div>
                        <p className="mt-2 leading-relaxed text-bone-300">{r.body}</p>
                        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-bone-400">
                          <span className="font-semibold text-bone-200">
                            {r.name}, {r.city}
                          </span>
                          {r.verified && (
                            <span className="inline-flex items-center gap-1">
                              <BadgeCheck className="size-3.5 text-proof-400" aria-hidden /> Verified buyer
                            </span>
                          )}
                          {fl && fl.family !== 'unflavoured' && <span>Flavour: {fl.name}</span>}
                          <time dateTime={r.date}>{new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                        </p>
                        {r.tags.length > 0 && (
                          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Mentions">
                            {r.tags.map((t) => (
                              <li key={t} className="rounded-full border hairline px-2.5 py-0.5 text-[11px] text-bone-300">
                                {t}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {r.hasPhoto && (
                        <span className="grid size-20 shrink-0 place-items-center rounded-sm bg-ink-900 p-2" title="Customer photo">
                          <ProductArt art={product.art} band={fl && fl.family !== 'tbc' ? fl.color : undefined} shadow={false} title={`Customer photo of ${product.shortName}`} />
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
