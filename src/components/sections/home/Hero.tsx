import { useRef, useState } from 'react';
import { ArrowRight, RotateCcw, RotateCw, ShieldCheck, FlaskConical, ScanLine } from 'lucide-react';
import { Stage3D, useCan3D } from '@/components/3d/Stage3D';
import { loadHeroTub } from '@/components/3d/loaders';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { ProductArt } from '@/components/product/ProductArt';
import { ButtonLink } from '@/components/ui/Button';
import { BIOZYME_FLAVOURS } from '@/data/flavours';
import { getProduct, PRIMARY_PRODUCT_ID } from '@/data/products';
import { radioKeyNav } from '@/lib/a11y';
import { cx } from '@/lib/format';

const PROOF = [
  { Icon: FlaskConical, text: '50% higher protein absorption', sub: 'Clinically tested on Indian bodies' },
  { Icon: ScanLine, text: 'Lab report for every batch', sub: 'Enter your batch number' },
  { Icon: ShieldCheck, text: 'Authenticity code on every tub', sub: 'Scratch, scan, verify' },
];

export function Hero() {
  const product = getProduct(PRIMARY_PRODUCT_ID)!;
  const [flavourId, setFlavourId] = useState(BIOZYME_FLAVOURS[0].id);
  const flavour = BIOZYME_FLAVOURS.find((f) => f.id === flavourId)!;
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const impulse = useRef(0);
  const live = useCan3D(true);

  // Scroll progress drives the lid (3D) and the proof callouts (CSS var, no re-render)
  const progress = useScrollProgress(wrap, {
    enabled: live,
    onUpdate: (p) => stage.current?.style.setProperty('--p', p.toFixed(3)),
  });

  const tub = { body: product.art.body, band: flavour.color, label: product.art.label, sub: product.art.sub, bandText: product.art.bandText, protein: 25 };

  return (
    <section ref={wrap} aria-labelledby="hero-title" className={cx('relative', live ? 'h-[210vh] md:h-[230vh]' : '')}>
      <div ref={stage} className={cx('grain relative overflow-hidden', live ? 'sticky top-0 -mt-[var(--header-h)] h-[100svh]' : 'min-h-[calc(100svh-var(--header-h)-var(--announce-h))]')} style={{ ['--p' as string]: 0 }}>
        {/* Studio backdrop */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_55%_at_62%_48%,#2a1214_0%,#111113_45%,#0a0a0b_100%)]" />
        <div aria-hidden className="grid-lines absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_60%_at_60%_50%,black,transparent)]" />
        <p
          aria-hidden
          className="display pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[26vw] leading-none text-transparent [-webkit-text-stroke:1px_rgb(242_239_233/0.06)] md:left-[62%] md:text-[19vw]"
        >
          BIOZYME
        </p>

        <div className={cx('container-x relative grid h-full grid-rows-[auto_1fr_auto] gap-4 pb-6 md:grid-cols-12 md:grid-rows-1 md:items-center md:gap-8 md:py-0', live ? 'pt-[calc(var(--header-h)+0.75rem)] md:pt-[var(--header-h)]' : 'pt-8')}>
          {/* Copy */}
          <div className="relative z-10 md:col-span-6 lg:col-span-5">
            <p className="eyebrow flex items-center gap-2 text-proof-400">
              <span className="size-1.5 rounded-full bg-proof-400" aria-hidden />
              India’s first clinically tested whey
            </p>
            <h1 id="hero-title" className="display mt-4 text-[clamp(2rem,0.4rem+6.8vw,7rem)] leading-[0.86] md:mt-6">
              Proof in
              <br />
              Every <span className="text-blaze-500">Scoop.</span>
            </h1>
            <p className="mt-5 max-w-[44ch] text-[14px] leading-relaxed text-bone-200 md:mt-7 md:text-[clamp(1rem,0.9rem+0.4vw,1.2rem)]">
              Biozyme whey is clinically tested on Indian bodies for 50% higher protein absorption. Spin it, scan it, see the lab report.
            </p>
            <div className="mt-6 hidden flex-wrap gap-3 md:mt-9 md:flex">
              <ButtonLink to={`/product/${product.slug}`} size="lg" iconRight={<ArrowRight className="size-4" />}>
                Shop Biozyme
              </ButtonLink>
              <ButtonLink to="/#goal-finder" size="lg" variant="secondary">
                Find My Protein
              </ButtonLink>
            </div>
          </div>

          {/* Product stage */}
          <div className="relative min-h-0 md:col-span-6 md:col-start-7 md:h-[78vh] lg:col-span-7 lg:col-start-6">
            <Stage3D
              load={loadHeroTub}
              sceneProps={{ tub, powder: flavour.color, powderAccent: flavour.accent, progress, impulse }}
              mobileLive
              className="absolute inset-0"
              label={`3D Biozyme Performance Whey tub in ${flavour.name}. Drag to rotate; scrolling opens the lid and releases a burst of powder. The same information is listed in the proof points beside it.`}
              fallback={
                <div className="grid size-full place-items-center">
                  <div className="aspect-[200/260] h-[min(56vh,520px)] max-h-full max-w-full animate-[rise_1s_var(--ease-out-expo)_both] drop-shadow-[0_40px_60px_rgba(0,0,0,.6)]">
                    <ProductArt art={product.art} band={flavour.color} protein={25} title={`${product.shortName} tub, ${flavour.name}`} />
                  </div>
                </div>
              }
            >
              {/* Proof callouts fade in as the lid opens */}
              <ul
                className="pointer-events-none absolute inset-x-0 bottom-16 z-10 hidden flex-col items-end gap-2 md:flex lg:right-4"
                style={live ? { opacity: 'clamp(0, calc((var(--p) - 0.35) * 4), 1)', transform: 'translateY(calc((1 - clamp(0, calc((var(--p) - 0.35) * 4), 1)) * 16px))' } : undefined}
              >
                {PROOF.map(({ Icon, text, sub }) => (
                  <li key={text} className="flex items-center gap-3 rounded-sm border hairline bg-ink-950/70 px-4 py-2.5 backdrop-blur">
                    <Icon className="size-4 text-proof-400" aria-hidden />
                    <span>
                      <span className="block text-sm font-semibold">{text}</span>
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-bone-400">{sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Stage3D>
          </div>

          {/* Controls: hint, rotate buttons, flavour swatches; mobile CTAs */}
          <div className="relative z-10 flex flex-col gap-4 md:absolute md:inset-x-0 md:bottom-8 md:px-10 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4 md:ml-auto md:w-[56%]">
              <div className="flex items-center gap-2">
                <button onClick={() => (impulse.current -= 1)} className="grid size-10 place-items-center rounded-full border hairline hover:border-white/50" aria-label="Rotate tub left" disabled={!live}>
                  <RotateCcw className="size-4" />
                </button>
                <button onClick={() => (impulse.current += 1)} className="grid size-10 place-items-center rounded-full border hairline hover:border-white/50" aria-label="Rotate tub right" disabled={!live}>
                  <RotateCw className="size-4" />
                </button>
                <p className="ml-2 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-400">{live ? 'Drag to rotate · Scroll to open' : 'Biozyme Performance · 25 g protein'}</p>
              </div>
              <div
                className="flex items-center gap-2"
                role="radiogroup"
                aria-label="Preview flavour"
                onKeyDown={(e) => radioKeyNav(e, BIOZYME_FLAVOURS.map((f) => f.id), flavourId, setFlavourId)}
              >
                {BIOZYME_FLAVOURS.map((f) => (
                  <button
                    key={f.id}
                    role="radio"
                    aria-checked={f.id === flavourId}
                    tabIndex={f.id === flavourId ? 0 : -1}
                    aria-label={f.name}
                    title={f.name}
                    onClick={() => setFlavourId(f.id)}
                    className={cx('size-6 rounded-full border border-black/30 transition-transform', f.id === flavourId ? 'scale-110 ring-2 ring-bone-100 ring-offset-2 ring-offset-ink-950' : 'hover:scale-110')}
                    style={{ background: f.color }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 md:hidden">
              <ButtonLink to={`/product/${product.slug}`} size="lg" block>
                Shop Biozyme
              </ButtonLink>
              <ButtonLink to="/#goal-finder" size="lg" variant="secondary" block>
                Find My Protein
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
