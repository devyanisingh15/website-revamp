import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Article } from '@/data/blog';
import { Ph } from '../ui/Placeholder';
import { cx } from '@/lib/format';

/** Generated editorial cover — placeholder until Fit Hub photography exists. */
export function ArticleCover({ motif, className }: { motif: Article['motif']; className?: string }) {
  const lines = Array.from({ length: 9 });
  return (
    <svg viewBox="0 0 400 260" className={cx('size-full', className)} aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="260" fill="#161618" />
      {lines.map((_, i) => (
        <line key={i} x1={i * 50} x2={i * 50} y1="0" y2="260" stroke="#fff" strokeOpacity=".04" />
      ))}
      {motif === 'split' && (
        <>
          <rect x="60" y="50" width="130" height="160" fill="#e8202a" />
          <rect x="210" y="50" width="130" height="160" fill="none" stroke="#f2efe9" strokeWidth="2" />
        </>
      )}
      {motif === 'grid' && Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={70 + (i % 10) * 29} cy={70 + Math.floor(i / 10) * 40} r={i < 27 ? 8 : 4} fill={i < 27 ? '#e8202a' : '#f2efe9'} opacity={i < 27 ? 1 : 0.4} />)}
      {motif === 'cross' && (
        <>
          <path d="M140 70 L260 190 M260 70 L140 190" stroke="#e8202a" strokeWidth="18" strokeLinecap="square" />
          <circle cx="200" cy="130" r="90" fill="none" stroke="#f2efe9" strokeOpacity=".3" strokeWidth="2" />
        </>
      )}
      {motif === 'stack' && [0, 1, 2].map((i) => <rect key={i} x={110 + i * 20} y={160 - i * 45} width="180" height="34" fill={i === 2 ? '#e8202a' : '#f2efe9'} opacity={1 - i * 0.2} />)}
      {motif === 'leaf' && <path d="M120 200 Q120 70 290 60 Q280 220 120 200 Z M120 200 L240 110" fill="#9bb36a" stroke="#161618" strokeWidth="4" />}
      {motif === 'scan' && (
        <>
          <rect x="130" y="50" width="140" height="160" fill="none" stroke="#f2efe9" strokeWidth="2" />
          <line x1="110" x2="290" y1="130" y2="130" stroke="#46e891" strokeWidth="4" />
          <rect x="160" y="80" width="80" height="40" fill="#f2efe9" opacity=".2" />
        </>
      )}
      {motif === 'bolt' && <path d="M215 40 L140 145 H195 L180 220 L265 110 H210 Z" fill="#ffb547" />}
      {motif === 'clock' && (
        <>
          <circle cx="200" cy="130" r="80" fill="none" stroke="#f2efe9" strokeWidth="3" />
          <path d="M200 130 L200 75 M200 130 L245 150" stroke="#e8202a" strokeWidth="8" strokeLinecap="round" />
          <path d="M200 50 A80 80 0 0 1 280 130 L200 130 Z" fill="#e8202a" opacity=".25" />
        </>
      )}
    </svg>
  );
}

export function ArticleCard({ article, tone = 'dark', size = 'md' }: { article: Article; tone?: 'dark' | 'light'; size?: 'md' | 'lg' }) {
  return (
    <article className="group relative">
      <div className={cx('overflow-hidden rounded-md', size === 'lg' ? 'aspect-[16/10]' : 'aspect-[4/3]')}>
        <ArticleCover motif={article.motif} className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
      </div>
      <div className="mt-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider opacity-70">
        <span className="text-blaze-500">{article.topic}</span>
        <span aria-hidden>·</span>
        <span>{article.readMinutes ? `${article.readMinutes} min read` : <Ph label="read time">[x] min read</Ph>}</span>
      </div>
      <h3 className={cx('mt-2 font-bold leading-snug tracking-tight', size === 'lg' ? 'text-2xl md:text-3xl' : 'text-lg')}>
        <Link to={`/fit-hub/${article.slug}`} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </h3>
      <ArrowUpRight className={cx('absolute right-3 top-3 size-9 rounded-full p-2 opacity-0 transition-opacity group-hover:opacity-100', tone === 'dark' ? 'bg-bone-100 text-ink-950' : 'bg-ink-950 text-bone-100')} aria-hidden />
    </article>
  );
}
