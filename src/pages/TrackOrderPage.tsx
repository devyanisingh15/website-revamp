import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { SEO } from '@/data/seo';
import { useSeo } from '@/hooks/useSeo';
import { findOrder, type Order } from '@/lib/api/orders';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { MockTag } from '@/components/ui/Placeholder';
import { OrderTimeline } from '@/components/ecommerce/OrderTimeline';
import { formatDate } from '@/lib/format';

export default function TrackOrderPage() {
  useSeo(SEO.track);
  const [sp] = useSearchParams();
  const [id, setId] = useState(sp.get('id') ?? '');
  const [state, setState] = useState<{ kind: 'idle' | 'loading' | 'none' | 'invalid' } | { kind: 'found'; order: Order }>({ kind: 'idle' });

  const lookup = async (value: string) => {
    if (value.trim().length < 4) return setState({ kind: 'invalid' });
    setState({ kind: 'loading' });
    const o = await findOrder(value);
    setState(o ? { kind: 'found', order: o } : { kind: 'none' });
  };
  useEffect(() => {
    if (sp.get('id')) lookup(sp.get('id')!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    lookup(id);
  };

  return (
    <div className="bg-ink-950">
      <div className="container-x max-w-4xl py-16 md:py-24">
        <p className="eyebrow text-bone-400">Order placed → Packed → Shipped → Out for delivery → Delivered</p>
        <h1 className="display mt-4 text-display-lg">Track Order</h1>
        <form onSubmit={submit} noValidate className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-start">
          <Field className="flex-1" label="Order number" value={id} onChange={(e) => setId(e.target.value.toUpperCase())} placeholder="e.g. MB12345678" error={state.kind === 'invalid' ? 'Enter your order number from the confirmation email.' : null} hint={<>Try <code className="font-mono">MBDEMO123</code> or an order you placed in this browser.</>} />
          <Button type="submit" size="md" className="sm:mt-[26px]" loading={state.kind === 'loading'}>
            Track
          </Button>
        </form>
        <p className="mt-3 flex items-center gap-2 text-xs text-bone-400">
          <MockTag>Mock</MockTag> Tracking data comes from the logistics API once connected.
        </p>

        <div aria-live="polite" className="mt-12">
          {state.kind === 'none' && <p className="text-bone-300">We couldn’t find that order. Check the number in your confirmation email, or contact support.</p>}
          {state.kind === 'found' && (
            <div className="rounded-md border hairline p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="flex items-center gap-3 font-semibold">
                  <Package className="size-5 text-proof-400" aria-hidden /> Order #{state.order.id}
                </p>
                <p className="text-sm text-bone-300">Arrives by {formatDate(new Date(state.order.eta))}</p>
              </div>
              <div className="mt-8">
                <OrderTimeline status={state.order.status} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
