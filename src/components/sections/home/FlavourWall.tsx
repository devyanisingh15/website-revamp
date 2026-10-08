import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Stage3D } from '@/components/3d/Stage3D';
import { loadSwirl } from '@/components/3d/loaders';
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
      <div className="container-x relative grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <h2 id="flavour-title" className="display text-display-lg">
            Tastes Like a <span style={{ color: f.family === 'vanilla' ? '#ead9b0' : f.color }} className="transition-colors duration-700">Reward</span>
          </h2>
          <p className="mt-6 max-w-[42ch] text-lede text-bone-200">From Rich Milk Chocolate to Kesar Pista Badam, pick a flavour you’ll actually look forward to.</p>

          <div role="radiogroup" aria-label="Flavours" className="mt-10 border-t hairline" onKeyDown={(e) => radioKeyNav(e, BIOZYME_FLAVOURS.map((x) => x.id), id, setId)}>
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

        <div className="relative aspect-square lg:col-span-7">
          <Stage3D
            load={loadSwirl}
            sceneProps={{ color: f.color, accent: f.accent ?? f.color, notes: f.notes ?? [] }}
            mobileLive
            className="absolute inset-0"
            label={`A swirl of ${f.name} powder with its ingredients (${(f.notes ?? []).join(', ')}) floating around it.`}
            fallback={
              <div className="relative grid size-full place-items-center">
                <div aria-hidden className="absolute size-[70%] rounded-full blur-3xl transition-[background] duration-700" style={{ background: `radial-gradient(circle, ${f.color}, ${f.accent ?? f.color}00 70%)` }} />
                <div className="relative w-[42%]">
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
