import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { readJSON, writeJSON } from './storage';

export const MAX_COMPARE = 3;

function useCompareValue() {
  const [ids, setIds] = useState<string[]>(() => readJSON<string[]>('mb.compare', []));
  const [open, setOpen] = useState(false);
  useEffect(() => writeJSON('mb.compare', ids), [ids]);

  const toggle = useCallback(
    (id: string): 'added' | 'removed' | 'full' => {
      if (ids.includes(id)) {
        setIds((cur) => cur.filter((x) => x !== id));
        return 'removed';
      }
      if (ids.length >= MAX_COMPARE) return 'full';
      setIds((cur) => (cur.includes(id) ? cur : [...cur, id]));
      return 'added';
    },
    [ids],
  );
  const clear = useCallback(() => setIds([]), []);
  return { ids, toggle, clear, has: (id: string) => ids.includes(id), open, setOpen };
}

type Ctx = ReturnType<typeof useCompareValue>;
const CompareCtx = createContext<Ctx | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  return <CompareCtx.Provider value={useCompareValue()}>{children}</CompareCtx.Provider>;
}

export function useCompare() {
  const v = useContext(CompareCtx);
  if (!v) throw new Error('useCompare outside CompareProvider');
  return v;
}
