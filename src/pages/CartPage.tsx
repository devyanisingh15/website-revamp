import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Truck, Ticket, Lock, ArrowRight, Plus } from 'lucide-react';
import { useCart, lineUnitPrice } from '@/lib/cart';
import { getProduct } from '@/data/products';
import { SEO } from '@/data/seo';
import { SITE } from '@/data/site';
import { useSeo } from '@/hooks/useSeo';
import { applyCoupon } from '@/lib/api/coupons';
import { FREE_DELIVERY_THRESHOLD, getPrice, SHAKER_UPSELL_ID } from '@/mocks/pricing';
import { HOME_BESTSELLERS } from '@/mocks/merchandising';
import { formatINR, cx } from '@/lib/format';
import { ProductArt } from '@/components/product/ProductArt';
import { ProductCard } from '@/components/product/ProductCard';
import { QuantityStepper } from '@/components/ecommerce/QuantityStepper';
import { Button, ButtonLink } from '@/components/ui/Button';
import { OrderSummary } from '@/components/ecommerce/OrderSummary';
import { useAddToCart } from '@/hooks/useAddToCart';
import type { Product } from '@/data/types';

export default function CartPage() {
  useSeo({ ...SEO.cart, noindex: true });
  const { lines, totals, setQty, remove, coupon, setCoupon } = useCart();
  const addToCart = useAddToCart();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [couponState, setCouponState] = useState<'idle' | 'loading' | 'bad'>('idle');
  const shaker = getProduct(SHAKER_UPSELL_ID)!;
  const shakerPrice = getPrice(shaker.id, shaker.sizes[0].id)?.price;
  const hasShaker = lines.some((l) => l.productId === shaker.id);
  const pct = Math.min(100, ((FREE_DELIVERY_THRESHOLD - totals.awayFromFree) / FREE_DELIVERY_THRESHOLD) * 100);

  const submitCoupon = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setCouponState('loading');
    const r = await applyCoupon(code);
    if (r.ok) {
      setCoupon({ code: r.code, pct: r.pct });
      setCouponState('idle');
      setCode('');
    } else setCouponState('bad');
  };

  if (lines.length === 0) {
    const best = HOME_BESTSELLERS.map(getProduct).filter(Boolean) as Product[];
    return (
      <div className="bg-ink-950">
        <div className="container-x py-20 text-center md:py-28">
          <h1 className="display text-display-lg">Your Cart</h1>
          <p className="mx-auto mt-6 max-w-md text-lede text-bone-300">Your cart’s lighter than your warm-up set.</p>
          <ButtonLink to="/#bestsellers" size="lg" className="mt-8" iconRight={<ArrowRight className="size-4" />}>
            Shop Bestsellers
          </ButtonLink>
        </div>
        <section className="surface-bone py-16">
          <div className="container-x">
            <h2 className="display text-display-sm">Most Loved, Most Lifted</h2>
            <ul className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {best.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} tone="light" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-ink-950">
      <div className="container-x py-10 md:py-16">
        <h1 className="display text-display-md">
          Your Cart <span className="font-mono text-lg font-normal tracking-normal text-bone-400">({totals.count})</span>
        </h1>

        {/* Free delivery meter */}
        <div className="mt-8 rounded-md border hairline p-5" role="status">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Truck className={cx('size-4', totals.freeDelivery ? 'text-proof-400' : 'text-bone-300')} aria-hidden />
            {totals.freeDelivery ? 'You’ve unlocked free delivery.' : `You’re ${formatINR(totals.awayFromFree)} away from free delivery`}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
            <div className={cx('h-full rounded-full transition-[width] duration-700', totals.freeDelivery ? 'bg-proof-400' : 'bg-blaze-500')} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <section aria-label="Cart items" className="lg:col-span-8">
            <ul className="border-t hairline">
              {lines.map((l) => {
                const p = getProduct(l.productId)!;
                const f = p.flavours.find((x) => x.id === l.flavourId);
                const s = p.sizes.find((x) => x.id === l.sizeId);
                return (
                  <li key={l.key} className="grid grid-cols-[88px_1fr] gap-4 border-b hairline py-6 sm:grid-cols-[120px_1fr_auto] sm:gap-6">
                    <Link to={`/product/${p.slug}`} className="rounded-sm bg-ink-900 p-3">
                      <ProductArt art={p.art} band={f?.family === 'tbc' ? undefined : f?.color} protein={p.nutrition.protein} shadow={false} />
                    </Link>
                    <div className="min-w-0">
                      <Link to={`/product/${p.slug}`} className="font-semibold hover:underline">
                        {p.shortName}
                      </Link>
                      <p className="mt-1 text-sm text-bone-400">
                        {[f && f.family !== 'tbc' ? f.name : null, s?.label].filter(Boolean).join(' · ')}
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <QuantityStepper size="sm" value={l.qty} onChange={(n) => setQty(l.key, n)} label={`Quantity for ${p.shortName}`} />
                        <button onClick={() => remove(l.key)} className="inline-flex items-center gap-1.5 text-sm text-bone-400 hover:text-blaze-300" aria-label={`Remove ${p.shortName}`}>
                          <Trash2 className="size-4" aria-hidden /> Remove
                        </button>
                      </div>
                    </div>
                    <p className="col-start-2 font-mono text-lg sm:col-start-3 sm:text-right">{formatINR(lineUnitPrice(l) * l.qty)}</p>
                  </li>
                );
              })}
            </ul>

            {!hasShaker && (
              <div className="mt-6 flex items-center gap-4 rounded-md border border-dashed border-white/15 p-4">
                <span className="w-12 shrink-0">
                  <ProductArt art={shaker.art} shadow={false} />
                </span>
                <p className="flex-1 text-sm">
                  <span className="font-semibold">Add a shaker for {shakerPrice ? formatINR(shakerPrice) : '₹[x]'}</span>
                </p>
                <Button size="sm" variant="secondary" icon={<Plus className="size-4" />} onClick={(e) => addToCart({ productId: shaker.id, flavourId: null, sizeId: shaker.sizes[0].id, from: e.currentTarget })}>
                  Add
                </Button>
              </div>
            )}
          </section>

          <aside className="lg:col-span-4" aria-label="Order summary">
            <div className="sticky top-[calc(var(--header-h)+16px)] rounded-md border hairline bg-ink-900 p-6">
              <h2 className="text-lg font-bold">Order summary</h2>
              <form onSubmit={submitCoupon} className="mt-5" noValidate>
                <label htmlFor="coupon" className="flex items-center gap-2 text-sm font-medium">
                  <Ticket className="size-4" aria-hidden /> Have a code?
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="coupon"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setCouponState('idle');
                    }}
                    placeholder="Try DEMO10"
                    aria-invalid={couponState === 'bad' || undefined}
                    aria-describedby="coupon-msg"
                    className="h-11 min-w-0 flex-1 rounded-sm border border-white/15 bg-ink-850 px-3 font-mono text-sm uppercase outline-none focus:border-proof-400"
                  />
                  <Button size="sm" variant="inverse" className="h-11!" loading={couponState === 'loading'} type="submit">
                    Apply
                  </Button>
                </div>
                <p id="coupon-msg" className="mt-2 min-h-4 text-xs" aria-live="polite">
                  {couponState === 'bad' && <span className="text-blaze-300">That code isn’t valid.</span>}
                  {coupon && (
                    <span className="text-proof-400">
                      {coupon.code} applied ·{' '}
                      <button type="button" className="underline" onClick={() => setCoupon(null)}>
                        Remove
                      </button>
                    </span>
                  )}
                </p>
              </form>
              <div className="mt-4 border-t hairline pt-5">
                <OrderSummary />
              </div>
              <Button size="lg" block className="mt-6" icon={<Lock className="size-4" />} onClick={() => navigate('/checkout')}>
                Checkout
              </Button>
              <p className="mt-4 text-center text-xs text-bone-400">{SITE.trustLine}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
