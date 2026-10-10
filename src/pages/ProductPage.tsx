import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, ShieldCheck, FileText, RotateCcw, ZoomIn, ZoomOut, RotateCw, Hand, Plus } from 'lucide-react';
import { getProduct, getProductBySlug } from '@/data/products';
import { getCategory } from '@/data/categories';
import { PRODUCT_FAQS } from '@/data/faqs';
import { SEO } from '@/data/seo';
import { SITE, CERTIFIERS } from '@/data/site';
import { useSeo } from '@/hooks/useSeo';
import { useAddToCart } from '@/hooks/useAddToCart';
import { isOutOfStock } from '@/mocks/merchandising';
import { Stage3D } from '@/components/3d/Stage3D';
import { loadScoop, loadTubViewer } from '@/components/3d/loaders';
import type { Macro } from '@/components/3d/scenes/ScoopScene';
import { ProductArt } from '@/components/product/ProductArt';
import { FlavourSelector } from '@/components/product/FlavourSelector';
import { SizeSelector } from '@/components/product/SizeSelector';
import { HowToUse3D } from '@/components/product/HowToUse3D';
import { NutritionBox } from '@/components/product/box/NutritionBox';
import { ReviewsBlock } from '@/components/product/ReviewsBlock';
import { ProductCard } from '@/components/product/ProductCard';
import { QuantityStepper } from '@/components/ecommerce/QuantityStepper';
import { PincodeChecker } from '@/components/ecommerce/PincodeChecker';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { Button } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Accordion';
import { cx } from '@/lib/format';
import { hasWebGL } from '@/lib/webgl';
import type { Product } from '@/data/types';
import NotFoundPage from './NotFoundPage';

// Positions are in wrap-label artwork pixels (see components/3d/real/labelArt.ts)
const VIEWER_HOTSPOTS = [
  { id: 'clinical', label: '50% higher protein absorption', detail: 'Clinically tested on Indian bodies; study registered with CTRI.', cx: 2378, cy: 560 },
  { id: 'nutrition', label: 'Nutrition facts', detail: '25 g protein, 11.75 g EAAs and 5.51 g BCAAs per scoop. Full panel below.', cx: 3368, cy: 400 },
  { id: 'code', label: 'Authenticity code', detail: 'Scratch the sticker, enter the code, know it’s genuine.', cx: 400, cy: 585 },
  { id: 'qr', label: 'Batch lab report', detail: 'Enter the batch number to see this batch’s third-party test results.', cx: 805, cy: 565 },
];

const WHY = [
  { id: 'eaf', title: 'Enhanced Absorption Formula', body: 'Clinically shown to deliver 50% higher protein absorption and 60% higher BCAA absorption than regular whey.', pos: [0, 0.9, 0] as [number, number, number] },
  { id: 'indian', title: 'Tested on Indian bodies', body: 'Developed and trialled for Indian diets and digestion.', pos: [-1.1, 0.4, 0.6] as [number, number, number] },
  { id: 'imported', title: 'Imported whey concentrate', body: 'International-quality protein in every scoop.', pos: [1.1, 0.45, 0.5] as [number, number, number] },
  { id: 'certified', title: 'Third-party certified', body: `Tested by ${CERTIFIERS[0]}, ${CERTIFIERS[1]} and ${CERTIFIERS[2]} for label accuracy and purity.`, pos: [-0.6, 0.2, -0.9] as [number, number, number] },
  { id: 'stomach', title: 'Easier on the stomach', body: 'Better absorption means less of the bloating some whey causes.', pos: [0.7, 0.15, -0.9] as [number, number, number] },
];

const BIOZYME_IDS = ['biozyme-performance-whey', 'biozyme-sachets'];

