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

function WhyBiozyme({ powder }: { powder: string }) {
  const [focus, setFocus] = useState(WHY[0].id);
  return (
    <section aria-labelledby="why-title" className="border-t hairline bg-ink-950 py-20 md:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <h2 id="why-title" className="display text-display-md">
            Why Biozyme
          </h2>
          <ol className="mt-8 border-t hairline">
            {WHY.map((w, i) => (
              <li key={w.id} className="border-b hairline">
                <button onClick={() => setFocus(w.id)} aria-expanded={focus === w.id} className="flex w-full gap-4 py-4 text-left">
                  <span className={cx('grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs transition-colors', focus === w.id ? 'bg-proof-400 text-ink-950' : 'border border-white/25')}>{i + 1}</span>
                  <span>
                    <span className="block font-semibold">{w.title}</span>
                    {focus === w.id && <span className="mt-1 block animate-rise text-sm leading-relaxed text-bone-300">{w.body}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative aspect-square lg:col-span-7">
          <Stage3D
            load={loadScoop}
            sceneProps={{ powder, macro: null as Macro, eaaShare: 11.75 / 25, bcaaShare: 5.51 / 25, hotspots: WHY.map(({ id, pos }) => ({ id, pos })), focus, onFocus: setFocus }}
            className="absolute inset-0"
            label="3D scoop of Biozyme powder with five numbered hotspots matching the Why Biozyme list."
            fallback={<ScoopFallback powder={powder} />}
          />
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

function NutritionPanel({ product, powder }: { product: Product; powder: string }) {
  const [macro, setMacro] = useState<Macro>('protein');
  const n = product.nutrition;
  const rows: { id: Exclude<Macro, null>; label: string; value: string; sub?: string }[] = [
    { id: 'protein', label: 'Protein', value: `${n.protein} g` },
    { id: 'eaas', label: 'EAAs', value: `${n.eaas} g`, sub: 'Share of the protein' },
    { id: 'bcaas', label: 'BCAAs', value: `${n.bcaas} g`, sub: 'Share of the EAAs' },
    { id: 'calories', label: 'Calories', value: `~${n.calories} kcal` },
  ];
  return (
    <section aria-labelledby="nutrition-title" className="surface-bone py-20 md:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="relative order-2 aspect-square rounded-md bg-ink-950 lg:order-1 lg:col-span-6">
          <Stage3D
            load={loadScoop}
            sceneProps={{ powder, macro, eaaShare: (n.eaas ?? 0) / (n.protein ?? 1), bcaaShare: (n.bcaas ?? 0) / (n.protein ?? 1) }}
            className="absolute inset-0"
            label={`Scoop of powder. The highlighted particles show ${macro ?? 'nothing'} as a share of the scoop's protein. The values are in the table.`}
            fallback={<ScoopFallback powder={powder} macro={macro} />}
          />
          <p className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-wider text-bone-400">Tap a macro to highlight it · illustrative</p>
        </div>
        <div className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8">
          <h2 id="nutrition-title" className="display text-display-md">
            Nutrition
          </h2>
          <table className="mt-8 w-full border-collapse text-left">
            <caption className="sr-only">Nutrition per serving (approx.)</caption>
            <thead>
              <tr className="border-b hairline-dark text-xs text-ink-600">
                <th scope="col" className="pb-3 font-normal">Per serving (approx.)</th>
                <th scope="col" className="pb-3 text-right font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b hairline-dark">
                  <th scope="row" className="p-0 font-normal">
                    <button onClick={() => setMacro(r.id)} aria-pressed={macro === r.id} className={cx('flex w-full items-center gap-3 py-4 text-left text-lg transition-colors', macro === r.id ? 'font-bold text-ink-950' : 'text-ink-700 hover:text-ink-950')}>
                      <span className={cx('size-3 rounded-full transition-colors', macro === r.id ? (r.id === 'protein' ? 'bg-blaze-500' : r.id === 'eaas' ? 'bg-amber-signal' : r.id === 'bcaas' ? 'bg-proof-500' : 'bg-ink-950') : 'bg-ink-950/15')} aria-hidden />
                      {r.label}
                      {r.sub && <span className="text-xs font-normal text-ink-500">{r.sub}</span>}
                    </button>
                  </th>
                  <td className="py-4 text-right font-mono text-lg">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-ink-600">
            Full values by flavour:{' '}
            <a href="#label-title" className="font-semibold text-ink-950 underline underline-offset-4">
              read the label ↓
            </a>
          </p>
          <p className="mt-2 text-xs text-ink-500">
            {n.sourced ? 'Figures from public listings; confirm against the current label before launch.' : 'Mock figures for this concept build; replace with the current label values before launch.'}
          </p>
        </div>
      </div>
    </section>
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
          <Rating rating={product.rating} count={product.reviewCount} className="mt-4" />

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

      {isBiozyme && <WhyBiozyme powder={flavourColor} />}
      {hasMacros && <NutritionPanel product={product} powder={flavourColor} />}
      {hasMacros && <NutritionBox product={product} flavourName={flavour?.name ?? ''} flavourColor={flavourColor} sizeLabel={size.label} servings={size.servings} />}

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

      <ReviewsBlock product={product} flavourId={product.flavours.length > 1 ? flavour?.id ?? null : null} flavourName={flavour?.family !== 'tbc' ? flavour?.name : undefined} />

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
