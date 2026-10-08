import { FlaskConical, Microscope, ScanLine, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tilt } from '@/components/ui/Tilt';

const ITEMS = [
  { Icon: FlaskConical, title: 'Clinically Tested', body: 'Absorption proven on Indian bodies', to: '/science' },
  { Icon: Microscope, title: 'Lab Verified', body: 'Third-party tested for label accuracy and purity', to: '/authenticity#lab-report' },
  { Icon: ScanLine, title: 'Authenticity Code', body: 'Scratch, scan, and know it’s genuine', to: '/authenticity' },
  { Icon: MapPin, title: 'Made for India', body: 'Flavours and formulas built for Indian taste', to: '/about' },
];

/** Four proof points; icons tilt toward the cursor (gyroscope on supported mobiles). */
export function ValueStrip() {
  return (
    <section aria-label="Why MuscleBlaze" className="relative z-10 border-y hairline bg-ink-950">
      <ul className="container-x grid grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ Icon, title, body, to }, i) => (
          <li key={title} className={`border-white/10 ${i % 2 === 1 ? 'border-l' : ''} ${i > 1 ? 'border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}>
            <Link to={to} className="group flex h-full flex-col gap-5 px-4 py-8 transition-colors hover:bg-white/[0.02] sm:px-6 lg:flex-row lg:items-center lg:py-10">
              <Tilt max={18} gyro className="relative size-14 shrink-0">
                <span className="absolute inset-0 rounded-md border border-blaze-500/40 [transform:translateZ(-12px)]" aria-hidden />
                <span className="absolute inset-0 grid place-items-center rounded-md bg-ink-850 [transform:translateZ(10px)] group-hover:bg-blaze-500 transition-colors">
                  <Icon className="size-6 text-blaze-400 transition-colors group-hover:text-white" aria-hidden />
                </span>
              </Tilt>
              <span>
                <span className="block text-[15px] font-bold tracking-tight md:text-base">{title}</span>
                <span className="mt-1 block text-[13px] leading-snug text-bone-400 md:text-sm">{body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
