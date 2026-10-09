import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronsDown } from 'lucide-react';
import { useReducedMotion, useMediaQuery } from '@/hooks/useMedia';
import { afterFirstPaint, hasWebGL } from '@/lib/webgl';
import { BIOZYME_FLAVOURS } from '@/data/flavours';
import { getProduct, PRIMARY_PRODUCT_ID } from '@/data/products';
import { cx } from '@/lib/format';
import { productAssets } from './config/assets';
import { BEATS, BEAT_LABELS, beatAt, ease, type BeatId } from './config/timeline';
import { IntroOverlay } from './scenes/IntroOverlay';
import { OutroOverlay } from './scenes/OutroScene';
import { HandFootageLayer } from './scenes/HandFootageLayer';
import type { Quality } from './rig';
import './styles/product-animation.css';

const Canvas3D = lazy(() => import('./ProductAnimationCanvas'));

/**
 * PRODUCT ANIMATION — scroll-driven product commercial
 * ------------------------------------------------------------------
 * A tall section pins a full-screen stage; GSAP ScrollTrigger maps scroll to
 * progress 0→1, which is smoothed and fed to the WebGL scene and the copy.
 *
 * Loading: the poster still paints first; three.js + models load after first
 * paint and cross-fade in. Reduced motion / no WebGL: static hero composition.
 * Poor runtime performance: hands over to the poster (or productAssets.fallbackVideo).
 */
function useQuality(): Quality {
  const mobile = useMediaQuery('(max-width: 767px), (pointer: coarse)');
  const [weak, setWeak] = useState(false);
  useEffect(() => {
    const n = navigator as Navigator & { deviceMemory?: number };
    setWeak((n.hardwareConcurrency ?? 8) <= 4 || (n.deviceMemory ?? 8) <= 4);
  }, []);
  return mobile || weak ? 'low' : 'high';
}

/** Copy for each beat (from the content document). */
function Captions({ p }: { p: number }) {
  const product = getProduct(PRIMARY_PRODUCT_ID)!;
  const show = (a: number, b: number, fade = 0.015) => ease(p, a, a + fade) * (1 - ease(p, b - fade, b));
  const style = (o: number) => ({ opacity: o, transform: `translateY(${(1 - o) * 14}px)`, pointerEvents: (o > 0.5 ? 'auto' : 'none') as 'auto' | 'none' });
  const reveal = show(0.13, 0.27, 0.03);
  const hero = show(0.872, 0.93, 0.02);
  return (
    <>
      <div className="pa-overlay pa-copy pa-copy--reveal" style={style(reveal)} aria-hidden={reveal < 0.05}>
        <p className="eyebrow text-proof-400">India’s first clinically tested whey</p>
        <h1 className="display pa-h1">
          Proof in Every <span className="text-blaze-500">Scoop.</span>
        </h1>
        <p className="pa-lede">Biozyme whey is clinically tested on Indian bodies for 50% higher protein absorption.</p>
      </div>
      <Caption o={show(0.285, 0.4)} kicker="Don’t trust us. Check us." text="Authenticity code on every tub · Lab report for every batch" />
      <Caption o={show(0.42, 0.545)} kicker="Enhanced Absorption Formula" text="Absorb More. Build More." big />
      <Caption o={show(0.56, 0.745)} kicker="Step 1" text="Add 1 scoop to 180–200 ml cold water or milk." />
      <Caption o={show(0.75, 0.83)} kicker="Step 2" text="Shake for 20 seconds." />
      <div className="pa-overlay pa-copy pa-copy--hero" style={style(hero)} aria-hidden={hero < 0.05}>
        <p className="eyebrow text-bone-400">Step 3 · Drink within 30 minutes of your workout</p>
        <p className="display pa-h2">{product.shortName}</p>
        <p className="pa-lede">25 g protein per scoop · 50% higher protein absorption</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={`/product/${product.slug}`} className="pa-btn pa-btn--primary">
            Shop Biozyme <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link to="/#goal-finder" className="pa-btn">
            Find My Protein
          </Link>
        </div>
      </div>
    </>
  );
}

function Caption({ o, kicker, text, big }: { o: number; kicker: string; text: string; big?: boolean }) {
  return (
    <div className="pa-overlay pa-copy pa-copy--caption" style={{ opacity: o, transform: `translateY(${(1 - o) * 12}px)` }} aria-hidden={o < 0.05}>
      <p className="eyebrow text-blaze-400">{kicker}</p>
      <p className={cx('pa-caption', big && 'pa-caption--big')}>{text}</p>
    </div>
  );
}

function Rail({ p, onJump }: { p: number; onJump: (id: BeatId) => void }) {
  const current = beatAt(p);
  return (
    <nav className="pa-rail" aria-label="Animation chapters">
      {(Object.keys(BEATS) as BeatId[]).map((id) => (
        <button key={id} onClick={() => onJump(id)} aria-current={id === current ? 'step' : undefined} className={cx('pa-rail__dot', id === current && 'is-active')}>
          <span className="sr-only">{BEAT_LABELS[id]}</span>
          <span aria-hidden className="pa-rail__label">
            {BEAT_LABELS[id]}
          </span>
        </button>
      ))}
    </nav>
  );
}

