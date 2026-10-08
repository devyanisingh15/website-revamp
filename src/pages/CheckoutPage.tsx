import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Check, Smartphone, CreditCard, Landmark, Wallet, Banknote, ArrowLeft, PartyPopper, AlertTriangle } from 'lucide-react';
import { Logo } from '@/components/navigation/Logo';
import { Field } from '@/components/ui/Field';
import { Button, ButtonLink } from '@/components/ui/Button';
import { MockTag } from '@/components/ui/Placeholder';
import { ProductArt } from '@/components/product/ProductArt';
import { useCart, lineUnitPrice } from '@/lib/cart';
import { getProduct } from '@/data/products';
import { SITE } from '@/data/site';
import { SEO } from '@/data/seo';
import { useSeo } from '@/hooks/useSeo';
import { checkPincode, isValidPincode } from '@/lib/api/delivery';
import { placeOrder, DEMO_FAIL_UPI, type Address, type Order, type PaymentMethod } from '@/lib/api/orders';
import { useToast, TOAST_COPY } from '@/lib/toast';
import { formatINR, formatDate, cx } from '@/lib/format';
import { OrderSummary } from '@/components/ecommerce/OrderSummary';

const STEPS = ['Address', 'Payment', 'Review'] as const;
const PAYMENTS: { id: PaymentMethod; label: string; Icon: typeof Smartphone }[] = [
  { id: 'upi', label: 'UPI', Icon: Smartphone },
  { id: 'card', label: 'Cards', Icon: CreditCard },
  { id: 'netbanking', label: 'Net Banking', Icon: Landmark },
  { id: 'wallet', label: 'Wallets', Icon: Wallet },
  { id: 'cod', label: 'Cash on Delivery', Icon: Banknote },
];
const EMPTY: Address = { name: '', phone: '', pincode: '', line1: '', line2: '', city: '', state: '' };

function validate(a: Address) {
  const e: Partial<Record<keyof Address, string>> = {};
  if (a.name.trim().length < 2) e.name = 'Enter your full name.';
  if (!/^[6-9]\d{9}$/.test(a.phone)) e.phone = 'Enter a valid 10-digit mobile number.';
  if (!isValidPincode(a.pincode)) e.pincode = 'Enter a valid 6-digit pincode.';
  if (a.line1.trim().length < 4) e.line1 = 'Enter your house number and street.';
  if (!a.city.trim()) e.city = 'Enter your city.';
  if (!a.state.trim()) e.state = 'Enter your state.';
  return e;
}

