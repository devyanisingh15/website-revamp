import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { VerifyForm } from '../AuthenticityChecker';

export function AuthenticitySection() {
  return (
    <section id="verify" aria-labelledby="auth-title" className="surface-bone relative overflow-hidden py-24 md:py-32">
      <div className="container-x relative grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow flex items-center gap-3 text-ink-600">
            <span className="text-blaze-600">03</span>
            <span className="h-px w-8 bg-current opacity-40" aria-hidden />
            The proof
          </p>
          <h2 id="auth-title" className="display mt-5 text-display-lg">
            Don’t Trust Us. <span className="text-blaze-600">Check Us.</span>
          </h2>
          <p className="mt-6 max-w-[44ch] text-lede text-ink-700">
            Every MuscleBlaze tub carries a unique authenticity code and a batch number. Enter them to confirm your product is genuine and read its lab report.
          </p>
          <ol className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-sm border hairline-dark bg-ink-950/10 text-sm">
            {['Scratch', 'Enter', 'Verified'].map((s, i) => (
              <li key={s} className="bg-bone-100 p-4">
                <span className="font-mono text-xs text-blaze-600">0{i + 1}</span>
                <span className="mt-1 block font-semibold">{s}</span>
              </li>
            ))}
          </ol>
          <Link to="/authenticity" className="group mt-8 inline-flex items-center gap-2 font-semibold">
            Lab reports & how to spot a fake <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <VerifyForm tone="light" />
        </div>
      </div>
    </section>
  );
}
