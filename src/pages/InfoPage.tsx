import { useSeo } from '@/hooks/useSeo';
import { INFO_PAGES } from '@/data/pages';
import { CopyBody } from '@/components/content/CopyBody';

const PAGES: Record<string, string> = { careers: 'Careers', press: 'Press' };

export default function InfoPage({ page }: { page: string }) {
  const title = PAGES[page] ?? page;
  useSeo({ title: `${title}, MuscleBlaze`, description: INFO_PAGES[page]?.intro ?? `${title} at MuscleBlaze.` });
  return (
    <div className="bg-ink-950">
      <div className="container-x max-w-4xl py-16 md:py-24">
        <h1 className="display text-display-lg">{title}</h1>
        {INFO_PAGES[page] && <CopyBody page={INFO_PAGES[page]} />}
      </div>
    </div>
  );
}
