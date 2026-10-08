import { useRef, useState } from 'react';
import { ArrowRight, FlaskConical, Eye, Heart, Users } from 'lucide-react';
import { SEO } from '@/data/seo';
import { AWARD } from '@/data/site';
import { useSeo } from '@/hooks/useSeo';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { ButtonLink } from '@/components/ui/Button';
import { Ph } from '@/components/ui/Placeholder';
import { cx } from '@/lib/format';

/** Exact years are placeholders until supplied by the brand team. */
const TIMELINE = [
  { label: 'Founded', year: null as string | null },
  { label: 'First whey launch', year: null },
  { label: 'Biozyme launched', year: null },
  { label: `NutraIngredients Product of the Year 2021`, year: '2021', note: `${AWARD.title}, ${AWARD.event}` },
  { label: 'Today', year: null, note: 'One of India’s leading sports nutrition brands, trusted by millions.' },
];

const VALUES = [
  { Icon: FlaskConical, t: 'Science first' },
  { Icon: Eye, t: 'Total transparency' },
  { Icon: Heart, t: 'Indian at heart' },
  { Icon: Users, t: 'Built with athletes' },
];

export default function AboutPage() {
  useSeo(SEO.about);
  const path = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const [reached, setReached] = useState(0);
  useScrollProgress(path, {
    start: 'top 70%',
    end: 'bottom 60%',
    onUpdate: (p) => {
      if (line.current) line.current.style.transform = `scaleY(${p})`;
      setReached(Math.round(p * (TIMELINE.length - 1)));
    },
  });

  return (
    <div className="bg-ink-950">
      <header className="relative overflow-hidden border-b hairline">
        <div className="container-x py-20 md:py-32">
          <p className="eyebrow text-bone-400">About MuscleBlaze</p>
          <h1 className="display mt-5 max-w-[15ch] text-display-xl">
            Made in India. <span className="text-blaze-500">Tested Like the World’s Watching.</span>
          </h1>
          <p className="mt-8 max-w-[52ch] text-lede text-bone-300">
            MuscleBlaze started with one belief: Indian lifters deserve supplements made for their bodies, tested in the open and priced fairly. Today we’re one of India’s leading sports nutrition brands, trusted by millions.
          </p>
        </div>
      </header>

      <section aria-labelledby="mission-title" className="surface-bone py-20 md:py-28">
        <div className="container-x grid gap-8 lg:grid-cols-12">
          <h2 id="mission-title" className="eyebrow text-ink-600 lg:col-span-3">
            Our mission
          </h2>
          <p className="display-tight text-[clamp(1.8rem,1rem+2.6vw,3.4rem)] leading-[1.05] lg:col-span-9">Make clean, effective, honestly labelled nutrition available to every Indian who trains.</p>
        </div>
      </section>

      <section aria-labelledby="timeline-title" className="py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <h2 id="timeline-title" className="display text-display-md lg:col-span-4">
            The Road So Far
          </h2>
          <ol ref={path} className="relative lg:col-span-7 lg:col-start-6">
            <span aria-hidden className="absolute bottom-2 left-[11px] top-2 w-px bg-white/10" />
            <span ref={line} aria-hidden className="absolute bottom-2 left-[11px] top-2 w-px origin-top scale-y-0 bg-blaze-500" />
            {TIMELINE.map((t, i) => (
              <li key={t.label} className="relative pb-14 pl-12 last:pb-0">
                <span className={cx('absolute left-0 top-1 grid size-6 place-items-center rounded-full border-2 transition-colors duration-500', i <= reached ? 'border-blaze-500 bg-blaze-500' : 'border-white/20 bg-ink-950')} aria-hidden>
                  <span className="size-1.5 rounded-full bg-ink-950" />
                </span>
                <p className="font-mono text-sm text-blaze-400">{t.year ?? <Ph label="year to be supplied by the brand team">[year]</Ph>}</p>
                <h3 className="display-tight mt-2 text-2xl md:text-3xl">{t.label}</h3>
                {t.note && <p className="mt-2 text-bone-400">{t.note}</p>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="values-title" className="border-t hairline py-20 md:py-28">
        <div className="container-x">
          <h2 id="values-title" className="display text-display-md">
            What We Stand For
          </h2>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-md border hairline bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ Icon, t }, i) => (
              <li key={t} className="flex min-h-[220px] flex-col justify-between bg-ink-950 p-6">
                <span className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blaze-500">0{i + 1}</span>
                  <Icon className="size-6 text-bone-300" aria-hidden />
                </span>
                <span className="display-tight text-3xl">{t}</span>
              </li>
            ))}
          </ul>
          <ButtonLink to="/shop" size="lg" className="mt-12" iconRight={<ArrowRight className="size-4" />}>
            Meet the Range
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
