import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ARTICLES } from '@/data/blog';
import { ArticleCard } from '@/components/blog/ArticleCard';

export function FitHubTeaser() {
  return (
    <section aria-labelledby="fithub-title" className="border-t hairline bg-ink-950 py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="fithub-title" className="display text-display-lg">
            Train Smarter
          </h2>
          <Link to="/fit-hub" className="group inline-flex items-center gap-2 font-semibold">
            Visit Fit Hub <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          {[ARTICLES[0], ARTICLES[1], ARTICLES[5]].map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
