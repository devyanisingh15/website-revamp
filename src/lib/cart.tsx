import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { getPrice, FREE_DELIVERY_THRESHOLD } from '@/mocks/pricing';
import { getProduct } from '@/data/products';
import { readJSON, writeJSON } from './storage';

export interface CartLine {
  key: string;
  productId: string;
  flavourId: string | null;
  sizeId: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  coupon: { code: string; pct: number } | null;
}

type Action =
  | { type: 'add'; line: Omit<CartLine, 'key' | 'qty'>; qty: number }
  | { type: 'qty'; key: string; qty: number }
  | { type: 'remove'; key: string }
  | { type: 'coupon'; coupon: CartState['coupon'] }
  | { type: 'clear' };

const lineKey = (l: Omit<CartLine, 'key' | 'qty'>) => `${l.productId}|${l.flavourId ?? '-'}|${l.sizeId}`;
const MAX_QTY = 10;

function reducer(state: CartState, a: Action): CartState {
  switch (a.type) {
    case 'add': {
      const key = lineKey(a.line);
      const existing = state.lines.find((l) => l.key === key);
      const lines = existing
        ? state.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + a.qty) } : l))
        : [...state.lines, { ...a.line, key, qty: a.qty }];
      return { ...state, lines };
    }
    case 'qty':
      return {
        ...state,
        lines: state.lines.map((l) => (l.key === a.key ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, a.qty)) } : l)),
      };
    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.key !== a.key) };
    case 'coupon':
      return { ...state, coupon: a.coupon };
    case 'clear':
      return { lines: [], coupon: null };
  }
}

const STORAGE_KEY = 'mb.cart.v1';

export function lineUnitPrice(l: Pick<CartLine, 'productId' | 'sizeId'>) {
  return getPrice(l.productId, l.sizeId)?.price ?? 0;
}

function useCartValue() {
  const [state, dispatch] = useReducer(reducer, undefined, () => readJSON<CartState>(STORAGE_KEY, { lines: [], coupon: null }));

  useEffect(() => writeJSON(STORAGE_KEY, state), [state]);

  // Keep only lines whose product still exists (catalogue may change)
  const lines = useMemo(() => state.lines.filter((l) => getProduct(l.productId)), [state.lines]);

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + lineUnitPrice(l) * l.qty, 0);
    const mrpTotal = lines.reduce((s, l) => s + (getPrice(l.productId, l.sizeId)?.mrp ?? 0) * l.qty, 0);
    const discount = state.coupon ? Math.round((subtotal * state.coupon.pct) / 100) : 0;
    const afterDiscount = subtotal - discount;
    const freeDelivery = afterDiscount >= FREE_DELIVERY_THRESHOLD || lines.length === 0;
    // Delivery fee is not specified in the document — 0 until the shipping API decides it
    const delivery = 0;
    return {
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal,
      mrpTotal,
      discount,
      delivery,
      freeDelivery,
      awayFromFree: Math.max(0, FREE_DELIVERY_THRESHOLD - afterDiscount),
      total: afterDiscount + delivery,
    };
  }, [lines, state.coupon]);

  const add = useCallback(
    (line: Omit<CartLine, 'key' | 'qty'>, qty = 1) => dispatch({ type: 'add', line, qty }),
    [],
  );
  const setQty = useCallback((key: string, qty: number) => dispatch({ type: 'qty', key, qty }), []);
  const remove = useCallback((key: string) => dispatch({ type: 'remove', key }), []);
  const setCoupon = useCallback((coupon: CartState['coupon']) => dispatch({ type: 'coupon', coupon }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  return { lines, coupon: state.coupon, totals, add, setQty, remove, setCoupon, clear, maxQty: MAX_QTY };
}

type CartCtx = ReturnType<typeof useCartValue>;
const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const value = useCartValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCart outside CartProvider');
  return v;
}
