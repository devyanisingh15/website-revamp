import { useEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMedia';

/** Counts from 0 to `to` when scrolled into view. Final value is in the DOM for SR / no-JS. */
export function CountUp({ to, from = 0, duration = 1400, prefix = '', suffix = '', decimals = 0 }: { to: number; from?: number; duration?: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>({ once: true, threshold: 0.4 });
  const reduced = useReducedMotion();
  const [val, setVal] = useState(reduced ? to : from);
  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current || reduced) return;
    started.current = true;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - k, 4);
      setVal(from + (to - from) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    setVal(from);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, to, from, duration]);
  return (
    <span ref={ref} className="tabular-nums">
      <span aria-hidden>
        {prefix}
        {(reduced ? to : val).toFixed(decimals)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {to.toFixed(decimals)}
        {suffix}
      </span>
    </span>
  );
}
