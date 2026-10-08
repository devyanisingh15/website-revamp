import { Link } from 'react-router-dom';
import { ArrowRight, Search, ShieldCheck, FlaskConical, BookOpen, Package, User } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Accordion } from '../ui/Accordion';
import { SHOP_LINKS, GOAL_LINKS, WHEY_LINKS } from '@/data/navigation';

export function MobileMenu({ open, onClose, onSearch }: { open: boolean; onClose: () => void; onSearch: () => void }) {
  const list = (links: { label: string; to: string }[]) => (
    <ul className="-mt-2 space-y-0.5">
      {links.map((l) => (
        <li key={l.to}>
          <Link to={l.to} onClick={onClose} className="flex min-h-11 items-center justify-between py-2 text-[15px] text-bone-200">
            {l.label}
            <ArrowRight className="size-4 opacity-40" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <Dialog open={open} onClose={onClose} title="Menu" side="left">
      <div className="flex flex-col gap-6 p-5">
        <button onClick={onSearch} className="flex h-12 items-center gap-3 rounded-sm border hairline px-4 text-left text-bone-400">
          <Search className="size-4" aria-hidden /> Search whey, creatine…
        </button>
        <Accordion
          items={[
            { id: 'shop', title: 'Shop', content: list([{ label: 'Shop all', to: '/shop' }, ...SHOP_LINKS]) },
            { id: 'whey', title: 'Whey Protein range', content: list(WHEY_LINKS) },
            { id: 'goals', title: 'Shop by Goal', content: list(GOAL_LINKS) },
          ]}
        />
        <nav aria-label="More" className="grid grid-cols-2 gap-2">
          {[
            { to: '/science', label: 'Science', Icon: FlaskConical },
            { to: '/authenticity', label: 'Authenticity', Icon: ShieldCheck },
            { to: '/fit-hub', label: 'Fit Hub', Icon: BookOpen },
            { to: '/track-order', label: 'Track Order', Icon: Package },
            { to: '/account', label: 'Account', Icon: User },
            { to: '/about', label: 'About', Icon: ArrowRight },
          ].map(({ to, label, Icon }) => (
            <Link key={to} to={to} onClick={onClose} className="flex min-h-14 items-center gap-3 rounded-sm bg-ink-850 px-4 text-sm font-semibold">
              <Icon className="size-4 text-blaze-400" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <Link to="/#goal-finder" onClick={onClose} className="rounded-sm border border-proof-400/40 p-4 text-sm">
          <span className="eyebrow text-proof-400">Not sure where to start?</span>
          <span className="mt-1 block font-semibold">Take the 30-second quiz →</span>
        </Link>
      </div>
    </Dialog>
  );
}
