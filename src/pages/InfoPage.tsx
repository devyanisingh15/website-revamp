import { useSeo } from '@/hooks/useSeo';

const PAGES: Record<string, string> = { careers: 'Careers', press: 'Press' };

export default function InfoPage({ page }: { page: string }) {
  const title = PAGES[page] ?? page;
  useSeo({ title: `${title}, MuscleBlaze`, description: `${title} at MuscleBlaze.` });
  return (
    <div className="bg-ink-950">
      <div className="container-x max-w-4xl py-16 md:py-24">
        <h1 className="display text-display-lg">{title}</h1>
        <div className="mt-10 rounded-md border border-dashed border-amber-signal/40 p-8">
          <p className="eyebrow text-amber-signal">Content placeholder</p>
          <p className="mt-3 text-bone-300">{title} content will be supplied by the MuscleBlaze team.</p>
        </div>
      </div>
    </div>
  );
}