/** Static composition — reduced motion, no WebGL, or before 3D loads. */
function Poster({ className }: { className?: string }) {
  return productAssets.fallbackVideo ? (
    <video className={cx('pa-poster', className)} src={productAssets.fallbackVideo} muted playsInline autoPlay loop poster={productAssets.poster} aria-hidden />
  ) : (
    <img className={cx('pa-poster', className)} src={productAssets.poster} alt="" width={1920} height={1080} fetchPriority="high" decoding="async" />
  );
}

export function ProductAnimation() {
  const reduced = useReducedMotion();
  const quality = useQuality();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [load3D, setLoad3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [poor, setPoor] = useState(false);
  const [visible, setVisible] = useState(true);
  const [p, setP] = useState(0);
  const section = useRef<HTMLElement>(null);
  const raw = useRef(0);
  const smooth = useRef(0);
  const st = useRef<{ start: number; end: number } | null>(null);
  const powderColor = '#8a6650'; // Rich Milk Chocolate powder (lighter than the flavour swatch, like real powder)
  void BIOZYME_FLAVOURS;

  useEffect(() => setWebgl(hasWebGL()), []);
  const cinematic = webgl === true && !reduced;

  // Load the 3D chunk after first paint (poster is already on screen)
  useEffect(() => {
    if (!cinematic) return;
    let alive = true;
    afterFirstPaint().then(() => alive && setLoad3D(true));
    return () => {
      alive = false;
    };
  }, [cinematic]);

  // Scroll → raw progress (GSAP ScrollTrigger), loaded on demand
  useEffect(() => {
    if (!cinematic || !section.current) return;
    let kill: (() => void) | undefined;
    let alive = true;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (!alive || !section.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const t = ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => (raw.current = self.progress),
        onToggle: (self) => setVisible(self.isActive || self.progress < 1),
      });
      st.current = { start: t.start, end: t.end };
      raw.current = t.progress;
      kill = () => t.kill();
    });
    return () => {
      alive = false;
      kill?.();
    };
  }, [cinematic]);

  // Smooth the scroll signal (inertia like a camera operator) and drive the copy
  useEffect(() => {
    if (!cinematic) return;
    let raf = 0;
    let last = performance.now();
    let lastSet = -1;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      smooth.current += (raw.current - smooth.current) * (1 - Math.exp(-7 * dt));
      if (Math.abs(smooth.current - raw.current) < 0.0002) smooth.current = raw.current;
      if (Math.abs(smooth.current - lastSet) > 0.0008) {
        lastSet = smooth.current;
        setP(smooth.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cinematic]);

  const jump = (id: BeatId) => {
    const r = st.current;
    if (!r) return;
    const target = BEATS[id][0] + (BEATS[id][1] - BEATS[id][0]) * 0.55;
    window.scrollTo({ top: r.start + (r.end - r.start) * target, behavior: 'smooth' });
  };
  const skip = () => {
    const el = section.current;
    if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight - window.innerHeight * 0.2, behavior: 'smooth' });
  };

  // ---------- Static version (reduced motion / no WebGL) ----------
  if (webgl !== null && !cinematic) {
    const product = getProduct(PRIMARY_PRODUCT_ID)!;
    return (
      <section aria-labelledby="pa-title" className="pa-static">
        <Poster />
        <div className="pa-static__copy container-x">
          <p className="eyebrow text-proof-400">India’s first clinically tested whey</p>
          <h1 id="pa-title" className="display pa-h1">
            Proof in Every <span className="text-blaze-500">Scoop.</span>
          </h1>
          <p className="pa-lede">Biozyme whey is clinically tested on Indian bodies for 50% higher protein absorption.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/product/${product.slug}`} className="pa-btn pa-btn--primary">
              Shop Biozyme <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link to="/#goal-finder" className="pa-btn">
              Find My Protein
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ---------- Cinematic version ----------
  return (
    <section ref={section} className={cx('pa-section', quality === 'low' && 'pa-section--low')} aria-label="Biozyme product film">
      <div className="pa-stage">
        <p className="sr-only">
          A scroll-driven product film: the MuscleBlaze logo, then a Biozyme Performance Whey tub revealed on a stone counter. The cap is unscrewed, the camera moves into the
          powder, a scoop is filled and poured into a shaker, water is added and the shaker is shaken, then the tub and shake are shown together before the logo returns.
        </p>
        {/* Poster until the 3D scene is ready (and if performance is poor) */}
        <div className={cx('pa-layer', ready && !poor ? 'opacity-0' : 'opacity-100')} aria-hidden>
          <Poster />
        </div>
        {load3D && !poor && (
          <div className={cx('pa-layer', ready ? 'opacity-100' : 'opacity-0')} aria-hidden>
            <Suspense fallback={null}>
              <Canvas3D progress={smooth} quality={quality} reduced={false} powderColor={powderColor} active={visible} onReady={() => setReady(true)} onPoorPerformance={() => setPoor(true)} />
            </Suspense>
          </div>
        )}
        <HandFootageLayer p={p} />
        <IntroOverlay p={p} />
        <Captions p={p} />
        <OutroOverlay p={p} />
        <Rail p={p} onJump={jump} />
        <button className="pa-skip" onClick={skip}>
          Skip film <ChevronsDown className="size-4" aria-hidden />
        </button>
        {!ready && load3D && <div className="pa-loading" role="status">Loading 3D…</div>}
      </div>
    </section>
  );
}
