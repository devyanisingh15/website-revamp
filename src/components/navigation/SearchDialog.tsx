import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, FileText } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { PRODUCTS } from '@/data/products';
import { CATEGORIES } from '@/data/categories';
import { ARTICLES } from '@/data/blog';
import { GOALS } from '@/data/goals';
import { ProductArt } from '../product/ProductArt';

const PAGES = [
  { label: 'Science of Biozyme', to: '/science', k: 'science absorption eaf biozyme clinical' },
  { label: 'Check Authenticity & Lab Reports', to: '/authenticity', k: 'authentic verify fake genuine code batch lab report' },
  { label: 'Track Order', to: '/track-order', k: 'track order delivery status' },
  { label: 'Help Centre', to: '/help', k: 'help faq returns' },
  { label: 'About MuscleBlaze', to: '/about', k: 'about story mission' },
];

/** Client-side search over the mock catalogue. Swap for the search API (typo tolerance, synonyms). */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!query) return null;
    const m = (s: string) => s.toLowerCase().includes(query);
    return {
      products: PRODUCTS.filter((p) => m(p.name) || m(p.category) || p.flavours.some((f) => m(f.name))).slice(0, 6),
      categories: CATEGORIES.filter((c) => c.inShopNav && m(c.name)),
      goals: GOALS.filter((g) => m(g.name) || m(g.headline)),
      articles: ARTICLES.filter((a) => m(a.title)).slice(0, 4),
      pages: PAGES.filter((p) => m(p.label) || p.k.includes(query)),
    };
  }, [query]);
  const empty = results && Object.values(results).every((r) => r.length === 0);

  return (
    <Dialog open={open} onClose={onClose} title="Search" className="top-[8vh]! translate-y-0! sm:max-w-2xl">
      <div className="p-5">
        <label className="flex h-14 items-center gap-3 rounded-sm border border-white/20 bg-ink-850 px-4 focus-within:border-proof-400">
          <Search className="size-5 text-bone-400" aria-hidden />
          <span className="sr-only">Search products, goals and articles</span>
          <input
            data-autofocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search whey, creatine, Kesar Pista…"
            className="h-full flex-1 bg-transparent text-lg outline-none placeholder:text-bone-600"
          />
        </label>

        {!results && (
          <div className="mt-6">
            <p className="eyebrow mb-3 text-bone-400">Popular</p>
            <div className="flex flex-wrap gap-2">
              {['Biozyme', 'Iso Zero', 'Creatine', 'Kesar Pista Badam', 'Mass Gainer', 'Lab report'].map((s) => (
                <button key={s} onClick={() => setQ(s)} className="rounded-full border hairline px-3 py-1.5 text-sm hover:border-white/40">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {empty && (
          <p className="mt-8 text-center text-bone-400">
            No results for “{q}”. Try “whey” or{' '}
            <Link to="/#goal-finder" onClick={onClose} className="font-semibold text-bone-100 underline">
              take the Goal Quiz
            </Link>
            .
          </p>
        )}

        {results && !empty && (
          <div className="mt-6 space-y-6" aria-live="polite">
            {results.products.length > 0 && (
              <section>
                <h3 className="eyebrow mb-2 text-bone-400">Products</h3>
                <ul>
                  {results.products.map((p) => (
                    <li key={p.id}>
                      <Link to={`/product/${p.slug}`} onClick={onClose} className="flex items-center gap-4 rounded-sm p-2 hover:bg-white/5">
                        <span className="w-10 shrink-0">
                          <ProductArt art={p.art} band={p.flavours[0]?.color} shadow={false} />
                        </span>
                        <span className="flex-1 text-[15px] font-medium">{p.name}</span>
                        <ArrowRight className="size-4 opacity-40" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {[...results.categories.map((c) => ({ label: c.name, to: `/shop/${c.id}`, kind: 'Category' })), ...results.goals.map((g) => ({ label: g.name, to: `/goals/${g.id}`, kind: 'Goal' })), ...results.pages.map((p) => ({ ...p, kind: 'Page' })), ...results.articles.map((a) => ({ label: a.title, to: `/fit-hub/${a.slug}`, kind: 'Fit Hub' }))].length > 0 && (
              <section>
                <h3 className="eyebrow mb-2 text-bone-400">Pages & articles</h3>
                <ul>
                  {[
                    ...results.categories.map((c) => ({ label: c.name, to: `/shop/${c.id}`, kind: 'Category' })),
                    ...results.goals.map((g) => ({ label: g.name, to: `/goals/${g.id}`, kind: 'Goal' })),
                    ...results.pages.map((p) => ({ label: p.label, to: p.to, kind: 'Page' })),
                    ...results.articles.map((a) => ({ label: a.title, to: `/fit-hub/${a.slug}`, kind: 'Fit Hub' })),
                  ].map((r) => (
                    <li key={r.to}>
                      <Link to={r.to} onClick={onClose} className="flex items-center gap-3 rounded-sm p-3 hover:bg-white/5">
                        <FileText className="size-4 text-bone-400" aria-hidden />
                        <span className="flex-1">{r.label}</span>
                        <span className="font-mono text-[10px] uppercase text-bone-400">{r.kind}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}
