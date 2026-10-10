import { useState, type FormEvent } from 'react';
import { Mail, Phone, Check } from 'lucide-react';
import { SEO } from '@/data/seo';
import { SITE } from '@/data/site';
import { useSeo } from '@/hooks/useSeo';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { MockTag } from '@/components/ui/Placeholder';
import { isValidEmail } from '@/lib/api/newsletter';
import { wait } from '@/lib/api/mock';

export default function ContactPage() {
  useSeo(SEO.contact);
  const [form, setForm] = useState({ name: '', email: '', order: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = 'Enter your name.';
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) errs.message = 'Tell us a little more (at least 10 characters).';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState('loading');
    await wait(800); // MOCK — connect to the support ticketing API
    setState('done');
  };

  return (
    <div className="bg-ink-950">
      <div className="container-x grid gap-12 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-bone-400">Support</p>
          <h1 className="display mt-4 text-display-lg">Contact</h1>
          <ul className="mt-10 space-y-4">
            <li className="flex items-center gap-3">
              <Mail className="size-5 text-blaze-400" aria-hidden /> <a href={`mailto:${SITE.supportEmail}`} className="hover:underline">
                {SITE.supportEmail}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-5 text-blaze-400" aria-hidden /> <a href={`tel:${SITE.supportPhone.replace(/\s/g, '')}`} className="hover:underline">
                {SITE.supportPhone}
              </a>
            </li>
          </ul>
          <p className="mt-4 text-sm text-bone-400">{SITE.supportHours}</p>
          <p className="mt-10 text-sm text-bone-400">If your authenticity check failed, include the code and batch number so we can investigate.</p>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          {state === 'done' ? (
            <p role="status" className="flex items-center gap-3 rounded-md border border-proof-400/40 bg-proof-400/10 p-6 font-semibold">
              <Check className="size-5 text-proof-400" aria-hidden /> Thanks — we’ve got your message. <MockTag>Mock</MockTag>
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-5 rounded-md border hairline bg-ink-900 p-6 md:p-8">
              <Field label="Name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
              <Field label="Order number (optional)" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
              <div>
                <label htmlFor="msg" className="mb-1.5 block text-[13px] font-medium text-bone-200">
                  Message
                </label>
                <textarea id="msg" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={!!errors.message || undefined} aria-describedby={errors.message ? 'msg-err' : undefined} className="w-full rounded-sm border border-white/15 bg-ink-850 p-4 text-[15px] outline-none focus:border-proof-400" />
                {errors.message && (
                  <p id="msg-err" className="mt-1.5 text-xs font-medium text-blaze-300">
                    {errors.message}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" loading={state === 'loading'}>
                Send message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
