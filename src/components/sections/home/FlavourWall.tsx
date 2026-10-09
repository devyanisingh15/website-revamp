import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Stage3D } from '@/components/3d/Stage3D';
import { loadFlavourBurst } from '@/components/3d/loaders';
import { BIOZYME_FLAVOURS } from '@/data/flavours';
import { getProduct, PRIMARY_PRODUCT_ID } from '@/data/products';
import { ProductArt } from '@/components/product/ProductArt';
import { radioKeyNav } from '@/lib/a11y';
import { cx } from '@/lib/format';

export function FlavourWall() {
  const [id, setId] = useState(BIOZYME_FLAVOURS[0].id);
  const f = BIOZYME_FLAVOURS.find((x) => x.id === id)!;
  const product = getProduct(PRIMARY_PRODUCT_ID)!;

  return (
    <section aria-labelledby="flavour-title" className="relative overflow-hidden bg-ink-950 py-24 md:py-32">
      <div aria-hidden className="absolute inset-0 opacity-40 transition-[background] duration-1000" style={{ background: `radial-gradient(50% 60% at 70% 50%, ${f.color}55, transparent 70%)` }} />
      {/* Mobile order: heading → 3D stage → flavour list, so a tap visibly changes the scene */}
      <div className="container-x relative grid gap-x-12 gap-y-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:items-center">
        <div className="order-1 lg:order-none lg:col-span-5 lg:row-start-1 lg:self-end">
          <h2 id="flavour-title" className="display text-display-lg">
            Tastes Like a <span style={{ color: f.family === 'vanilla' ? '#ead9b0' : f.color }} className="transition-colors duration-700">Reward</span>
          </h2>
          <p className="mt-6 max-w-[42ch] text-lede text-bone-200">From Rich Milk Chocolate to Kesar Pista Badam, pick a flavour you’ll actually look forward to.</p>
        </div>

        <div className="order-3 lg:order-none lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-start">
          <div role="radiogroup" aria-label="Flavours" className="border-t hairline lg:mt-2" onKeyDown={(e) => radioKeyNav(e, BIOZYME_FLAVOURS.map((x) => x.id), id, setId)}>
            {BIOZYME_FLAVOURS.map((x, i) => (
              <button
                key={x.id}
                role="radio"
                aria-checked={x.id === id}
                tabIndex={x.id === id ? 0 : -1}
                onClick={() => setId(x.id)}
                onMouseEnter={() => setId(x.id)}
                className={cx('group flex w-full items-center gap-5 border-b hairline py-4 text-left transition-colors', x.id === id ? 'text-white' : 'text-bone-400 hover:text-bone-100')}
              >
                <span className="font-mono text-xs opacity-60">0{i + 1}</span>
                <span className="size-4 shrink-0 rounded-full border border-black/30" style={{ background: x.accent ? `linear-gradient(135deg, ${x.color} 55%, ${x.accent} 55%)` : x.color }} aria-hidden />
                <span className={cx('display-tight flex-1 text-2xl transition-transform duration-500 md:text-3xl', x.id === id && 'translate-x-2')}>{x.name}</span>
                <span className="hidden gap-1.5 sm:flex">
                  {x.notes?.map((n) => (
                    <span key={n} className="rounded-full border hairline px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                      {n}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>
          <Link to={`/product/${product.slug}?flavour=${f.id}`} className="group mt-8 inline-flex items-center gap-2 font-semibold">
            Shop {f.name} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>

        <div className="relative order-2 -mx-4 aspect-square sm:mx-0 lg:order-none lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
          <Stage3D
            load={loadFlavourBurst}
            sceneProps={{ flavourId: f.id }}
            mobileLive
            className="absolute inset-0"
            label={`The Biozyme tub in a splash of ${f.name}, with ${(f.notes ?? []).join(', ')} in the air around it.`}
            fallback={
              <div className="relative grid size-full place-items-center">
                <img src={`/assets/flavours/${f.id}.webp`} alt="" aria-hidden width={1536} height={1024} loading="lazy" decoding="async" className="absolute inset-x-0 top-1/2 w-full -translate-y-1/2 transition-opacity duration-500" />
                <div className="relative w-[38%] drop-shadow-2xl">
                  <ProductArt art={product.art} band={f.color} protein={25} title={`${product.shortName} in ${f.name}`} />
                </div>
              </div>
            }
          >
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
              <span className="rounded-full border hairline bg-ink-950/70 px-4 py-2 font-mono text-xs uppercase tracking-wider backdrop-blur">{f.name}</span>
            </div>
          </Stage3D>
        </div>
      </div>
    </section>
  );
}
