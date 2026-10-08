import { useEffect, useRef, type RefObject } from 'react';

/**
 * Writes 0→1 scroll progress of `target` through the viewport into a ref
 * (no React re-renders), via GSAP ScrollTrigger loaded on demand.
 * `start`/`end` follow ScrollTrigger syntax.
 */
export function useScrollProgress(
  target: RefObject<HTMLElement | null>,
  { start = 'top top', end = 'bottom bottom', enabled = true, onUpdate }: { start?: string; end?: string; enabled?: boolean; onUpdate?: (p: number) => void } = {},
) {
  const progress = useRef(0);
  const cb = useRef(onUpdate);
  cb.current = onUpdate;
  useEffect(() => {
    if (!enabled || !target.current) return;
    let killed = false;
    let kill: (() => void) | undefined;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (killed || !target.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const st = ScrollTrigger.create({
        trigger: target.current,
        start,
        end,
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
          cb.current?.(self.progress);
        },
      });
      progress.current = st.progress;
      cb.current?.(st.progress);
      kill = () => st.kill();
    });
    return () => {
      killed = true;
      kill?.();
    };
  }, [target, start, end, enabled]);
  return progress;
}
