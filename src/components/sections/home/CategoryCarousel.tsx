import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Stage3D, useCan3D } from '@/components/3d/Stage3D';
import { loadCarousel } from '@/components/3d/loaders';
import { CATEGORIES, HOME_CATEGORY_IDS } from '@/data/categories';
import { productsInCategory } from '@/data/products';
import { ProductArt } from '@/components/product/ProductArt';
import { cx } from '@/lib/format';

const CATS = HOME_CATEGORY_IDS.map((id) => CATEGORIES.find((c) => c.id === id)!);
const ITEMS = CATS.map((c) => ({ id: c.id, label: c.shortName.toUpperCase().replace(' & ', ' + '), body: c.tub, band: '#e8202a' }));

/**
 * "Pick Your Fuel" — 3D ring of tubs on capable desktops; an accessible
 * swipeable rail everywhere. Both are driven by the same index, and the
 * DOM controls (arrows, keyboard, swipe, tabs) are always present.
 */
export function CategoryCarousel() {
  const [index, setIndex] = useState(0);
  const live = useCan3D(false);
  const rail = useRef<HTMLUListElement>(null);
  const n = CATS.length;
  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);
  const active = CATS[index];
  const sample = productsInCategory(active.id)[0];

  // Keep the rail scrolled to the active card (mobile / flat layout)
  // (horizontal scroll only — never move the page vertically)
  useEffect(() => {
    const r = rail.current;
    const el = r?.children[index] as HTMLElement | undefined;
    if (!r || !el || live) return;
    const left = el.offsetLeft + el.offsetWidth / 2 - r.clientWidth / 2;
    if (Math.abs(r.scrollLeft - left) > 4) r.scrollTo({ left, behavior: 'smooth' });
  }, [index, live]);

  // Sync index from manual swipe on the rail
  const onScroll = () => {
    const r = rail.current;
    if (!r || live) return;
    const mid = r.scrollLeft + r.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    Array.from(r.children).forEach((c, i) => {
      const el = c as HTMLElement;
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    if (best !== index) setIndex(best);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(index - 1);
    }
  };

  return (
    <section aria-labelledby="cats-title" aria-roledescription="carousel" className="relative overflow-hidden bg-ink-950 py-24 md:py-32" onKeyDown={onKey}>
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow flex items-center gap-3 text-bone-400">
              <span className="text-blaze-500">04</span>
              <span className="h-px w-8 bg-current opacity-40" aria-hidden />
              The range
            </p>
            <h2 id="cats-title" className="display mt-5 text-display-lg">
              Pick Your Fuel
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => go(index - 1)} className="grid size-12 place-items-center rounded-full border hairline transition-colors hover:border-white/60" aria-label="Previous category">
              <ArrowLeft className="size-5" />
            </button>
            <button onClick={() => go(index + 1)} className="grid size-12 place-items-center rounded-full border hairline transition-colors hover:border-white/60" aria-label="Next category">
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div role="tablist" aria-label="Categories" className="no-scrollbar -mx-4 mt-10 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {CATS.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              id={`cat-tab-${c.id}`}
              aria-selected={i === index}
              aria-controls="cat-panel"
              tabIndex={i === index ? 0 : -1}
              onClick={() => go(i)}
              className={cx('shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors', i === index ? 'bg-bone-100 text-ink-950' : 'text-bone-400 hover:text-bone-100')}
            >
              {c.shortName}
            </button>
          ))}
        </div>

        <div className="mt-6 grid items-center gap-8 lg:grid-cols-12">
          {live ? (
            <div className="relative h-[460px] lg:col-span-8 lg:h-[540px]">
              <Stage3D
                load={loadCarousel}
                sceneProps={{ items: ITEMS, index, onSelect: go }}
                className="absolute inset-0"
                label={`3D ring of product tubs, one per category. ${active.name} is in front. Use the arrows or category tabs to rotate.`}
                fallback={
                  <div className="grid size-full place-items-center">
                    <div className="w-56">
                      <ProductArt art={sample?.art ?? { shape: 'tub', body: active.tub, label: active.shortName.toUpperCase() }} band="#e8202a" />
                    </div>
                  </div>
                }
              />
            </div>
          ) : (
            <ul ref={rail} onScroll={onScroll} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[18vw] lg:col-span-8" aria-label="Categories, swipe to browse">
              {CATS.map((c, i) => {
                const p = productsInCategory(c.id)[0];
                return (
                  <li key={c.id} className="w-[64vw] max-w-[300px] shrink-0 snap-center">
                    <button onClick={() => go(i)} className={cx('block w-full rounded-md bg-ink-900 p-8 transition-all duration-500', i === index ? 'scale-100 opacity-100' : 'scale-90 opacity-40')} aria-label={c.name} tabIndex={-1}>
                      <ProductArt art={p?.art ?? { shape: 'tub', body: c.tub, label: c.shortName.toUpperCase() }} band="#e8202a" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div id="cat-panel" role="tabpanel" aria-labelledby={`cat-tab-${active.id}`} aria-live="polite" className="lg:col-span-4">
            <p className="font-mono text-sm text-blaze-500">
              {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </p>
            <h3 className="display-tight mt-3 text-4xl">{active.name}</h3>
            <p className="mt-3 max-w-[36ch] text-lede text-bone-300">{active.intro}</p>
            <p className="mt-2 text-sm text-bone-400">
              {productsInCategory(active.id).length} product{productsInCategory(active.id).length === 1 ? '' : 's'} in this demo catalogue
            </p>
            <Link to={`/shop/${active.id}`} className="group mt-8 inline-flex h-12 items-center gap-2 rounded-sm bg-bone-100 px-5 font-semibold text-ink-950 transition-colors hover:bg-white">
              Shop {active.shortName} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
