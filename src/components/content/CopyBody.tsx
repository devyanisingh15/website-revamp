import type { CopyPage } from '@/data/pages';
import { MockTag } from '../ui/Placeholder';

/** Renders a policy / info page from src/data/pages.ts (MOCK copy until the CMS is connected). */
export function CopyBody({ page }: { page: CopyPage }) {
  return (
    <div className="mt-8">
      <p className="flex flex-wrap items-center gap-3 text-sm text-bone-400">
        <MockTag>Sample copy</MockTag>
        {page.updated && <span>Last updated {new Date(page.updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
      </p>
      <p className="mt-6 text-lede text-bone-200">{page.intro}</p>
      <div className="mt-10 space-y-10">
        {page.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="display-tight text-2xl">{s.heading}</h2>
            {s.paragraphs?.map((p, i) => (
              <p key={i} className="mt-3 leading-relaxed text-bone-300">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-bone-300 marker:text-blaze-500">
                {s.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
