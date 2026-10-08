import { Link } from 'react-router-dom';
import { AlertTriangle, ScanLine, Hand, KeyRound, BadgeCheck, ArrowRight } from 'lucide-react';
import { SEO } from '@/data/seo';
import { SITE } from '@/data/site';
import { useSeo } from '@/hooks/useSeo';
import { VerifyForm, LabReportLookup } from '@/components/sections/AuthenticityChecker';
import { ARTICLES } from '@/data/blog';

const STEPS = [
  { Icon: ScanLine, t: 'Find the authenticity sticker on your tub' },
  { Icon: Hand, t: 'Scratch to reveal the code' },
  { Icon: KeyRound, t: 'Enter the code or scan the QR' },
  { Icon: BadgeCheck, t: 'See your result instantly' },
];

export default function AuthenticityPage() {
  useSeo(SEO.authenticity);
  const fakeGuide = ARTICLES.find((a) => a.slug === 'how-to-spot-fake-protein-powder')!;
  return (
    <div className="bg-ink-950">
      <header className="relative overflow-hidden border-b hairline">
        <div className="container-x py-16 md:py-24">
          <p className="eyebrow text-proof-400">Check authenticity & lab reports</p>
          <h1 className="display mt-5 max-w-[16ch] text-display-xl">
            Is Your Tub Genuine? <span className="text-proof-400">Find Out in 10 Seconds.</span>
          </h1>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-md border hairline bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ Icon, t }, i) => (
              <li key={t} className="flex gap-4 bg-ink-950 p-6">
                <span className="font-mono text-xs text-blaze-500">0{i + 1}</span>
                <span>
                  <Icon className="size-6 text-bone-100" aria-hidden />
                  <span className="mt-4 block text-[15px] font-semibold leading-snug">{t}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </header>

      <section aria-labelledby="verify-title" className="surface-bone py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="verify-title" className="display text-display-md">
              Verify Your Tub
            </h2>
            <p className="mt-5 text-ink-700">Every MuscleBlaze tub carries a unique authenticity code and a batch number. Enter them to confirm your product is genuine and read its lab report.</p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <VerifyForm tone="light" />
          </div>
        </div>
      </section>

      <section id="lab-report" aria-labelledby="lab-title" className="scroll-mt-24 border-b hairline py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="lab-title" className="display text-display-md">
              Lab Reports
            </h2>
            <p className="mt-5 text-bone-300">Enter your batch number to see the third-party lab report for protein content and purity.</p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <LabReportLookup tone="dark" />
          </div>
        </div>
      </section>

      <section aria-label="Fake product warning" className="py-16">
        <div className="container-x">
          <div className="flex flex-col gap-6 rounded-md border border-amber-signal/40 bg-amber-signal/10 p-6 md:flex-row md:items-center md:p-8">
            <AlertTriangle className="size-8 shrink-0 text-amber-signal" aria-hidden />
            <p className="flex-1 text-lg font-semibold">{SITE.fakeProductWarning}</p>
            <Link to={`/fit-hub/${fakeGuide.slug}`} className="inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline">
              {fakeGuide.title} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
