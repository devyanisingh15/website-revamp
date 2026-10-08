import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ARTICLES, getArticle } from '@/data/blog';
import { getProduct } from '@/data/products';
import { useSeo } from '@/hooks/useSeo';
import { SEO } from '@/data/seo';
import { ArticleCard, ArticleCover } from '@/components/blog/ArticleCard';
import { ProductCard } from '@/components/product/ProductCard';
import { Ph } from '@/components/ui/Placeholder';
import { EXPERT } from '@/data/goals';
import type { Product } from '@/data/types';
import NotFoundPage from './NotFoundPage';

export default function ArticlePage() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;
  useSeo(article ? { title: article.title.slice(0, 59), description: `${article.title} — Fit Hub by MuscleBlaze.` } : { ...SEO.notFound, noindex: true });
  if (!article) return <NotFoundPage />;
  const related = article.relatedProductIds.map(getProduct).filter(Boolean) as Product[];
  const more = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <article className="bg-ink-950">
      <header className="container-x max-w-4xl py-12 md:py-20">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-bone-400">
          <Link to="/fit-hub" className="hover:text-white">Fit Hub</Link>
          <ChevronRight className="size-3" aria-hidden />
          <span className="text-blaze-500">{article.topic}</span>
        </nav>
        <h1 className="display-tight mt-6 text-[clamp(2.2rem,1.4rem+3vw,4.2rem)] leading-[1.02]">{article.title}</h1>
        <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-wider text-bone-400">
          <span>
            By <Ph label="author">[Author]</Ph>
          </span>
          <span>
            <Ph label="publish date">[date]</Ph>
          </span>
          <span>
            <Ph label="read time">[x] min read</Ph>
          </span>
        </p>
      </header>
      <div className="container-x max-w-5xl">
        <div className="aspect-[16/8] overflow-hidden rounded-md">
          <ArticleCover motif={article.motif} />
        </div>
      </div>
      <div className="container-x max-w-3xl py-16">
        <div className="rounded-md border border-dashed border-amber-signal/40 p-8">
          <p className="eyebrow text-amber-signal">Content placeholder</p>
          <p className="mt-3 text-lede text-bone-300">The article body for “{article.title}” will be supplied by the Fit Hub editorial team. This template renders long-form content, pull quotes and inline product cards.</p>
        </div>
        <p className="mt-8 text-sm text-bone-400">
          {EXPERT.note}: {EXPERT.name ?? <Ph>[Name]</Ph>}, {EXPERT.credential ?? <Ph>[Credential]</Ph>}
        </p>
      </div>
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="surface-bone py-16">
          <div className="container-x">
            <h2 id="related-title" className="display text-display-sm">
              Mentioned in this article
            </h2>
            <ul className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} tone="light" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <section aria-labelledby="more-title" className="py-16">
        <div className="container-x">
          <h2 id="more-title" className="display text-display-sm">
            Keep Reading
          </h2>
          <ul className="mt-10 grid gap-10 md:grid-cols-3">
            {more.map((a) => (
              <li key={a.slug}>
                <ArticleCard article={a} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
