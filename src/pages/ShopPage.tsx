import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronRight, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { CATEGORIES, getCategory } from '@/data/categories';
import { SEO } from '@/data/seo';
import { useSeo } from '@/hooks/useSeo';
import { applyFilters, activeCount, FILTERS, parseFilters, PRICE_BOUNDS, SORTS, toSearch, type FilterState, type MultiKey } from '@/lib/catalogue';
import { ProductCard } from '@/components/product/ProductCard';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { formatINR, cx } from '@/lib/format';
import { MockTag } from '@/components/ui/Placeholder';
import NotFoundPage from './NotFoundPage';

const GROUPS: { key: MultiKey; title: string }[] = [
  { key: 'goal', title: 'Goal' },
  { key: 'type', title: 'Protein type' },
  { key: 'protein', title: 'Protein per serving' },
  { key: 'flavour', title: 'Flavour' },
  { key: 'pack', title: 'Pack size' },
];

function FilterPanel({ f, set, counts }: { f: FilterState; set: (n: FilterState) => void; counts: (key: MultiKey, v: string) => number }) {
  const toggle = (key: MultiKey, v: string) => {
    const cur = f[key] as string[];
    set({ ...f, [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };
  return (
    <div className="space-y-8">
      {GROUPS.map((g) => (
        <fieldset key={g.key}>
          <legend className="eyebrow mb-3 text-bone-400">{g.title}</legend>
          <div className="flex flex-wrap gap-2">
            {FILTERS[g.key].map((o) => {
              const on = (f[g.key] as string[]).includes(o.v);
              const n = counts(g.key, o.v);
              return (
                <label key={o.v} className={cx('relative inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-proof-400', on ? 'border-bone-100 bg-bone-100 font-semibold text-ink-950' : 'border-white/15 hover:border-white/50', n === 0 && !on && 'opacity-40')}>
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(g.key, o.v)} />
                  {o.label}
                  <span className={cx('font-mono text-[10px]', on ? 'text-ink-600' : 'text-bone-400')}>{n}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <fieldset>
        <legend className="eyebrow mb-3 flex items-center gap-2 text-bone-400">
          Price <MockTag>Demo prices</MockTag>
        </legend>
        <label htmlFor="price-max" className="flex items-center justify-between text-sm">
          <span>Up to</span>
          <span className="font-mono">{formatINR(f.priceMax ?? PRICE_BOUNDS.max)}</span>
        </label>
        <input
          id="price-max"
          type="range"
          min={PRICE_BOUNDS.min}
          max={PRICE_BOUNDS.max}
          step={100}
          value={f.priceMax ?? PRICE_BOUNDS.max}
          onChange={(e) => {
            const v = Number(e.target.value);
            set({ ...f, priceMax: v >= PRICE_BOUNDS.max ? null : v });
          }}
          className="mt-3 w-full accent-blaze-500"
        />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="eyebrow mb-3 text-bone-400">More</legend>
        <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 text-sm opacity-50" title="Available when reviews data is connected">
          <span>
            Rating 4★ and above
            <span className="block text-xs text-bone-400">Needs reviews data</span>
          </span>
          <input type="checkbox" className="size-5 accent-blaze-500" checked={f.rating4} disabled onChange={() => set({ ...f, rating4: !f.rating4 })} />
        </label>
        <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 text-sm">
          In stock only
          <input type="checkbox" className="size-5 accent-blaze-500" checked={f.inStock} onChange={() => set({ ...f, inStock: !f.inStock })} />
        </label>
      </fieldset>
    </div>
  );
}

export default function ShopPage() {
  const { category: catId } = useParams();
  const [sp, setSp] = useSearchParams();
  const [sheet, setSheet] = useState(false);
  const category = catId ? getCategory(catId) : null;
  const f = useMemo(() => parseFilters(sp), [sp]);
  const set = (n: FilterState) => setSp(toSearch(n), { replace: true, preventScrollReset: true });

  const base = useMemo(() => (category ? PRODUCTS.filter((p) => p.category === category.id) : PRODUCTS), [category]);
  const results = useMemo(() => applyFilters(base, f), [base, f]);
  const counts = (key: MultiKey, v: string) => applyFilters(base, { ...f, [key]: [v] }).length;
  const n = activeCount(f);

  useSeo(
    catId && !category
      ? { ...SEO.notFound, noindex: true }
      : category
      ? category.seo ?? { title: `${category.name}, MuscleBlaze`, description: `${category.intro} Compare up to 3 side by side. Every batch lab tested.` }
      : SEO.shop,
  );

  if (catId && !category) return <NotFoundPage />;

  const chips = GROUPS.flatMap((g) => (f[g.key] as string[]).map((v) => ({ key: g.key, v, label: FILTERS[g.key].find((o) => o.v === v)?.label ?? v })));

  return (
    <div className="bg-ink-950">
      {/* Category header */}
      <header className="border-b hairline">
        <div className="container-x pb-10 pt-10 md:pb-14 md:pt-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-bone-400">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="size-3" aria-hidden />
            <Link to="/shop" className="hover:text-white" aria-current={!category ? 'page' : undefined}>Shop</Link>
            {category && (
              <>
                <ChevronRight className="size-3" aria-hidden />
                <span aria-current="page" className="text-bone-100">{category.name}</span>
              </>
            )}
          </nav>
          <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h1 className="display text-display-lg lg:col-span-7">{category ? category.name : 'Shop All'}</h1>
            <p className="max-w-[52ch] text-lede text-bone-300 lg:col-span-5">
              {category ? category.headerIntro ?? category.intro : 'Choose by goal, protein per scoop or flavour, and compare up to 3 side by side.'}
            </p>
          </div>
          <nav aria-label="Categories" className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <Link to={{ pathname: '/shop', search: sp.toString() }} className={cx('shrink-0 rounded-full border px-4 py-2 text-sm font-semibold', !category ? 'border-bone-100 bg-bone-100 text-ink-950' : 'border-white/15 text-bone-300 hover:border-white/50')}>
              All
            </Link>
            {CATEGORIES.filter((c) => c.inShopNav).map((c) => (
              <Link key={c.id} to={{ pathname: `/shop/${c.id}`, search: sp.toString() }} aria-current={c.id === category?.id ? 'page' : undefined} className={cx('shrink-0 rounded-full border px-4 py-2 text-sm font-semibold', c.id === category?.id ? 'border-bone-100 bg-bone-100 text-ink-950' : 'border-white/15 text-bone-300 hover:border-white/50')}>
                {c.shortName}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="container-x grid gap-10 py-10 lg:grid-cols-12">
        {/* Desktop filters */}
        <aside className="hidden lg:col-span-3 lg:block" aria-label="Filters">
          <div className="sticky top-[calc(var(--header-h)+24px)] max-h-[calc(100vh-var(--header-h)-48px)] overflow-y-auto pb-10 pr-4 no-scrollbar">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              {n > 0 && (
                <button onClick={() => set({ ...parseFilters(new URLSearchParams()), sort: f.sort })} className="text-sm text-bone-400 underline-offset-4 hover:text-white hover:underline">
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel f={f} set={set} counts={counts} />
          </div>
        </aside>

        <section className="lg:col-span-9" aria-labelledby="results-title">
          {/* Toolbar */}
          <div className="sticky top-[var(--header-h)] z-20 -mx-4 flex items-center gap-3 border-b hairline bg-ink-950/90 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <h2 id="results-title" className="mr-auto text-sm text-bone-300" aria-live="polite">
              <span className="font-semibold text-bone-100">{results.length}</span> product{results.length === 1 ? '' : 's'}
            </h2>
            <button onClick={() => setSheet(true)} className="inline-flex h-10 items-center gap-2 rounded-sm border border-white/20 px-3 text-sm font-semibold lg:hidden">
              <SlidersHorizontal className="size-4" aria-hidden /> Filters{n > 0 && <span className="grid size-5 place-items-center rounded-full bg-blaze-500 text-[10px]">{n}</span>}
            </button>
            <label className="flex items-center gap-2 text-sm">
              <span className="hidden text-bone-400 sm:inline">Sort</span>
              <select value={f.sort} onChange={(e) => set({ ...f, sort: e.target.value as FilterState['sort'] })} className="h-10 rounded-sm border border-white/20 bg-ink-900 px-3 text-sm font-semibold outline-none focus:border-proof-400">
                {SORTS.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.key + c.v}>
                  <button onClick={() => set({ ...f, [c.key]: (f[c.key] as string[]).filter((x) => x !== c.v) })} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink-800 pl-3 pr-2 text-xs font-semibold hover:bg-ink-700" aria-label={`Remove filter ${c.label}`}>
                    {c.label} <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
              {f.priceMax != null && (
                <li>
                  <button onClick={() => set({ ...f, priceMax: null })} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink-800 pl-3 pr-2 text-xs font-semibold hover:bg-ink-700">
                    Up to {formatINR(f.priceMax)} <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              )}
            </ul>
          )}

          {f.sort === 'protein-per-rupee' && <p className="mt-4 text-xs text-bone-400">Protein per ₹ uses servings per pack, which is only confirmed for some SKUs; the rest sort last.</p>}

          {results.length === 0 ? (
            <div className="mt-10 rounded-md border border-dashed border-white/15 p-10 text-center md:p-16">
              <p className="display-tight mx-auto max-w-[24ch] text-2xl md:text-3xl">No match for that combo.</p>
              <p className="mx-auto mt-3 max-w-md text-bone-300">
                Try removing a filter, or let us find one for you →{' '}
                <Link to="/#goal-finder" className="font-semibold text-bone-100 underline underline-offset-4">
                  Take the Goal Quiz
                </Link>
              </p>
              <Button className="mt-8" variant="secondary" onClick={() => set({ ...parseFilters(new URLSearchParams()), sort: f.sort })}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <ul className="mt-8 grid gap-x-5 gap-y-12 min-[480px]:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} compare />
                </li>
              ))}
            </ul>
          )}

          <aside className="mt-16 flex flex-col items-start justify-between gap-4 rounded-md border hairline p-6 md:flex-row md:items-center">
            <p className="text-bone-300">
              <span className="font-semibold text-bone-100">Still choosing?</span> Answer 3 quick questions and we’ll match you to the right protein.
            </p>
            <Link to="/#goal-finder" className="inline-flex items-center gap-2 font-semibold">
              Take the Goal Quiz <ArrowRight className="size-4" aria-hidden />
            </Link>
          </aside>
        </section>
      </div>

      <Dialog open={sheet} onClose={() => setSheet(false)} title="Filters" side="bottom">
        <div className="p-5 pb-28">
          <FilterPanel f={f} set={set} counts={counts} />
        </div>
        <div className="sticky bottom-0 flex gap-3 border-t hairline bg-ink-900 p-4">
          <Button variant="secondary" className="flex-1" onClick={() => set({ ...parseFilters(new URLSearchParams()), sort: f.sort })}>
            Clear
          </Button>
          <Button className="flex-[2]" onClick={() => setSheet(false)}>
            Show {results.length} product{results.length === 1 ? '' : 's'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
