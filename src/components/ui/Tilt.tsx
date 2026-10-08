import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useMedia';
import { cx } from '@/lib/format';

/**
 * Subtle 3D tilt toward the cursor (CSS transforms, no WebGL).
 * `gyro` lets the element respond to device orientation on mobile where
 * permission is not required.
 */
export function Tilt({ children, max = 10, className, gyro }: { children: ReactNode; max?: number; className?: string; gyro?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let raf = 0;
    const set = (rx: number, ry: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
      set(Math.max(-1, Math.min(1, -dy)) * max, Math.max(-1, Math.min(1, dx)) * max);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      set(Math.max(-max, Math.min(max, (e.beta - 45) / 3)), Math.max(-max, Math.min(max, e.gamma / 3)));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    const useGyro = gyro && 'DeviceOrientationEvent' in window && typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission !== 'function';
    if (useGyro) window.addEventListener('deviceorientation', onOrient, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      if (useGyro) window.removeEventListener('deviceorientation', onOrient);
    };
  }, [max, reduced, gyro]);

  return (
    <div ref={ref} className={cx('transition-transform duration-500 ease-[var(--ease-out-expo)] [transform-style:preserve-3d] will-change-transform', className)}>
      {children}
    </div>
  );
}
