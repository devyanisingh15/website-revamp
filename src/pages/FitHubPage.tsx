import { useState } from 'react';
import { ARTICLES } from '@/data/blog';
import { SEO } from '@/data/seo';
import { useSeo } from '@/hooks/useSeo';
import { ArticleCard } from '@/components/blog/ArticleCard';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { cx } from '@/lib/format';

export default function FitHubPage() {
  useSeo(SEO.fitHub);
  const topics = ['All', ...Array.from(new Set(ARTICLES.map((a) => a.topic)))];
  const [topic, setTopic] = useState('All');
  const list = topic === 'All' ? ARTICLES : ARTICLES.filter((a) => a.topic === topic);
  const [lead, ...rest] = list;

  return (
    <div className="bg-ink-950">
      <header className="container-x py-16 md:py-24">
        <p className="eyebrow text-bone-400">Fit Hub</p>
        <h1 className="display mt-4 text-display-xl">Train Smarter</h1>
        <div role="group" aria-label="Filter by topic" className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {topics.map((t) => (
            <button key={t} aria-pressed={topic === t} onClick={() => setTopic(t)} className={cx('shrink-0 rounded-full border px-4 py-2 text-sm font-semibold', topic === t ? 'border-bone-100 bg-bone-100 text-ink-950' : 'border-white/15 text-bone-300 hover:border-white/50')}>
              {t}
            </button>
          ))}
        </div>
      </header>
      <div className="container-x pb-20">
        {lead && (
          <div className="border-b hairline pb-14">
            <ArticleCard article={lead} size="lg" />
          </div>
        )}
        <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <li key={a.slug}>
              <ArticleCard article={a} />
            </li>
          ))}
        </ul>
      </div>
      <section className="border-t hairline bg-blaze-500 py-16 text-white">
        <div className="container-x grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="display text-display-sm">Get Stronger Emails</h2>
            <p className="mt-3 text-white/85">Training tips, new flavours and members-only offers. No spam, only gains.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
