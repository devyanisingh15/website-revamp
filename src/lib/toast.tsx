import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export type ToastTone = 'success' | 'info' | 'error' | 'warning';

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void };
}

interface Ctx {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const id = useRef(0);
  const dismiss = useCallback((tid: number) => setToasts((ts) => ts.filter((t) => t.id !== tid)), []);
  const push = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const tid = ++id.current;
      setToasts((ts) => [...ts.slice(-2), { ...t, id: tid }]);
      window.setTimeout(() => dismiss(tid), t.action ? 7000 : 4200);
    },
    [dismiss],
  );
  return <ToastCtx.Provider value={{ toasts, push, dismiss }}>{children}</ToastCtx.Provider>;
}

export function useToast() {
  const v = useContext(ToastCtx);
  if (!v) throw new Error('useToast outside ToastProvider');
  return v;
}

/** Toast copy from the content document */
export const TOAST_COPY = {
  added: 'Added! Ready when you are.',
  outOfStock: 'Sold out in this flavour. Notify me when it’s back.',
  pincode: 'We don’t deliver here yet. Try a nearby pincode.',
  paymentFailed: 'Payment didn’t go through. No money was taken. Try again.',
};