export default function CheckoutPage() {
  useSeo({ ...SEO.checkout, noindex: true });
  const { lines, totals, clear } = useCart();
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState<Address>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [checking, setChecking] = useState(false);
  const [pay, setPay] = useState<PaymentMethod>('upi');
  const [upi, setUpi] = useState('');
  const [upiErr, setUpiErr] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [payFailed, setPayFailed] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => setAddr((a) => ({ ...a, [k]: k === 'phone' || k === 'pincode' ? e.target.value.replace(/\D/g, '') : e.target.value }));

  const submitAddress = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(addr);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`addr-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setChecking(true);
    const r = await checkPincode(addr.pincode);
    setChecking(false);
    if (!r.ok) {
      setErrors({ pincode: TOAST_COPY.pincode });
      push({ tone: 'warning', title: TOAST_COPY.pincode });
      document.getElementById('addr-pincode')?.focus();
      return;
    }
    setStep(1);
  };

  const submitPayment = (e: FormEvent) => {
    e.preventDefault();
    if (pay === 'upi' && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(upi.trim())) {
      setUpiErr('Enter a valid UPI ID, like name@bank.');
      return;
    }
    setUpiErr(null);
    setPayFailed(false);
    setStep(2);
  };

  const place = async () => {
    setPlacing(true);
    setPayFailed(false);
    try {
      const o = await placeOrder({ lines, total: totals.total, address: addr, payment: pay }, upi);
      setOrder(o);
      clear();
      window.scrollTo({ top: 0 });
    } catch {
      setPayFailed(true);
      push({ tone: 'error', title: TOAST_COPY.paymentFailed });
    } finally {
      setPlacing(false);
    }
  };

  const topBar = (
    <header className="border-b hairline">
      <div className="container-x flex h-16 items-center justify-between">
        <Logo />
        <p className="flex items-center gap-2 text-sm text-bone-300">
          <Lock className="size-4 text-proof-400" aria-hidden /> Secure checkout
        </p>
      </div>
    </header>
  );

  if (order) {
    return (
      <>
        {topBar}
        <div className="container-x max-w-2xl py-20 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-proof-400 text-ink-950 animate-pulse-ring">
            <PartyPopper className="size-9" aria-hidden />
          </span>
          <h1 className="display mt-8 text-display-md">Order placed!</h1>
          <p className="mt-4 text-lede text-bone-300" role="status">
            Your protein is on its way. Order #{order.id} arrives by {formatDate(new Date(order.eta))}.
          </p>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-bone-400">
            <MockTag>Demo order</MockTag> No payment was taken and nothing was shipped.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink to={`/track-order?id=${order.id}`} size="lg">
              Track order
            </ButtonLink>
            <ButtonLink to="/" size="lg" variant="secondary">
              Back to Home
            </ButtonLink>
          </div>
        </div>
      </>
    );
  }

  if (lines.length === 0) {
    return (
      <>
        {topBar}
        <div className="container-x py-24 text-center">
          <h1 className="display text-display-md">Your Cart</h1>
          <p className="mt-4 text-bone-300">Your cart’s lighter than your warm-up set.</p>
          <ButtonLink to="/#bestsellers" className="mt-8" size="lg">
            Shop Bestsellers
          </ButtonLink>
        </div>
      </>
    );
  }

  return (
    <>
      {topBar}
      <div className="border-b border-amber-signal/30 bg-amber-signal/10 py-2 text-center text-xs text-amber-signal">Concept build — payment and order processing are mocked. No money is taken.</div>
      <div className="container-x grid gap-10 py-10 lg:grid-cols-12 lg:py-14">
        <div className="lg:col-span-7">
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-bone-400 hover:text-white">
            <ArrowLeft className="size-4" aria-hidden /> Back to cart
          </Link>
          {/* Stepper */}
          <ol className="mt-6 flex items-center gap-2" aria-label="Checkout steps">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-2" aria-current={i === step ? 'step' : undefined}>
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => i < step && setStep(i)}
                  className={cx('flex items-center gap-2 text-sm font-semibold', i === step ? 'text-white' : i < step ? 'text-proof-400' : 'text-bone-600')}
                >
                  <span className={cx('grid size-7 place-items-center rounded-full border font-mono text-xs', i < step ? 'border-proof-400 bg-proof-400 text-ink-950' : i === step ? 'border-white' : 'border-white/20')}>
                    {i < step ? <Check className="size-4" aria-hidden /> : i + 1}
                  </span>
                  {s}
                </button>
                {i < STEPS.length - 1 && <span className={cx('h-px flex-1', i < step ? 'bg-proof-400' : 'bg-white/15')} aria-hidden />}
              </li>
            ))}
          </ol>

          {step === 0 && (
            <form onSubmit={submitAddress} noValidate className="mt-10 grid gap-5 sm:grid-cols-2">
              <h1 className="display-tight text-3xl sm:col-span-2">Delivery address</h1>
              <Field id="addr-name" label="Full name" autoComplete="name" value={addr.name} onChange={set('name')} error={errors.name} />
              <Field id="addr-phone" label="Mobile number" autoComplete="tel-national" inputMode="numeric" maxLength={10} value={addr.phone} onChange={set('phone')} error={errors.phone} hint="For delivery updates" />
              <Field id="addr-pincode" label="Pincode" autoComplete="postal-code" inputMode="numeric" maxLength={6} value={addr.pincode} onChange={set('pincode')} error={errors.pincode} hint="Try 999999 to see the unserviceable state" />
              <Field id="addr-city" label="City" autoComplete="address-level2" value={addr.city} onChange={set('city')} error={errors.city} />
              <Field id="addr-line1" label="House no., street" autoComplete="address-line1" value={addr.line1} onChange={set('line1')} error={errors.line1} className="sm:col-span-2" />
              <Field id="addr-line2" label="Area, landmark (optional)" autoComplete="address-line2" value={addr.line2} onChange={set('line2')} className="sm:col-span-2" />
              <Field id="addr-state" label="State" autoComplete="address-level1" value={addr.state} onChange={set('state')} error={errors.state} />
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" loading={checking}>
                  Continue to payment
                </Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={submitPayment} noValidate className="mt-10">
              <h1 className="display-tight text-3xl">Payment</h1>
              <fieldset className="mt-6">
                <legend className="sr-only">Payment method</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PAYMENTS.map(({ id, label, Icon }) => (
                    <label key={id} className={cx('flex min-h-16 cursor-pointer items-center gap-4 rounded-sm border px-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-proof-400', pay === id ? 'border-bone-100 bg-white/[0.04]' : 'border-white/15 hover:border-white/40')}>
                      <input type="radio" name="pay" value={id} checked={pay === id} onChange={() => setPay(id)} className="size-4 accent-blaze-500" />
                      <Icon className="size-5" aria-hidden />
                      <span className="font-semibold">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-6">
                {pay === 'upi' && <Field label="UPI ID" value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="name@bank" error={upiErr} hint={`Use ${DEMO_FAIL_UPI} to simulate a failed payment.`} autoComplete="off" />}
                {(pay === 'card' || pay === 'netbanking' || pay === 'wallet') && (
                  <p className="rounded-sm border hairline p-4 text-sm text-bone-300">You’ll complete {PAYMENTS.find((p) => p.id === pay)!.label.toLowerCase()} payment on the payment gateway’s secure page. <MockTag className="ml-1">Gateway not connected</MockTag></p>
                )}
                {pay === 'cod' && <p className="rounded-sm border hairline p-4 text-sm text-bone-300">Pay in cash when your order arrives.</p>}
              </div>
              <Button type="submit" size="lg" className="mt-8">
                Review order
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="mt-10">
              <h1 className="display-tight text-3xl">Review</h1>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-sm border hairline p-4">
                  <dt className="flex justify-between text-xs text-bone-400">
                    Deliver to
                    <button className="underline" onClick={() => setStep(0)}>Edit</button>
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed">
                    {addr.name}
                    <br />
                    {addr.line1}
                    {addr.line2 && `, ${addr.line2}`}
                    <br />
                    {addr.city}, {addr.state} {addr.pincode}
                    <br />
                    {addr.phone}
                  </dd>
                </div>
                <div className="rounded-sm border hairline p-4">
                  <dt className="flex justify-between text-xs text-bone-400">
                    Payment
                    <button className="underline" onClick={() => setStep(1)}>Edit</button>
                  </dt>
                  <dd className="mt-2 text-sm">
                    {PAYMENTS.find((p) => p.id === pay)!.label}
                    {pay === 'upi' && ` · ${upi}`}
                  </dd>
                </div>
              </dl>
              {payFailed && (
                <p role="alert" className="mt-6 flex items-center gap-3 rounded-sm border border-blaze-400/40 bg-blaze-500/10 p-4 text-sm">
                  <AlertTriangle className="size-5 shrink-0 text-blaze-300" aria-hidden /> {TOAST_COPY.paymentFailed}
                </p>
              )}
              <Button size="lg" className="mt-8" onClick={place} loading={placing} icon={<Lock className="size-4" />}>
                {payFailed ? 'Try again' : `Place order · ${formatINR(totals.total)}`}
              </Button>
            </div>
          )}

          <p className="mt-12 text-sm text-bone-400">{SITE.trustLine}</p>
        </div>

        <aside className="lg:col-span-4 lg:col-start-9" aria-label="Order summary">
          <div className="rounded-md border hairline bg-ink-900 p-6 lg:sticky lg:top-6">
            <h2 className="font-bold">In your order</h2>
            <ul className="mt-4 space-y-4">
              {lines.map((l) => {
                const p = getProduct(l.productId)!;
                const f = p.flavours.find((x) => x.id === l.flavourId);
                return (
                  <li key={l.key} className="flex items-center gap-3">
                    <span className="relative w-12 shrink-0 rounded-sm bg-ink-850 p-1.5">
                      <ProductArt art={p.art} band={f?.family === 'tbc' ? undefined : f?.color} shadow={false} />
                      <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-bone-100 font-mono text-[10px] text-ink-950">{l.qty}</span>
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{p.shortName}</span>
                    <span className="font-mono text-sm">{formatINR(lineUnitPrice(l) * l.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 border-t hairline pt-5">
              <OrderSummary compact />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
