import { ArrowRight } from 'lucide-react';
import { SEO } from '@/data/seo';
import { useSeo } from '@/hooks/useSeo';
import { ButtonLink } from '@/components/ui/Button';
import { ProductArt } from '@/components/product/ProductArt';
import { getProduct, PRIMARY_PRODUCT_ID } from '@/data/products';

export default function NotFoundPage() {
  useSeo({ ...SEO.notFound, noindex: true });
  const p = getProduct(PRIMARY_PRODUCT_ID)!;
  return (
    <div className="relative overflow-hidden bg-ink-950">
      <p aria-hidden className="display pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 select-none text-[38vw] leading-none text-white/[0.03]">
        404
      </p>
      <div className="container-x relative grid min-h-[70vh] items-center gap-10 py-20 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="font-mono text-sm text-blaze-500">Error 404</p>
          <h1 className="display mt-4 text-display-xl">Missed That Rep.</h1>
          <p className="mt-6 max-w-md text-lede text-bone-300">This page doesn’t exist, but your gains still do.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink to="/" size="lg">
              Back to Home
            </ButtonLink>
            <ButtonLink to="/#bestsellers" size="lg" variant="secondary" iconRight={<ArrowRight className="size-4" />}>
              Shop Bestsellers
            </ButtonLink>
          </div>
        </div>
        <div className="mx-auto w-48 rotate-[18deg] md:col-span-4 md:col-start-9 md:w-64">
          <ProductArt art={p.art} band="#e8202a" protein={25} />
        </div>
      </div>
    </div>
  );
}
