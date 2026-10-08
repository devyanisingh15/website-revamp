import { CircleCheck, CircleX, Info, AlertTriangle, X } from 'lucide-react';
import { useToast, type ToastTone } from '@/lib/toast';
import { cx } from '@/lib/format';

const icon: Record<ToastTone, typeof Info> = { success: CircleCheck, error: CircleX, info: Info, warning: AlertTriangle };
const tone: Record<ToastTone, string> = {
  success: 'text-proof-400',
  error: 'text-blaze-400',
  info: 'text-bone-100',
  warning: 'text-amber-signal',
};

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-4 sm:bottom-4 sm:right-4 sm:left-auto sm:items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => {
        const Icon = icon[t.tone];
        return (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-3 rounded-md border hairline bg-ink-800/95 p-4 pr-3 text-bone-100 shadow-[var(--shadow-lift)] backdrop-blur"
          >
            <Icon className={cx('mt-0.5 size-5 shrink-0', tone[t.tone])} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.body && <p className="mt-0.5 text-sm opacity-70">{t.body}</p>}
              {t.action && (
                <button
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="mt-2 text-sm font-semibold text-proof-400 underline-offset-4 hover:underline"
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button onClick={() => dismiss(t.id)} className="grid size-8 place-items-center rounded-sm opacity-60 hover:bg-white/10 hover:opacity-100" aria-label="Dismiss notification">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
