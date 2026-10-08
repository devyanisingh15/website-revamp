import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cx } from '@/lib/format';

/**
 * Modal / drawer with focus trap, Escape to close, scroll lock and focus
 * restore. `side` turns it into a drawer.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  side,
  className,
  hideTitle,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: 'left' | 'right' | 'bottom';
  className?: string;
  hideTitle?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>('[data-autofocus], button, a, input, select, textarea');
      first?.focus();
    }, 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab' && panel.current) {
        const f = Array.from(
          panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'),
        ).filter((el) => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      restore.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const pos =
    side === 'left'
      ? 'left-0 top-0 h-full w-[min(420px,92vw)] animate-[slide-l_.35s_var(--ease-out-expo)]'
      : side === 'right'
        ? 'right-0 top-0 h-full w-[min(460px,94vw)] animate-[slide-r_.35s_var(--ease-out-expo)]'
        : side === 'bottom'
          ? 'bottom-0 left-0 max-h-[88vh] w-full rounded-t-lg animate-[slide-b_.35s_var(--ease-out-expo)]'
          : 'left-1/2 top-1/2 max-h-[90vh] w-[min(960px,94vw)] -translate-x-1/2 -translate-y-1/2 rounded-md animate-rise';

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx('absolute flex flex-col overflow-hidden bg-ink-900 text-bone-100 shadow-[var(--shadow-lift)]', pos, className)}
      >
        <div className={cx('flex items-center justify-between border-b hairline px-5 py-4', hideTitle && 'sr-only')}>
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="-mr-2 grid size-10 place-items-center rounded-sm hover:bg-white/10" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
      <style>{`
        @keyframes slide-l { from { transform: translateX(-100%) } }
        @keyframes slide-r { from { transform: translateX(100%) } }
        @keyframes slide-b { from { transform: translateY(100%) } }
      `}</style>
    </div>,
    document.body,
  );
}
