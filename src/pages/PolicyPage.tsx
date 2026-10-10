import { Link, useParams } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';
import { POLICY_PAGES } from '@/data/pages';
import { CopyBody } from '@/components/content/CopyBody';
import NotFoundPage from './NotFoundPage';

const POLICIES: Record<string, string> = { privacy: 'Privacy Policy', terms: 'Terms', returns: 'Return Policy' };

export default function PolicyPage() {
  const { policy = '' } = useParams();
  const title = POLICIES[policy];
  useSeo({ title: `${title ?? 'Policies'}, MuscleBlaze`, description: POLICY_PAGES[policy]?.intro ?? 'MuscleBlaze policies.' });
  if (!title) return <NotFoundPage />;
  return (
    <div className="bg-ink-950">
      <div className="container-x grid gap-10 py-16 md:py-24 lg:grid-cols-12">
        <nav aria-label="Policies" className="lg:col-span-3">
          <ul className="space-y-1">
            {Object.entries(POLICIES).map(([k, v]) => (
              <li key={k}>
                <Link to={`/policies/${k}`} aria-current={k === policy ? 'page' : undefined} className={`block rounded-sm px-3 py-2 text-sm ${k === policy ? 'bg-ink-800 font-semibold text-white' : 'text-bone-400 hover:text-white'}`}>
                  {v}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="max-w-3xl lg:col-span-8">
          <h1 className="display text-display-md">{title}</h1>
          <CopyBody page={POLICY_PAGES[policy]} />
        </article>
      </div>
    </div>
  );
}
