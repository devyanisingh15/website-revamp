import { useRef, useState } from 'react';
import { ArrowRight, FlaskConical, Award, Microscope, ClipboardCheck } from 'lucide-react';
import { SEO } from '@/data/seo';
import { AWARD } from '@/data/site';
import { useSeo } from '@/hooks/useSeo';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { Stage3D, useCan3D } from '@/components/3d/Stage3D';
import { loadAbsorption } from '@/components/3d/loaders';
import { AbsorptionFallback } from '@/components/sections/AbsorptionFallback';
import { ABSORPTION_STAGES, AbsorptionToggle } from '@/components/sections/home/BiozymeStory';
import { ButtonLink } from '@/components/ui/Button';
import { CountUp } from '@/components/ui/CountUp';
import { getProduct, PRIMARY_PRODUCT_ID } from '@/data/products';
import { cx } from '@/lib/format';

const SECTIONS = [
  {
    n: '01',
    kicker: 'The problem',
    Icon: Microscope,
    title: 'The Problem.',
    body: 'Protein on the label isn’t protein in your muscles. How much your body absorbs is what counts.',
  },
  {
    n: '02',
    kicker: 'The formula',
    Icon: FlaskConical,
    title: 'The Formula.',
    body: 'Biozyme’s Enhanced Absorption Formula (EAF) uses a blend that helps break protein down so your body can take more of it in.',
  },
  {
    n: '03',
    kicker: 'The proof',
    Icon: ClipboardCheck,
    title: 'The Proof.',
    body: 'Clinically tested on Indian bodies, with the study registered with the Clinical Trials Registry of India (CTRI). Result: 50% higher protein and 60% higher BCAA absorption versus regular whey.',
  },
  {
    n: '04',
    kicker: 'Recognition',
    Icon: Award,
    title: 'Recognition.',
    body: `Winner, ${AWARD.title} at the ${AWARD.event}.`,
  },
];

export default function SciencePage() {
  useSeo(SEO.science);
  const product = getProduct(PRIMARY_PRODUCT_ID)!;
  const tour = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<'biozyme' | 'regular'>('biozyme');
  const live = useCan3D(false);
  const progress = useScrollProgress(tour, {
    start: 'top center',
    end: 'bottom center',
    enabled: true,
    onUpdate: (p) => setActive((a) => {
      const n = Math.min(3, Math.floor(p * 4));
      return n === a ? a : n;
    }),
  });

  return (
    <div className="bg-ink-950">
      <header className="relative overflow-hidden border-b hairline">
        <div aria-hidden className="grid-lines absolute inset-0 [mask-image:radial-gradient(60%_70%_at_70%_40%,black,transparent)]" />
        <div className="container-x relative py-20 md:py-32">
          <p className="eyebrow text-proof-400">Science of Biozyme</p>
          <h1 className="display mt-5 max-w-[13ch] text-display-xl">Why Absorption Is Everything.</h1>
          <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-8 border-t hairline pt-8 md:grid-cols-3">
            <div>
              <dd className="display-tight text-5xl text-blaze-500 md:text-6xl">
                <CountUp to={50} suffix="%" />
              </dd>
              <dt className="mt-2 text-sm text-bone-400">higher protein absorption</dt>
            </div>
            <div>
              <dd className="display-tight text-5xl text-proof-400 md:text-6xl">
                <CountUp to={60} suffix="%" />
              </dd>
              <dt className="mt-2 text-sm text-bone-400">higher BCAA absorption</dt>
            </div>
            <div className="col-span-2 md:col-span-1">
              <dd className="display-tight text-5xl md:text-6xl">CTRI</dd>
              <dt className="mt-2 text-sm text-bone-400">registered clinical study, Indian bodies</dt>
            </div>
          </dl>
        </div>
      </header>

      {/* Guided tour: sticky cutaway + scrolling chapters */}
      <div ref={tour} className="container-x relative grid gap-10 lg:grid-cols-12">
        <div className="hidden lg:col-span-6 lg:block">
          <div className="sticky top-[var(--header-h)] h-[calc(100vh-var(--header-h))]">
            {live ? (
              <Stage3D
                load={loadAbsorption}
                sceneProps={{ progress, absorb: mode === 'biozyme' ? 1 : 1 / 1.5, showBcaa: true }}
                className="absolute inset-0"
                label="Cutaway animation driven by scrolling: protein molecules break down into amino acid chains and enter a muscle fibre. Each stage is described in the text chapters."
                fallback={<div className="grid size-full place-items-center"><AbsorptionFallback stages={ABSORPTION_STAGES} active={active} className="w-full" /></div>}
              >
                <ol className="pointer-events-none absolute left-0 top-8 space-y-1 font-mono text-[11px] uppercase tracking-wider">
                  {ABSORPTION_STAGES.map((s, i) => (
                    <li key={s.title} className={cx('transition-opacity', i === active ? 'text-bone-100' : 'text-bone-400/50')}>
                      <span className="text-blaze-500">0{i + 1}</span> {s.title}
                    </li>
                  ))}
                </ol>
                <div className="absolute bottom-8 left-0 z-10">
                  <AbsorptionToggle value={mode} onChange={setMode} />
                </div>
              </Stage3D>
            ) : (
              <div className="grid h-full place-items-center">
                <AbsorptionFallback stages={ABSORPTION_STAGES} active={active} className="w-full" />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          {SECTIONS.map((s, i) => (
            <section key={s.n} aria-labelledby={`sci-${s.n}`} className={cx('flex min-h-[80vh] flex-col justify-center border-b hairline py-16 transition-opacity duration-500 lg:min-h-screen', i === active ? 'opacity-100' : 'lg:opacity-40')}>
              <p className="eyebrow flex items-center gap-3 text-bone-400">
                <span className="text-blaze-500">{s.n}</span>
                <span className="h-px w-8 bg-current opacity-40" aria-hidden />
                Section {Number(s.n)}
              </p>
              <s.Icon className="mt-8 size-8 text-blaze-400" aria-hidden />
              <h2 id={`sci-${s.n}`} className="display-tight mt-5 text-4xl leading-[1.02] md:text-5xl">
                {s.title}
              </h2>
              <p className="mt-6 text-lede text-bone-300">{s.body}</p>
              <div className="mt-8 lg:hidden">
                <AbsorptionFallback stages={[ABSORPTION_STAGES[i]]} start={i} className="grid-cols-1! max-w-[220px]" />
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className="border-t hairline bg-blaze-500 py-20 text-white">
        <div className="container-x flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <p className="display max-w-[16ch] text-display-md">Absorb More. Build More.</p>
          <ButtonLink to={`/product/${product.slug}`} size="lg" variant="inverse" iconRight={<ArrowRight className="size-4" />}>
            Try Biozyme
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
