import { BadgeCheck } from 'lucide-react';
import { TESTIMONIALS } from '@/data/testimonials';
import { MockTag } from '@/components/ui/Placeholder';

/** Testimonials — MOCK sample records (src/data/testimonials.ts). Replace with real, consented reviews before launch. */
export function Testimonials() {
  return (
    <section aria-labelledby="people-title" className="bg-ink-950 py-24 md:py-32">
      <div className="container-x">
        <p className="eyebrow flex items-center gap-3 text-bone-400">
          <span className="text-blaze-500">06</span>
          <span className="h-px w-8 bg-current opacity-40" aria-hidden />
          Real people
        </p>
        <h2 id="people-title" className="display mt-5 text-display-lg">
          Built by Real Lifters
        </h2>
        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.id} className="relative flex flex-col rounded-md border hairline bg-ink-900/40 p-6">
              {t.mock && <MockTag className="absolute right-4 top-4">Sample</MockTag>}
              <span className="grid size-14 place-items-center rounded-full bg-ink-800 font-mono text-lg font-semibold text-bone-200" aria-hidden>
                {t.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}
              </span>
              <blockquote className="mt-6 flex-1 text-xl font-semibold leading-snug">“{t.quote}”</blockquote>
              <footer className="mt-6 flex items-end justify-between gap-3 border-t hairline pt-4 text-sm">
                <div>
                  <p className="font-semibold">
                    {t.name}, {t.city}
                  </p>
                  <p className="mt-1 text-bone-400">Goal: {t.goal}</p>
                </div>
                {t.verifiedBuyer && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-bone-400">
                    <BadgeCheck className="size-4" aria-hidden /> Verified buyer
                  </span>
                )}
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
