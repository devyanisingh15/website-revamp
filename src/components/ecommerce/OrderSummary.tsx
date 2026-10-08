import { useCart } from '@/lib/cart';
import { formatINR } from '@/lib/format';
import { MockTag } from '../ui/Placeholder';

export function OrderSummary({ compact }: { compact?: boolean }) {
  const { totals, coupon } = useCart();
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-bone-400">Subtotal</dt>
        <dd className="font-mono">{formatINR(totals.subtotal)}</dd>
      </div>
      {totals.mrpTotal > totals.subtotal && !compact && (
        <div className="flex justify-between">
          <dt className="text-bone-400">You save on MRP</dt>
          <dd className="font-mono text-proof-400">−{formatINR(totals.mrpTotal - totals.subtotal)}</dd>
        </div>
      )}
      {coupon && (
        <div className="flex justify-between">
          <dt className="text-bone-400">Coupon {coupon.code}</dt>
          <dd className="font-mono text-proof-400">−{formatINR(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-bone-400">Delivery</dt>
        <dd className="font-mono">{totals.freeDelivery ? 'Free' : 'Calculated at checkout'}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t hairline pt-4 text-base">
        <dt className="font-semibold">Total</dt>
        <dd className="font-mono text-xl font-semibold">{formatINR(totals.total)}</dd>
      </div>
      <p className="flex items-center gap-2 text-xs text-bone-400">
        <MockTag>Demo prices</MockTag> Inclusive of all taxes
      </p>
    </dl>
  );
}
