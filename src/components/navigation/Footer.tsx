import { Link } from 'react-router-dom';
import { FOOTER_COLUMNS, LEGAL_LINKS, TAGLINES } from '@/data/navigation';
import { SITE } from '@/data/site';
import { Logo } from './Logo';
import { Ph, MockTag } from '../ui/Placeholder';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t hairline bg-ink-950 pt-20 text-bone-200">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="display mt-8 max-w-[14ch] text-display-sm text-bone-100">{SITE.strapline}</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="eyebrow mb-4 text-bone-400">{col.title}</h2>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.to + l.label}>
                      <Link to={l.to} className="text-sm text-bone-200 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 border-t hairline py-8">
          <p className="max-w-3xl text-xs leading-relaxed text-bone-400">{SITE.disclaimer}</p>
          <div className="mt-6 flex flex-col gap-4 text-xs text-bone-400 md:flex-row md:items-center md:justify-between">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                FSSAI licence no. {SITE.fssaiLicence ?? <Ph label="FSSAI licence number to be supplied">[x]</Ph>}
              </li>
            </ul>
            <p className="flex items-center gap-2">
              <MockTag>Concept build</MockTag> Mock data and services · © MuscleBlaze
            </p>
          </div>
        </div>
      </div>
      {/* Oversized tagline as a closing gesture */}
      <p aria-hidden className="display pointer-events-none select-none whitespace-nowrap pb-4 text-center text-[clamp(3rem,13vw,13rem)] leading-[0.8] text-white/[0.04]">
        {TAGLINES.builtDifferent}
      </p>
    </footer>
  );
}
