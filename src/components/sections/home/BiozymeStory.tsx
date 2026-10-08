import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Stage3D, useCan3D } from '@/components/3d/Stage3D';
import { loadAbsorption } from '@/components/3d/loaders';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { CountUp } from '@/components/ui/CountUp';
import { AbsorptionFallback } from '../AbsorptionFallback';
import { cx } from '@/lib/format';

export const ABSORPTION_STAGES = [
  { title: 'Scoop', body: 'One scoop of Biozyme whey.' },
  { title: 'Particles', body: 'Protein disperses as it starts to digest.' },
  { title: 'Breakdown', body: 'EAF helps break protein down so your body can take more of it in.' },
  { title: 'Muscle fibre', body: 'More of every gram reaches the muscle, so each scoop works harder.' },
];

export function AbsorptionToggle({ value, onChange }: { value: 'biozyme' | 'regular'; onChange: (v: 'biozyme' | 'regular') => void }) {
  return (
    <div role="radiogroup" aria-label="Compare absorption" className="inline-flex rounded-sm border hairline p-1 text-sm">
      {(['regular', 'biozyme'] as const).map((v) => (
        <button
          key={v}
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cx('h-9 rounded-xs px-4 font-semibold transition-colors', value === v ? (v === 'biozyme' ? 'bg-blaze-500 text-white' : 'bg-bone-100 text-ink-950') : 'text-bone-400 hover:text-bone-100')}
        >
          {v === 'biozyme' ? 'Biozyme' : 'Regular whey'}
        </button>
      ))}
    </div>
  );
}

export function BiozymeStory() {
  const wrap = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const [mode, setMode] = useState<'biozyme' | 'regular'>('biozyme');
  const live = useCan3D(false);
  const progress = useScrollProgress(wrap, {
    enabled: live,
    onUpdate: (p) => setStage((s) => {
      const n = Math.min(3, Math.floor(p * 4.2));
      return n === s ? s : n;
    }),
  });

  return (
    <section ref={wrap} aria-labelledby="story-title" className={cx('relative bg-ink-950', live && 'h-[320vh]')}>
      <div className={cx('relative overflow-hidden', live ? 'sticky top-0 h-[100svh]' : 'py-24')}>
        <div className={cx('container-x relative grid h-full gap-10 lg:grid-cols-12', live && 'items-center')}>
          <div className={cx('relative z-10 lg:col-span-5', live && 'pt-[var(--header-h)]')}>
            <p className="eyebrow flex items-center gap-3 text-bone-400">
              <span className="text-blaze-500">02</span>
              <span className="h-px w-8 bg-current opacity-40" aria-hidden />
              The science
            </p>
            <h2 id="story-title" className="display mt-5 text-display-lg">
              More Protein In. <span className="text-blaze-500">Less Wasted.</span>
            </h2>
            <p className="mt-6 max-w-[46ch] text-lede text-bone-200">
              Most whey passes through before your muscles can use it. Biozyme’s Enhanced Absorption Formula (EAF) helps your body take in more of every gram, so each scoop works harder.
            </p>

            {live && (
              <ol className="mt-8 space-y-2" aria-label="Absorption stages">
                {ABSORPTION_STAGES.map((s, i) => (
                  <li key={s.title} className={cx('flex gap-4 border-l-2 py-1 pl-4 transition-all duration-500', i === stage ? 'border-blaze-500 opacity-100' : 'border-white/10 opacity-40')} aria-current={i === stage ? 'step' : undefined}>
                    <span className="font-mono text-xs text-blaze-500">0{i + 1}</span>
                    <span>
                      <span className="block text-sm font-semibold">{s.title}</span>
                      {i === stage && <span className="block text-sm text-bone-400">{s.body}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t hairline pt-6">
              <div>
                <dt className="sr-only">Protein absorption</dt>
                <dd className="display-tight text-3xl text-blaze-500 md:text-5xl">
                  <CountUp to={50} suffix="%" />
                </dd>
                <dd className="mt-1 text-xs leading-snug text-bone-400 md:text-sm">higher protein absorption</dd>
              </div>
              <div>
                <dt className="sr-only">BCAA absorption</dt>
                <dd className="display-tight text-3xl text-proof-400 md:text-5xl">
                  <CountUp to={60} suffix="%" />
                </dd>
                <dd className="mt-1 text-xs leading-snug text-bone-400 md:text-sm">higher BCAA absorption</dd>
              </div>
              <div>
                <dt className="sr-only">Protein per scoop</dt>
                <dd className="display-tight text-3xl md:text-5xl">
                  <CountUp from={0} to={25} />
                  <span>–27</span>
                  <span className="text-lg md:text-2xl"> g</span>
                </dd>
                <dd className="mt-1 text-xs leading-snug text-bone-400 md:text-sm">protein per scoop</dd>
              </div>
            </dl>
            <Link to="/science" className="group mt-8 inline-flex items-center gap-2 text-[15px] font-semibold">
              See the science <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>

          <div className={cx('relative lg:col-span-7', live ? 'h-[60vh] lg:h-[86vh]' : '')}>
            {live ? (
              <Stage3D
                load={loadAbsorption}
                sceneProps={{ progress, absorb: mode === 'biozyme' ? 1 : 1 / 1.5, showBcaa: true }}
                className="absolute inset-0"
                label="Scroll-driven illustration: a scoop of whey breaks into particles, the protein breaks down into amino-acid chains, and the particles flow into a muscle fibre. Toggle Regular whey to see fewer particles reach the fibre. The same stages are listed in text beside it."
                fallback={<div className="grid size-full place-items-center p-6"><AbsorptionFallback stages={ABSORPTION_STAGES} active={stage} /></div>}
              >
                <div className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-start gap-2 lg:left-auto lg:items-end">
                  <AbsorptionToggle value={mode} onChange={setMode} />
                  <p className="max-w-xs font-mono text-[10px] uppercase leading-relaxed tracking-wider text-bone-400 lg:text-right">
                    Illustrative, not to scale. Green = BCAAs. Biozyme vs regular whey per the clinical study.
                  </p>
                </div>
              </Stage3D>
            ) : (
              <AbsorptionFallback stages={ABSORPTION_STAGES} className="lg:mt-24" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
