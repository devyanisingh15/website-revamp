import { useSyncExternalStore } from 'react';

function subscribeMQ(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  };
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(subscribeMQ(query), () => window.matchMedia(query).matches, () => false);
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');
