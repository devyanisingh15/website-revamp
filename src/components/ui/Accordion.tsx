import { useId, useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cx } from '@/lib/format';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

/** WAI-ARIA accordion: buttons with aria-expanded controlling labelled regions. */
export function Accordion({ items, tone = 'dark', defaultOpen }: { items: AccordionItem[]; tone?: 'dark' | 'light'; defaultOpen?: string }) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const uid = useId();
  return (
    <div className={cx('border-t', tone === 'dark' ? 'hairline' : 'hairline-dark')}>
      {items.map((it) => {
        const isOpen = open === it.id;
        const btnId = `${uid}-${it.id}-btn`;
        const panelId = `${uid}-${it.id}-panel`;
        return (
          <div key={it.id} className={cx('border-b', tone === 'dark' ? 'hairline' : 'hairline-dark')}>
            <h3>
              <button
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : it.id)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-semibold md:text-lg"
              >
                <span>{it.title}</span>
                <Plus
                  aria-hidden
                  className={cx('size-5 shrink-0 transition-transform duration-300', isOpen && 'rotate-45 text-blaze-500')}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="pb-6 pr-10 text-[15px] leading-relaxed opacity-80"
            >
              {it.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
