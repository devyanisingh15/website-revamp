import { useEffect, useRef, useState } from 'react';

/** Tracks visibility; used to pause 3D canvases and trigger entrance moments. */
export function useInView<T extends Element>(opts: { rootMargin?: string; once?: boolean; threshold?: number } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const { rootMargin = '0px', once = false, threshold = 0 } = opts;
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting && once) io.disconnect();
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, once, threshold]);
  return [ref, inView] as const;
}
