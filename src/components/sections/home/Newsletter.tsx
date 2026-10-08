import { NewsletterForm } from '@/components/forms/NewsletterForm';

export function Newsletter() {
  return (
    <section aria-labelledby="nl-title" className="relative overflow-hidden bg-blaze-500 py-20 text-white md:py-28">
      <p aria-hidden className="display pointer-events-none absolute -bottom-6 right-0 select-none whitespace-nowrap text-[18vw] leading-none text-black/10">
        07 · OFFER
      </p>
      <div className="container-x relative grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-6">
          <h2 id="nl-title" className="display text-display-lg">
            Get Stronger Emails
          </h2>
          <p className="mt-5 max-w-[40ch] text-lede text-white/85">Training tips, new flavours and members-only offers. No spam, only gains.</p>
        </div>
        <div className="lg:col-span-6">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
