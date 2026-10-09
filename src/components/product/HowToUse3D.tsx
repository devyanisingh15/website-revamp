import { useEffect, useState } from 'react';
import { Stage3D } from '@/components/3d/Stage3D';
import { loadRitual } from '@/components/3d/loaders';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMedia';
import { cx } from '@/lib/format';
import { HOW_TO_STEPS } from './ShakerAnimation';
import { ProductArt } from './ProductArt';
import { getProduct } from '@/data/products';

const BEAT_MS = [4600, 4200, 5200];

/**
 * 3D "how to use" ritual (scoop → shake → drink) modelled on the reference
 * reel. Auto-plays while on screen; the step list is the control and the text
 * alternative. Falls back to the 2D shaker animation without WebGL.
 */
export function HowToUse3D({ productId, flavourId, powder }: { productId: string; flavourId: string | null; powder: string }) {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.35 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView || !auto || reduced) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % 3), BEAT_MS[step]);
    return () => clearTimeout(t);
  }, [inView, auto, reduced, step]);

  return (
    <div ref={ref} className="grid items-center gap-10 lg:grid-cols-12">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[radial-gradient(70%_70%_at_50%_40%,#f4f1ec,#d9d4cb)] lg:col-span-7">
        <Stage3D
          load={loadRitual}
          sceneProps={{ productId, flavourId, powder, step, reduced }}
          allowReducedMotion
          className="absolute inset-0"
          label="3D sequence: a scoop of powder is tipped into a shaker of water and swirls in, the cap goes on and the shaker is shaken, then the tub and shaker stand together. The three steps are listed beside it."
          fallback={
            <div className="flex size-full items-end justify-center gap-[4%] px-[12%] pb-[10%]">
              <div className="w-[42%]">
                <ProductArt art={getProduct(productId)!.art} band={powder} protein={getProduct(productId)!.nutrition.protein} />
              </div>
              <div className="w-[26%]">
                <ProductArt art={getProduct('shaker-bottle')!.art} />
              </div>
            </div>
          }
        />
        <span className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-ink-950/75 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-bone-100 backdrop-blur">
          Step {step + 1} / 3
        </span>
      </div>
      <ol className="space-y-3 lg:col-span-5">
        {HOW_TO_STEPS.map((s, i) => (
          <li key={i}>
            <button
              onClick={() => {
                setAuto(false);
                setStep(i);
              }}
              aria-current={step === i ? 'step' : undefined}
              className={cx('relative flex w-full gap-5 overflow-hidden rounded-sm border p-5 text-left transition-colors', step === i ? 'border-blaze-500/60 bg-white/[0.03]' : 'hairline opacity-60 hover:opacity-100')}
            >
              <span className="display-tight text-3xl text-blaze-500">{i + 1}</span>
              <span className="pt-1 text-[15px] leading-relaxed">{s}</span>
              {step === i && auto && inView && !reduced && (
                <span key={`${step}-bar`} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-blaze-500" style={{ animation: `beat ${BEAT_MS[i]}ms linear forwards` }} aria-hidden />
              )}
            </button>
          </li>
        ))}
        <style>{`@keyframes beat { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
      </ol>
    </div>
  );
}
