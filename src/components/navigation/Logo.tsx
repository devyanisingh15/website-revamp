import { Link } from 'react-router-dom';
import { cx } from '@/lib/format';

/** Typographic placeholder wordmark — swap for the official MuscleBlaze logo SVG. */
export function Logo({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <Link to="/" aria-label="MuscleBlaze home" className={cx('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 28 28" className="size-7 shrink-0" aria-hidden>
        <rect width="28" height="28" rx="4" fill="#e8202a" />
        <path d="M6 21V7h3.6l4.4 6.2L18.4 7H22v14h-3.6v-7.4L14 19.6l-4.4-6V21z" fill="#fff" />
      </svg>
      <span
        className={cx('text-[17px] font-extrabold uppercase leading-none tracking-[-0.02em]', tone === 'light' ? 'text-bone-100' : 'text-ink-950')}
        style={{ fontVariationSettings: "'wdth' 120" }}
      >
        Muscle<span className="text-blaze-500">Blaze</span>
      </span>
    </Link>
  );
}
