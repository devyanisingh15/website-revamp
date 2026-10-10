import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus, GitCompareArrows } from 'lucide-react';
import type { Product } from '@/data/types';
import { BADGES } from '@/mocks/merchandising';
import { useAddToCart } from '@/hooks/useAddToCart';
import { useCompare, MAX_COMPARE } from '@/lib/compare';
import { useToast } from '@/lib/toast';
import { cx } from '@/lib/format';
import { ProductArt } from './ProductArt';
import { FlavourSelector } from './FlavourSelector';
import { Price } from '../ui/Price';
import { Rating } from '../ui/Rating';

const BADGE_STYLE: Record<string, string> = {
  Bestseller: 'bg-blaze-500 text-white',
  'New Flavour': 'bg-amber-signal text-ink-950',
  'Low Carb': 'bg-proof-400 text-ink-950',
  'Value Pack': 'bg-bone-100 text-ink-950',
};

export function ProductCard({ product, tone = 'dark', compare = false, priority = false }: { product: Product; tone?: 'dark' | 'light'; compare?: boolean; priority?: boolean }) {
  const [flavourId, setFlavourId] = useState<string | null>(product.flavours[0]?.id ?? null);
  const sizeId = product.sizes[0]?.id ?? 'std';
  const addToCart = useAddToCart();
  const cmp = useCompare();
  const { push } = useToast();
  const flavour = product.flavours.find((f) => f.id === flavourId);
  const badges = BADGES[product.id] ?? [];
  const inCompare = cmp.has(product.id);
  const href = `/product/${product.slug}`;

  return (
    <article
      className={cx(
        'group/card relative flex flex-col',
        tone === 'dark' ? 'text-bone-100 [--ring-bg:#111113]' : 'text-ink-950 [--ring-bg:#f2efe9]',
      )}
    >
      <Link
        to={href}
        className={cx('relative block aspect-[4/5] overflow-hidden rounded-md [perspective:900px]', tone === 'dark' ? 'bg-ink-900' : 'bg-bone-200')}
        aria-label={product.name}
      >
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent" aria-hidden />
        <div className="absolute inset-0 grid place-items-center p-[14%] transition-transform duration-700 ease-[var(--ease-out-expo)] [transform-style:preserve-3d] group-hover/card:[transform:rotateY(-16deg)_rotateX(4deg)_scale(1.04)]">
          <ProductArt art={product.art} band={flavour?.family === 'tbc' ? undefined : flavour?.color} protein={product.nutrition.protein} />
        </div>
        {badges.length > 0 && (
          <ul className="absolute left-3 top-3 flex flex-col gap-1.5" aria-label="Badges">
            {badges.map((b) => (
              <li key={b} className={cx('rounded-xs px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider', BADGE_STYLE[b])}>
                {b}
              </li>
            ))}
          </ul>
        )}
        {priority && <span className="sr-only">Featured</span>}
      </Link>

      {compare && (
        <button
          type="button"
          onClick={() => {
            const r = cmp.toggle(product.id);
            if (r === 'full') push({ tone: 'info', title: `Compare up to ${MAX_COMPARE} products`, body: 'Remove one from the tray to add this.' });
          }}
          aria-pressed={inCompare}
          className={cx(
            'absolute right-3 top-3 flex h-9 items-center gap-1.5 rounded-sm px-2.5 text-xs font-semibold backdrop-blur transition-colors',
            inCompare ? 'bg-proof-400 text-ink-950' : 'bg-ink-950/60 text-bone-100 hover:bg-ink-950/80',
          )}
        >
          {inCompare ? <Check className="size-3.5" aria-hidden /> : <GitCompareArrows className="size-3.5" aria-hidden />}
          Compare
        </button>
      )}

      <div className="mt-4 flex flex-1 flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-bold leading-snug tracking-tight">
            <Link to={href} className="hover:underline hover:underline-offset-4">
              {product.shortName}
            </Link>
          </h3>
        </div>
        <p className="font-mono text-xs uppercase tracking-wider opacity-70">
          {product.nutrition.protein != null ? (
            <>
              <span className="text-blaze-500">{product.nutrition.protein} g</span> protein per {product.nutrition.servingLabel ?? 'scoop'}
            </>
          ) : product.keySpecs?.length ? (
            <span className="text-blaze-500">{product.keySpecs[0]}</span>
          ) : (
            <span className="normal-case tracking-normal">{product.oneLiner}</span>
          )}
        </p>
        <Rating rating={product.rating} count={product.reviewCount} />
        <FlavourSelector productId={product.id} flavours={product.flavours} value={flavourId} onChange={setFlavourId} size="sm" showName={false} label={`${product.shortName} flavour`} />
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <Price productId={product.id} sizeId={sizeId} size="sm" showMrp={false} />
          <button
            type="button"
            onClick={(e) => addToCart({ productId: product.id, flavourId, sizeId, from: e.currentTarget })}
            className={cx(
              'group/add inline-flex h-11 shrink-0 items-center gap-1.5 rounded-sm px-4 text-sm font-semibold transition-colors',
              tone === 'dark' ? 'bg-bone-100 text-ink-950 hover:bg-blaze-500 hover:text-white' : 'bg-ink-950 text-bone-100 hover:bg-blaze-500',
            )}
            aria-label={`Add ${product.shortName} to cart`}
          >
            <Plus className="size-4 transition-transform group-hover/add:rotate-90" aria-hidden />
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
