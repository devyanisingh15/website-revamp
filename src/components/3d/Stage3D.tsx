import { Component, createContext, lazy, Suspense, useContext, useEffect, useId, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { useIsMobile, useReducedMotion } from '@/hooks/useMedia';
import { afterFirstPaint, hasWebGL } from '@/lib/webgl';
import { cx } from '@/lib/format';

/* ------------------------------------------------------------------
   Canvas budget: on mobile only ONE stage may render at a time — the one
   most visible in the viewport. Desktop stages just pause off-screen.
   ------------------------------------------------------------------ */
type Budget = { report: (id: string, ratio: number) => void; owner: string | null };
const BudgetCtx = createContext<Budget | null>(null);

export function CanvasBudgetProvider({ children }: { children: ReactNode }) {
  const ratios = useRef(new Map<string, number>());
  const [owner, setOwner] = useState<string | null>(null);
  const value = useMemo<Budget>(
    () => ({
      owner,
      report(id, ratio) {
        if (ratio <= 0) ratios.current.delete(id);
        else ratios.current.set(id, ratio);
        let best: string | null = null;
        let max = 0;
        ratios.current.forEach((r, k) => {
          if (r > max) {
            max = r;
            best = k;
          }
        });
        setOwner((o) => (o === best ? o : best));
      },
    }),
    [owner],
  );
  return <BudgetCtx.Provider value={value}>{children}</BudgetCtx.Provider>;
}

/* ------------------------------------------------------------------ */

export interface SceneProps {
  /** False when off-screen or not the mobile budget owner → stop rendering */
  active: boolean;
  onReady: () => void;
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn('[3D] scene failed, using static fallback', err);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface StageProps<P> {
  /** Dynamic import of the scene module — only fetched when the stage is eligible */
  load: () => Promise<{ default: ComponentType<P & SceneProps> }>;
  sceneProps: P;
  /** Static render shown first, and permanently if 3D is unavailable */
  fallback: ReactNode;
  /** Meaningful text alternative describing what the 3D shows */
  label: string;
  /** Allow live 3D on mobile (subject to the one-canvas budget) */
  mobileLive?: boolean;
  /** Keep 3D even with reduced motion (e.g. user-driven viewers with no autoplay) */
  allowReducedMotion?: boolean;
  className?: string;
  /** Overlays (hints, hotspot legends) that sit above both fallback and canvas */
  children?: ReactNode;
}

export function Stage3D<P extends object>({ load, sceneProps, fallback, label, mobileLive, allowReducedMotion, className, children }: StageProps<P>) {
  const id = useId();
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const budget = useContext(BudgetCtx);
  const [near, nearInView] = useInView<HTMLDivElement>({ rootMargin: '400px 0px' });
  const [painted, setPainted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  const eligible = !failed && painted && hasWebGL() && (!reduced || allowReducedMotion) && (!mobile || mobileLive);
  const shouldMount = eligible && nearInView;

  useEffect(() => {
    let alive = true;
    afterFirstPaint().then(() => alive && setPainted(true));
    return () => {
      alive = false;
    };
  }, []);

  // Visibility ratio → pause + mobile budget
  useEffect(() => {
    const el = near.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        budget?.report(id, e.isIntersecting ? e.intersectionRatio : 0);
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      budget?.report(id, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const Scene = useMemo(() => lazy(load), [load]);
  const active = visible && (!mobile || !budget || budget.owner === id);

  return (
    <div ref={near} className={cx(/\b(absolute|fixed)\b/.test(className ?? '') ? '' : 'relative', className)}>
      <p className="sr-only">{label}</p>
      <div className={cx('absolute inset-0 transition-opacity duration-700', ready ? 'opacity-0' : 'opacity-100')} aria-hidden={ready || undefined}>
        {fallback}
      </div>
      {shouldMount && (
        <div className={cx('absolute inset-0 transition-opacity duration-700', ready ? 'opacity-100' : 'opacity-0')} aria-hidden>
          <SceneBoundary onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <Scene {...sceneProps} active={active} onReady={() => setReady(true)} />
            </Suspense>
          </SceneBoundary>
        </div>
      )}
      {children}
    </div>
  );
}

/** Same eligibility rule Stage3D uses — lets sections pick a pinned (3D) or flat layout. */
export function useCan3D(mobileLive = false) {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const [webgl, setWebgl] = useState(false);
  useEffect(() => setWebgl(hasWebGL()), []);
  return webgl && !reduced && (!mobile || mobileLive);
}
