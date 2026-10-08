import { radioKeyNav } from '@/lib/a11y';
import type { Flavour } from '@/data/types';
import { isOutOfStock } from '@/mocks/merchandising';
import { cx } from '@/lib/format';

/** Radio-group of flavour swatches. Out-of-stock flavours stay selectable (to reach "Notify me"). */
export function FlavourSelector({
  productId,
  flavours,
  value,
  onChange,
  size = 'md',
  label = 'Flavour',
  showName = true,
}: {
  productId: string;
  flavours: Flavour[];
  value: string | null;
  onChange: (id: string) => void;
  size?: 'sm' | 'md';
  label?: string;
  showName?: boolean;
}) {
  if (!flavours.length) return null;
  const current = flavours.find((f) => f.id === value);
  const tbc = flavours.length === 1 && flavours[0].family === 'tbc';
  if (tbc) return <p className="text-sm opacity-60">Flavours to be confirmed</p>;
  return (
    <fieldset>
      <legend className={cx('mb-2 text-sm', !showName && 'sr-only')}>
        <span className="opacity-60">{label}: </span>
        <span className="font-semibold">{current?.name}</span>
        {current && isOutOfStock(productId, current.id) && <span className="ml-2 text-xs font-semibold text-amber-signal">Sold out</span>}
      </legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label} onKeyDown={(e) => radioKeyNav(e, flavours.map((f) => f.id), value, onChange)}>
        {flavours.map((f) => {
          const oos = isOutOfStock(productId, f.id);
          const active = f.id === value;
          return (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active || (!value && f === flavours[0]) ? 0 : -1}
              aria-label={`${f.name}${oos ? ', sold out' : ''}`}
              title={f.name}
              onClick={() => onChange(f.id)}
              className={cx(
                'relative grid place-items-center rounded-full transition-all duration-200',
                size === 'sm' ? 'size-7' : 'size-10',
                active ? 'ring-2 ring-current ring-offset-2 ring-offset-[var(--ring-bg,#0a0a0b)]' : 'hover:scale-110',
              )}
            >
              <span
                className="block size-full rounded-full border border-black/20"
                style={{ background: f.accent ? `linear-gradient(135deg, ${f.color} 55%, ${f.accent} 55%)` : f.color }}
              />
              {oos && <span className="absolute h-[2px] w-[120%] rotate-45 bg-current opacity-80" aria-hidden />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
