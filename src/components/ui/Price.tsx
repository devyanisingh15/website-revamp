import { getPrice, PRICE_MODE } from '@/mocks/pricing';
import { formatINR, savingsPct, cx } from '@/lib/format';
import { MockTag, Ph } from './Placeholder';

interface Props {
  productId: string;
  sizeId: string;
  servings?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showMrp?: boolean;
  showPerServing?: boolean;
  className?: string;
}

/** Price block — price · MRP · saving % · price per serving. Values come from src/mocks/pricing.ts (MOCK). */
export function Price({ productId, sizeId, servings, size = 'md', showMrp = true, showPerServing = false, className }: Props) {
  const p = PRICE_MODE === 'demo' ? getPrice(productId, sizeId) : null;
  const main = size === 'lg' ? 'text-3xl md:text-4xl' : size === 'md' ? 'text-lg' : 'text-base';

  if (!p) {
    return (
      <div className={cx('flex flex-wrap items-baseline gap-x-3 gap-y-1', className)}>
        <span className={cx('font-semibold', main)}>
          ₹<Ph>[price]</Ph>
        </span>
        {showMrp && (
          <span className="text-sm opacity-60">
            MRP ₹<Ph>[mrp]</Ph>
          </span>
        )}
        {showMrp && (
          <span className="text-sm text-proof-400">
            You save <Ph>[x]</Ph>%
          </span>
        )}
      </div>
    );
  }

  const off = savingsPct(p.price, p.mrp);
  return (
    <div className={cx('flex flex-wrap items-baseline gap-x-3 gap-y-1', className)}>
      <span className={cx('font-semibold tabular-nums tracking-tight', main)}>{formatINR(p.price)}</span>
      {showMrp && p.mrp > p.price && (
        <>
          <span className="text-sm tabular-nums opacity-55">
            MRP <s>{formatINR(p.mrp)}</s>
          </span>
          <span className="text-sm font-semibold text-proof-500">You save {off}%</span>
        </>
      )}
      <MockTag className="self-center">Demo price</MockTag>
      {showPerServing && servings ? (
        <span className="basis-full font-mono text-xs opacity-70">
          Price per serving {formatINR(p.price / servings)}
        </span>
      ) : null}
    </div>
  );
}
