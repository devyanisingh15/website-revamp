import type { ReactNode } from 'react';
import { cx } from '@/lib/format';

/** Editorial section heading: mono index + eyebrow, display headline, optional body. */
export function SectionHeading({
  index,
  eyebrow,
  title,
  body,
  align = 'left',
  className,
  as: As = 'h2',
  size = 'lg',
  action,
}: {
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  size?: 'xl' | 'lg' | 'md' | 'sm';
  action?: ReactNode;
}) {
  const sz = { xl: 'text-display-xl', lg: 'text-display-lg', md: 'text-display-md', sm: 'text-display-sm' }[size];
  return (
    <div className={cx('flex flex-col gap-5', align === 'center' && 'items-center text-center', className)}>
      {(index || eyebrow) && (
        <p className="eyebrow flex items-center gap-3 opacity-70">
          {index && <span className="text-blaze-500">{index}</span>}
          {index && eyebrow && <span className="h-px w-8 bg-current opacity-40" aria-hidden />}
          {eyebrow && <span>{eyebrow}</span>}
        </p>
      )}
      <div className={cx('flex w-full flex-wrap items-end gap-6', align === 'center' ? 'justify-center' : 'justify-between')}>
        <As className={cx('display max-w-[16ch] text-balance', sz)}>{title}</As>
        {action}
      </div>
      {body && <p className={cx('max-w-[52ch] text-lede opacity-75', align === 'center' && 'mx-auto')}>{body}</p>}
    </div>
  );
}
