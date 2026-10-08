import { ANNOUNCEMENT } from '@/data/navigation';

export function AnnouncementBar() {
  const items = ANNOUNCEMENT.split(' · ');
  return (
    <div className="relative z-50 h-[var(--announce-h)] overflow-hidden border-b hairline bg-ink-950 text-bone-200">
      {/* Desktop: static line. Mobile: slow marquee so all three proof points are readable. */}
      <p className="hidden h-full items-center justify-center gap-4 font-mono text-[11px] uppercase tracking-[0.14em] md:flex">
        {items.map((t, i) => (
          <span key={t} className="flex items-center gap-4">
            {i > 0 && <span className="size-1 rounded-full bg-blaze-500" aria-hidden />}
            {t}
          </span>
        ))}
      </p>
      <p className="sr-only md:hidden">{ANNOUNCEMENT}</p>
      <div className="flex h-full w-max animate-marquee items-center md:hidden" aria-hidden>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {items.map((t) => (
              <span key={t + k} className="flex shrink-0 items-center gap-4 whitespace-nowrap px-4 font-mono text-[11px] uppercase tracking-[0.14em]">
                <span className="size-1 rounded-full bg-blaze-500" />
                {t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
