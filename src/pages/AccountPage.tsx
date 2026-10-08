import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Package, MapPin, LogOut, ArrowRight } from 'lucide-react';
import { SEO } from '@/data/seo';
import { SITE } from '@/data/site';
import { useSeo } from '@/hooks/useSeo';
import { listOrders } from '@/lib/api/orders';
import { readJSON, writeJSON } from '@/lib/storage';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { MockTag, Ph } from '@/components/ui/Placeholder';
import { OrderTimeline } from '@/components/ecommerce/OrderTimeline';
import { formatDate, formatINR } from '@/lib/format';

/** MOCK AUTH — no account system is connected. "Signing in" stores a flag locally. */
export default function AccountPage() {
  useSeo({ ...SEO.account, noindex: true });
  const [user, setUser] = useState<string | null>(() => readJSON<string | null>('mb.user', null));
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const orders = listOrders();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (!/^[6-9]\d{9}$/.test(phone)) return setErr('Enter a valid 10-digit mobile number.');
      setErr(null);
      setOtpSent(true);
      return;
    }
    if (!/^\d{4,6}$/.test(otp)) return setErr('Enter the OTP. Any 4–6 digits work in this demo.');
    writeJSON('mb.user', phone);
    setUser(phone);
  };

  if (!user) {
    return (
      <div className="bg-ink-950">
        <div className="container-x grid max-w-5xl gap-12 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="eyebrow text-bone-400">Account</p>
            <h1 className="display mt-4 text-display-md">Welcome back. Let’s get you fuelled.</h1>
          </div>
          <form onSubmit={submit} noValidate className="space-y-5 rounded-md border hairline bg-ink-900 p-6 md:p-8">
            <Field label="Mobile number" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} error={!otpSent ? err : null} disabled={otpSent} />
            {otpSent && <Field label="OTP" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} error={err} hint="Any 4–6 digits work in this demo." />}
            <Button type="submit" size="lg" block>
              {otpSent ? 'Verify & sign in' : 'Send OTP'}
            </Button>
            <p className="flex items-center gap-2 text-xs text-bone-400">
              <MockTag>Mock auth</MockTag> No OTP is sent. Connect the identity service before launch.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ink-950">
      <div className="container-x py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-bone-400">Account · +91 {user}</p>
            <h1 className="display mt-4 text-display-md">Your Account</h1>
          </div>
          <Button
            variant="secondary"
            icon={<LogOut className="size-4" />}
            onClick={() => {
              writeJSON('mb.user', null);
              setUser(null);
              setOtpSent(false);
              setOtp('');
            }}
          >
            Sign out
          </Button>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <section aria-labelledby="rewards-title" className="rounded-md border border-proof-400/30 bg-proof-400/[0.06] p-6">
            <h2 id="rewards-title" className="flex items-center gap-2 font-bold">
              <Gift className="size-5 text-proof-400" aria-hidden /> Rewards
            </h2>
            <p className="mt-4 text-sm text-bone-300">
              Earn {SITE.loyaltyProgrammeName} on every order {!SITE.loyaltyNameConfirmed && <MockTag className="ml-1">Name to confirm</MockTag>}
            </p>
            <p className="display-tight mt-6 text-4xl">
              <Ph label="rewards balance">[x]</Ph>
            </p>
            <p className="text-sm text-bone-400">{SITE.loyaltyProgrammeName} balance</p>
          </section>

          <section aria-labelledby="orders-title" className="rounded-md border hairline p-6 lg:col-span-2">
            <h2 id="orders-title" className="flex items-center gap-2 font-bold">
              <Package className="size-5" aria-hidden /> Orders
            </h2>
            {orders.length === 0 ? (
              <p className="mt-4 text-sm text-bone-400">
                No orders yet.{' '}
                <Link to="/shop" className="font-semibold text-bone-100 underline underline-offset-4">
                  Start shopping
                </Link>
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-white/10">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.id} className="py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <span className="font-semibold">#{o.id}</span>
                      <span className="text-bone-400">Placed {formatDate(new Date(o.createdAt))}</span>
                      <span className="font-mono">{formatINR(o.total)}</span>
                      <Link to={`/track-order?id=${o.id}`} className="inline-flex items-center gap-1 font-semibold">
                        Track <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </div>
                    <div className="mt-5">
                      <OrderTimeline status={o.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="addr-title" className="rounded-md border hairline p-6 lg:col-span-3">
            <h2 id="addr-title" className="flex items-center gap-2 font-bold">
              <MapPin className="size-5" aria-hidden /> Saved addresses
            </h2>
            <p className="mt-3 text-sm text-bone-400">{orders[0] ? `${orders[0].address.line1}, ${orders[0].address.city} ${orders[0].address.pincode}` : 'Addresses you use at checkout will appear here.'}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
