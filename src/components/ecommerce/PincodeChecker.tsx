import { useState, type FormEvent } from 'react';
import { MapPin, Truck } from 'lucide-react';
import { checkPincode, isValidPincode, DEMO_UNSERVICEABLE } from '@/lib/api/delivery';
import { formatDate } from '@/lib/format';
import { TOAST_COPY } from '@/lib/toast';
import { MockTag } from '../ui/Placeholder';

/** "Enter pincode → Delivery by [date] (2-hour delivery where available)" — mocked */
export function PincodeChecker() {
  const [pin, setPin] = useState('');
  const [state, setState] = useState<{ kind: 'idle' | 'loading' | 'ok' | 'no' | 'invalid'; date?: Date }>({ kind: 'idle' });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidPincode(pin)) return setState({ kind: 'invalid' });
    setState({ kind: 'loading' });
    const r = await checkPincode(pin);
    setState(r.ok ? { kind: 'ok', date: r.date } : { kind: 'no' });
  };

  return (
    <form onSubmit={submit} className="rounded-sm border hairline p-4" noValidate>
      <label htmlFor="pincode" className="flex items-center gap-2 text-sm font-semibold">
        <Truck className="size-4" aria-hidden /> Check delivery <MockTag>Mock</MockTag>
      </label>
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-50" aria-hidden />
          <input
            id="pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter pincode"
            aria-invalid={state.kind === 'invalid' || undefined}
            aria-describedby="pincode-status"
            className="h-11 w-full rounded-sm border border-white/15 bg-ink-850 pl-9 pr-3 font-mono text-sm outline-none focus:border-proof-400"
          />
        </div>
        <button type="submit" className="h-11 rounded-sm bg-bone-100 px-4 text-sm font-semibold text-ink-950 disabled:opacity-50" disabled={state.kind === 'loading'}>
          {state.kind === 'loading' ? 'Checking…' : 'Check'}
        </button>
      </div>
      <p id="pincode-status" className="mt-2 min-h-5 text-sm" aria-live="polite">
        {state.kind === 'ok' && state.date && (
          <span className="text-proof-400">
            Delivery by <strong>{formatDate(state.date)}</strong> <span className="opacity-70">(2-hour delivery where available)</span>
          </span>
        )}
        {state.kind === 'no' && <span className="text-amber-signal">{TOAST_COPY.pincode}</span>}
        {state.kind === 'invalid' && <span className="text-blaze-300">Enter a valid 6-digit pincode.</span>}
        {state.kind === 'idle' && <span className="opacity-50">Try {DEMO_UNSERVICEABLE} to see the unserviceable state.</span>}
      </p>
    </form>
  );
}
