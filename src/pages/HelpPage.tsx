import { Link } from 'react-router-dom';
import { Package, RotateCcw, ShieldCheck, FileText, MessageCircle, ArrowRight } from 'lucide-react';
import { SEO } from '@/data/seo';
import { PRODUCT_FAQS } from '@/data/faqs';
import { useSeo } from '@/hooks/useSeo';
import { Accordion } from '@/components/ui/Accordion';

const TOPICS = [
  { Icon: Package, t: 'Track Order', to: '/track-order' },
  { Icon: RotateCcw, t: 'Returns', to: '/policies/returns' },
  { Icon: ShieldCheck, t: 'Check Authenticity', to: '/authenticity' },
  { Icon: FileText, t: 'Lab Reports', to: '/authenticity#lab-report' },
  { Icon: MessageCircle, t: 'Contact', to: '/contact' },
];

export default function HelpPage() {
  useSeo(SEO.help);
  return (
    <div className="bg-ink-950">
      <header className="container-x py-16 md:py-24">
        <p className="eyebrow text-bone-400">Track Order · Returns · FAQs · Contact</p>
        <h1 className="display mt-4 text-display-lg">Help Centre</h1>
        <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-md border hairline bg-white/10 md:grid-cols-5">
          {TOPICS.map(({ Icon, t, to }) => (
            <li key={t} className="bg-ink-950">
              <Link to={to} className="group flex h-full min-h-32 flex-col justify-between p-5 hover:bg-ink-900">
                <Icon className="size-6 text-blaze-400" aria-hidden />
                <span className="flex items-center justify-between font-semibold">
                  {t} <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </header>
      <section aria-labelledby="faqs-title" className="border-t hairline py-16 md:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <h2 id="faqs-title" className="display text-display-md lg:col-span-4">
            FAQs
          </h2>
          <div className="lg:col-span-8">
            <Accordion
              items={PRODUCT_FAQS.map((f, i) => ({
                id: `h-${i}`,
                title: f.q,
                content: (
                  <>
                    {f.a}{' '}
                    {f.link && (
                      <Link to={f.link.to} className="font-semibold text-bone-100 underline underline-offset-4">
                        {f.link.label} →
                      </Link>
                    )}
                  </>
                ),
              }))}
            />
            <p className="mt-8 text-sm text-bone-400">Order, delivery and returns FAQs will be added from the support knowledge base.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
