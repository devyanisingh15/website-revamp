import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HOME_BESTSELLERS } from '@/mocks/merchandising';
import { getProduct } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/data/types';

export function Bestsellers() {
  const products = HOME_BESTSELLERS.map(getProduct).filter(Boolean) as Product[];
  return (
    <section id="bestsellers" aria-labelledby="best-title" className="surface-bone py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="best-title" className="display max-w-[12ch] text-display-lg">
            Most Loved, <span className="text-blaze-600">Most Lifted</span>
          </h2>
          <Link to="/shop" className="group inline-flex items-center gap-2 font-semibold">
            Shop all <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
        <div className="mt-14 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} tone="light" />
          ))}
        </div>
        <p className="mt-10 font-mono text-[11px] uppercase tracking-wider text-ink-500">Badges, ratings and prices are placeholders until merchandising, reviews and pricing data are connected.</p>
      </div>
    </section>
  );
}
