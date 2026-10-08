import { radioKeyNav } from '@/lib/a11y';
import type { PackSize } from '@/data/types';
import { cx } from '@/lib/format';

export function SizeSelector({ sizes, value, onChange, tone = 'dark' }: { sizes: PackSize[]; value: string; onChange: (id: string) => void; tone?: 'dark' | 'light' }) {
  if (sizes.length <= 1) return sizes[0] ? <p className="text-sm opacity-60">Size: {sizes[0].label}</p> : null;
  return (
    <fieldset>
      <legend className="mb-2 text-sm">
        <span className="opacity-60">Size: </span>
        <span className="font-semibold">{sizes.find((s) => s.id === value)?.label}</span>
      </legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size" onKeyDown={(e) => radioKeyNav(e, sizes.map((s) => s.id), value, onChange)}>
        {sizes.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={s.id === value}
            tabIndex={s.id === value ? 0 : -1}
            onClick={() => onChange(s.id)}
            className={cx(
              'min-h-11 rounded-sm border px-4 text-sm font-semibold transition-colors',
              s.id === value
                ? tone === 'dark'
                  ? 'border-bone-100 bg-bone-100 text-ink-950'
                  : 'border-ink-950 bg-ink-950 text-bone-100'
                : tone === 'dark'
                  ? 'border-white/20 hover:border-white/60'
                  : 'border-ink-950/20 hover:border-ink-950/60',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