function Viewer({ product, flavourId, sizeLabel, flavourColor, flavourName }: { product: Product; flavourId: string | null; sizeLabel: string; flavourColor: string; flavourName: string }) {
  const [focus, setFocus] = useState<string | null>(null);
  const [zoomStep, setZoom] = useState<{ n: number; dir: 1 | -1 }>({ n: 0, dir: 1 });
  const [rotateStep, setRotate] = useState<{ n: number; dir: 1 | -1 }>({ n: 0, dir: 1 });
  // Every pack type now has a realistic 3D model
  const isTub = true;
  const [webgl, setWebgl] = useState(false);
  useEffect(() => setWebgl(hasWebGL()), []);
  const hotspots = product.id === 'biozyme-performance-whey' ? VIEWER_HOTSPOTS : [];
  const fallback = (
    <div className="grid size-full place-items-center p-[12%]">
      <div className="aspect-[200/260] h-full max-w-full">
        <ProductArt art={product.art} band={flavourColor} protein={product.nutrition.protein} title={`${product.name}, ${flavourName}`} />
      </div>
    </div>
  );
  const active = hotspots.find((h) => h.id === focus);

  return (
    <div className="relative">
      <div className="relative aspect-square overflow-hidden rounded-md bg-[radial-gradient(70%_60%_at_50%_45%,#24151a,#111113_70%)] md:aspect-[4/5] lg:aspect-square">
        {isTub ? (
          <Stage3D
            load={loadTubViewer}
            sceneProps={{ productId: product.id, flavourId, sizeLabel, model3d: product.model3d, hotspots, focus, onFocus: setFocus, zoomStep, rotateStep }}
            mobileLive
            allowReducedMotion
            className="absolute inset-0"
            label={`Interactive 3D view of ${product.name} in ${flavourName}. Drag to rotate, pinch or use the buttons to zoom. Hotspots are listed below the viewer.`}
            fallback={fallback}
          />
        ) : (
          fallback
        )}
        {isTub && webgl && (
          <>
            <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
              <button onClick={() => setZoom((z) => ({ n: z.n + 1, dir: 1 }))} className="grid size-10 place-items-center rounded-full border hairline bg-ink-950/70 backdrop-blur hover:border-white/50" aria-label="Zoom in">
                <ZoomIn className="size-4" />
              </button>
              <button onClick={() => setZoom((z) => ({ n: z.n + 1, dir: -1 }))} className="grid size-10 place-items-center rounded-full border hairline bg-ink-950/70 backdrop-blur hover:border-white/50" aria-label="Zoom out">
                <ZoomOut className="size-4" />
              </button>
              <button onClick={() => setRotate((r) => ({ n: r.n + 1, dir: 1 }))} className="grid size-10 place-items-center rounded-full border hairline bg-ink-950/70 backdrop-blur hover:border-white/50" aria-label="Rotate tub">
                <RotateCw className="size-4" />
              </button>
            </div>
            <p className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-bone-400">
              <Hand className="size-3.5" aria-hidden /> Drag · Pinch · Tap a hotspot
            </p>
          </>
        )}
        {active && (
          <div className="absolute inset-x-3 bottom-10 z-10 animate-rise rounded-sm border border-proof-400/40 bg-ink-950/85 p-4 backdrop-blur md:inset-x-auto md:left-3 md:max-w-xs">
            <p className="text-sm font-semibold text-proof-300">{active.label}</p>
            <p className="mt-1 text-sm text-bone-300">{active.detail}</p>
          </div>
        )}
      </div>
      {hotspots.length > 0 && (
        <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Product hotspots">
          {hotspots.map((h, i) => (
            <li key={h.id}>
              <button onClick={() => setFocus(focus === h.id ? null : h.id)} aria-pressed={focus === h.id} className={cx('flex h-full w-full items-start gap-2 rounded-sm border p-3 text-left text-xs transition-colors', focus === h.id ? 'border-proof-400 text-bone-100' : 'hairline text-bone-400 hover:text-bone-100')}>
                <span className={cx('grid size-5 shrink-0 place-items-center rounded-full font-mono text-[10px]', focus === h.id ? 'bg-proof-400 text-ink-950' : 'border border-white/30')}>{i + 1}</span>
                {h.label}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/**
 * WHY BIOZYME + NUTRITION — one section, one 3D scoop.
 * The Why list (Biozyme only) shows numbered hotspots on the scoop; the macro tiles
 * light up each nutrient's share of the scoop's protein. Picking one clears the other
 * so the scoop always tells one story at a time.
 */
function ScoopStory({ product, powder, showWhy }: { product: Product; powder: string; showWhy: boolean }) {
  const n = product.nutrition;
  const [macro, setMacro] = useState<Macro>(showWhy ? null : 'protein');
  const [focus, setFocus] = useState<string | null>(showWhy ? WHY[0].id : null);
  const pickWhy = (id: string) => {
    setFocus(id);
    setMacro(null);
  };
  const pickMacro = (m: Exclude<Macro, null>) => {
    setMacro(m);
    setFocus(null);
  };
  const rows: { id: Exclude<Macro, null>; label: string; value: string; sub?: string; dot: string }[] = [
    { id: 'protein', label: 'Protein', value: `${n.protein} g`, dot: 'bg-blaze-500' },
    { id: 'eaas', label: 'EAAs', value: `${n.eaas} g`, sub: 'of the protein', dot: 'bg-amber-signal' },
    { id: 'bcaas', label: 'BCAAs', value: `${n.bcaas} g`, sub: 'of the EAAs', dot: 'bg-proof-500' },
    { id: 'calories', label: 'Calories', value: `~${n.calories} kcal`, dot: 'bg-bone-100' },
  ];
  const hasAminos = n.eaas != null && n.bcaas != null;
  const shownRows = hasAminos ? rows : rows.filter((r) => r.id === 'protein' || r.id === 'calories');

  return (
    <section aria-labelledby="scoop-title" className="border-t hairline bg-ink-950 py-20 md:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <p className="eyebrow text-bone-400">{showWhy ? 'Why Biozyme · Nutrition' : 'Nutrition'}</p>
          <h2 id="scoop-title" className="display mt-4 text-display-md">
            {showWhy ? 'What’s in Every Scoop' : 'Nutrition'}
          </h2>

          {showWhy && (
            <ol className="mt-8 border-t hairline" aria-label="Why Biozyme">
              {WHY.map((w, i) => (
                <li key={w.id} className="border-b hairline">
                  <button onClick={() => pickWhy(w.id)} aria-expanded={focus === w.id} className="flex w-full gap-4 py-4 text-left">
                    <span className={cx('grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs transition-colors', focus === w.id ? 'bg-proof-400 text-ink-950' : 'border border-white/25')}>{i + 1}</span>
                    <span>
                      <span className="block font-semibold">{w.title}</span>
                      {focus === w.id && <span className="mt-1 block animate-rise text-sm leading-relaxed text-bone-300">{w.body}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[radial-gradient(70%_60%_at_50%_45%,#1c1418,#0b0b0c_70%)]">
            <Stage3D
              load={loadScoop}
              sceneProps={{
                powder,
                macro,
                eaaShare: (n.eaas ?? 0) / (n.protein ?? 1),
                bcaaShare: (n.bcaas ?? 0) / (n.protein ?? 1),
                hotspots: showWhy && !macro ? WHY.map(({ id, pos }) => ({ id, pos })) : [],
                focus,
                onFocus: pickWhy,
              }}
              className="absolute inset-0"
              label={showWhy ? 'Scoop of Biozyme powder. Numbered hotspots match the Why Biozyme list; the nutrition tiles highlight each nutrient’s share of the scoop. Values are in the table.' : `Scoop of powder. The highlighted particles show ${macro ?? 'protein'} as a share of the scoop's protein. Values are in the table.`}
              fallback={<ScoopFallback powder={powder} macro={macro ?? undefined} />}
            />
            <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-wider text-bone-400">
              {showWhy ? 'Tap a reason or a nutrient · illustrative' : 'Tap a nutrient to highlight it · illustrative'}
            </p>
          </div>

          {/* Nutrition per serving — a table, laid out as tiles that drive the scoop */}
          <table className="mt-4 w-full border-collapse">
            <caption className="sr-only">Nutrition per serving (approx.)</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Nutrient</th>
                <th scope="col">Per serving</th>
              </tr>
            </thead>
            <tbody className={cx('grid gap-2', shownRows.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2')}>
              {shownRows.map((r) => (
                <tr key={r.id} className="contents">
                  <th scope="row" className="p-0 font-normal">
                    <button
                      onClick={() => pickMacro(r.id)}
                      aria-pressed={macro === r.id}
                      className={cx('flex h-full w-full flex-col items-start rounded-sm border p-4 text-left transition-colors', macro === r.id ? 'border-white/60 bg-white/[0.06]' : 'hairline hover:border-white/40')}
                    >
                      <span className="flex items-center gap-2 text-sm text-bone-300">
                        <span className={cx('size-2.5 rounded-full', macro === r.id ? r.dot : 'bg-white/20')} aria-hidden />
                        {r.label}
                      </span>
                      <span className="mt-2 font-mono text-xl text-bone-100 md:text-2xl">{r.value}</span>
                      {r.sub && <span className="mt-0.5 text-xs text-bone-500">{r.sub}</span>}
                    </button>
                  </th>
                  <td className="sr-only">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-bone-400">
            Per serving (approx.). Full values by flavour:{' '}
            <a href="#label-title" className="font-semibold text-bone-100 underline underline-offset-4">
              read the label ↓
            </a>
          </p>
          <p className="mt-1 text-xs text-bone-500">{n.sourced ? 'Figures from public listings; confirm against the current label before launch.' : 'Mock figures for this concept build; replace with the current label values before launch.'}</p>
        </div>
      </div>
    </section>
  );
}

function ScoopFallback({ powder, macro }: { powder: string; macro?: Macro }) {
  const lit = macro === 'protein' ? 1 : macro === 'eaas' ? 11.75 / 25 : macro === 'bcaas' ? 5.51 / 25 : macro === 'calories' ? 1 : 0;
  const color = macro === 'eaas' ? '#ffb547' : macro === 'bcaas' ? '#46e891' : macro === 'calories' ? '#f2efe9' : '#ff4a50';
  const dots = useMemo(() => Array.from({ length: 160 }).map((_, i) => {
    const r = Math.sqrt(((i * 7919) % 160) / 160) * 70;
    const a = i * 2.39996;
    return { x: 120 + Math.cos(a) * r, y: 120 - Math.abs(Math.sin(a)) * r * 0.5, rank: ((i * 104729) % 160) / 160 };
  }), []);
  return (
    <svg viewBox="0 0 240 200" className="size-full" aria-hidden>
      <path d="M40 120 Q120 200 200 120 Z" fill="#1c1c1f" />
      <rect x="198" y="112" width="40" height="7" rx="3" fill="#1c1c1f" transform="rotate(8 198 112)" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={2.6} fill={d.rank < lit ? color : powder} style={{ transition: 'fill .4s' }} />
      ))}
    </svg>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const [sp] = useSearchParams();
  const product = slug ? getProductBySlug(slug) : undefined;
  const [flavourId, setFlavourId] = useState<string | null>(null);
  const [sizeId, setSizeId] = useState<string>('');
  const [qty, setQty] = useState(1);
  const addToCart = useAddToCart();

  useEffect(() => {
    if (!product) return;
    const q = sp.get('flavour');
    setFlavourId(product.flavours.find((f) => f.id === q)?.id ?? product.flavours[0]?.id ?? null);
    setSizeId(product.sizes[0]?.id ?? 'std');
    setQty(1);
  }, [product, sp]);

  const isPerformance = product?.id === 'biozyme-performance-whey';
  useSeo(
    !product
      ? { ...SEO.notFound, noindex: true }
      : isPerformance
      ? SEO.biozymePerformance
      : { title: product ? `${product.shortName}, MuscleBlaze`.slice(0, 59) : SEO.notFound.title, description: product?.oneLiner ?? `${product?.name ?? 'MuscleBlaze'}. Authenticity code on every tub. Lab report for every batch.` },
  );

  // Structured data — only facts we have (no price/rating until real data is connected)
  useEffect(() => {
    if (!product) return;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: product.name, brand: { '@type': 'Brand', name: 'MuscleBlaze' }, description: product.oneLiner ?? undefined, category: getCategory(product.category)?.name });
    document.head.appendChild(el);
    return () => el.remove();
  }, [product]);

  if (!product) return <NotFoundPage />;

  const flavour = product.flavours.find((f) => f.id === flavourId) ?? product.flavours[0];
  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0];
  const flavourColor = flavour && flavour.family !== 'tbc' ? flavour.color : '#e8202a';
  const oos = isOutOfStock(product.id, flavour?.id);
  const category = getCategory(product.category);
  const isBiozyme = BIOZYME_IDS.includes(product.id);
  const n = product.nutrition;
  // Full protein macros → nutrition panel + label box. Sourced for Biozyme; MOCK for other SKUs.
  const hasMacros = n.protein != null && n.eaas != null && n.bcaas != null && n.calories != null;
  const specChips = hasMacros
    ? [`${n.protein} g Protein`, `${n.eaas} g EAAs`, `${n.bcaas} g BCAAs`]
    : n.protein != null
    ? [`${n.protein} g Protein`, ...(n.calories != null ? [`${n.calories} kcal`] : [])]
    : product.keySpecs ?? [];
  const specPer = n.protein != null ? n.servingLabel ?? 'scoop' : null;
  const fbt = (product.frequentlyBoughtWith ?? []).map(getProduct).filter(Boolean) as Product[];

  const buy = (goToCheckout: boolean, from?: Element | null) =>
    addToCart({ productId: product.id, flavourId: flavour?.id ?? null, sizeId: size.id, qty, from, goToCheckout });

  return (
    <div className="bg-ink-950">
      <div className="container-x pt-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-bone-400">
          <Link to="/" className="hover:text-white">Home</Link>
          <ChevronRight className="size-3" aria-hidden />
          <Link to="/shop" className="hover:text-white">Shop</Link>
          {category && (
            <>
              <ChevronRight className="size-3" aria-hidden />
              <Link to={`/shop/${category.id}`} className="hover:text-white">{category.name}</Link>
            </>
          )}
        </nav>
      </div>

      {/* Above the fold */}
      <section className="container-x grid gap-10 pb-16 pt-6 lg:grid-cols-12 lg:gap-14 [--ring-bg:#0a0a0b]">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:col-span-7 lg:self-start">
          <Viewer product={product} flavourId={flavour?.id ?? null} sizeLabel={size.label} flavourColor={flavourColor} flavourName={flavour?.name ?? ''} />
        </div>

        <div className="lg:col-span-5">
          {product.isClinicallyTested && <p className="eyebrow text-proof-400">India’s first clinically tested whey</p>}
          <h1 className="display-tight mt-3 text-[clamp(1.9rem,1.2rem+2.2vw,3rem)] leading-[1.02]">{product.name}</h1>
          {product.oneLiner && <p className="mt-3 text-lede text-bone-300">{product.oneLiner}</p>}
          <a href="#reviews" className="mt-4 inline-block rounded-xs underline-offset-4 hover:underline" aria-label={`${product.rating.toFixed(1)} out of 5, ${product.reviewCount.toLocaleString('en-IN')} verified reviews. Go to reviews`}>
            <Rating rating={product.rating} count={product.reviewCount} />
          </a>

          {specChips.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={specPer ? `Key specs per ${specPer}` : 'Key specs'}>
              {specChips.map((c) => (
                <li key={c} className="rounded-sm border hairline px-3 py-2 font-mono text-sm">
                  {c}
                </li>
              ))}
              {specPer && <li className="self-center pl-1 text-xs text-bone-400">per {specPer}</li>}
            </ul>
          )}

          <div className="mt-8 space-y-6 border-t hairline pt-8">
            <FlavourSelector productId={product.id} flavours={product.flavours} value={flavour?.id ?? null} onChange={setFlavourId} />
            <SizeSelector sizes={product.sizes} value={size.id} onChange={setSizeId} />
          </div>

          <div className="mt-8 border-t hairline pt-8">
            <Price productId={product.id} sizeId={size.id} servings={size.servings} size="lg" showPerServing />
            <p className="mt-1 text-xs text-bone-400">Inclusive of all taxes</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QuantityStepper value={qty} onChange={setQty} />
            <Button size="lg" className="flex-1" onClick={(e) => buy(false, e.currentTarget)} icon={<Plus className="size-4" />}>
              {oos ? 'Notify me' : 'Add to Cart'}
            </Button>
            <Button size="lg" variant="inverse" className="flex-1" onClick={() => buy(true)} disabled={oos}>
              Buy Now
            </Button>
          </div>
          {oos && <p className="mt-3 text-sm text-amber-signal">Sold out in this flavour. Notify me when it’s back.</p>}

          <ul className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-sm border hairline bg-white/10 text-center text-xs">
            {[
              { Icon: ShieldCheck, t: 'Authenticity code on every tub', to: '/authenticity' },
              { Icon: FileText, t: 'Lab report for every batch', to: '/authenticity#lab-report' },
              { Icon: RotateCcw, t: 'Easy returns', to: '/policies/returns' },
            ].map(({ Icon, t, to }) => (
              <li key={t} className="bg-ink-950">
                <Link to={to} className="flex h-full flex-col items-center gap-2 p-4 hover:bg-white/[0.03]">
                  <Icon className="size-5 text-proof-400" aria-hidden />
                  {t}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <PincodeChecker />
          </div>

          {product.whoItsFor && (
            <p className="mt-8 text-sm leading-relaxed text-bone-300">
              <span className="font-semibold text-bone-100">Who it’s for: </span>
              {product.whoItsFor}
            </p>
          )}
        </div>
      </section>

      {hasMacros && <ScoopStory product={product} powder={flavourColor} showWhy={isBiozyme} />}
      {hasMacros && <NutritionBox product={product} flavourName={flavour?.name ?? ''} flavourColor={flavourColor} sizeLabel={size.label} servings={size.servings} />}

      <ReviewsBlock product={product} flavourId={product.flavours.length > 1 ? flavour?.id ?? null : null} flavourName={flavour?.family !== 'tbc' ? flavour?.name : undefined} />

      {isBiozyme && (
        <section aria-labelledby="howto-title" className="border-t hairline py-20 md:py-28">
          <div className="container-x">
            <h2 id="howto-title" className="display text-display-md">
              How to Use
            </h2>
            <div className="mt-12">
              <HowToUse3D productId={product.id === 'biozyme-sachets' ? 'biozyme-performance-whey' : product.id} flavourId={flavour?.id ?? null} powder={flavourColor} />
            </div>
            <p className="mt-10 max-w-2xl border-l-2 border-amber-signal pl-4 text-sm leading-relaxed text-bone-300">{SITE.usageNote}</p>
          </div>
        </section>
      )}

      {fbt.length > 0 && (
        <section aria-labelledby="fbt-title" className="surface-bone py-20 md:py-24">
          <div className="container-x">
            <h2 id="fbt-title" className="display text-display-sm">
              Frequently Bought Together
            </h2>
            <ul className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {fbt.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} tone="light" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {isBiozyme && (
        <section aria-labelledby="faq-title" className="border-t hairline py-20 md:py-28">
          <div className="container-x grid gap-10 lg:grid-cols-12">
            <h2 id="faq-title" className="display text-display-md lg:col-span-4">
              FAQs
            </h2>
            <div className="lg:col-span-8">
              <Accordion
                items={PRODUCT_FAQS.map((f, i) => ({
                  id: `faq-${i}`,
                  title: f.q,
                  content: (
                    <>
                      {f.a}
                      {f.link && (
                        <>
                          {' '}
                          <Link to={f.link.to} className="font-semibold text-bone-100 underline underline-offset-4">
                            {f.link.label} →
                          </Link>
                        </>
                      )}
                    </>
                  ),
                }))}
              />
            </div>
          </div>
        </section>
      )}

      {/* Mobile sticky buy bar — product, price, CTA always in reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t hairline bg-ink-900/95 p-3 backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{product.shortName}</p>
          <Price productId={product.id} sizeId={size.id} size="sm" showMrp={false} />
        </div>
        <Button onClick={(e) => buy(false, e.currentTarget)} disabled={false}>
          {oos ? 'Notify me' : 'Add to Cart'}
        </Button>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
    </div>
  );
}
