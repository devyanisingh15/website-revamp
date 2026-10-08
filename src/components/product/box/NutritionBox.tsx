import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Hand, ZoomIn, ZoomOut } from 'lucide-react';
import { Stage3D } from '@/components/3d/Stage3D';
import { loadNutritionBox } from '@/components/3d/loaders';
import { useReducedMotion } from '@/hooks/useMedia';
import { radioKeyNav } from '@/lib/a11y';
import { hasWebGL } from '@/lib/webgl';
import { cx } from '@/lib/format';
import { SITE } from '@/data/site';
import type { Product } from '@/data/types';
import { HOW_TO_STEPS } from '../ShakerAnimation';
import { BOX_FACES, drawBoxFace, faceSize, labelRows, type BoxData, type BoxFace, type LabelRowId } from './boxPanels';

/** Flat fallback: the same panel artwork as an image, flipping between faces. */
function FlatPanel({ data, face, highlight }: { data: BoxData; face: BoxFace; highlight: LabelRowId | null }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const draw = () => alive && setSrc(drawBoxFace(face, data, highlight).toDataURL('image/png'));
    draw();
    document.fonts?.ready.then(draw);
    return () => {
      alive = false;
    };
  }, [face, data, highlight]);
  const { w, h } = faceSize(face);
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 pb-16 [perspective:1200px]">
      {src && (
        <img
          key={face}
          src={src}
          alt=""
          width={w}
          height={h}
          className="h-full max-h-full w-auto max-w-full object-contain animate-[panel-flip_.5s_var(--ease-out-expo)] rounded-[3px] shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)]"
          style={{ aspectRatio: `${w} / ${h}` }}
        />
      )}
      <style>{`@keyframes panel-flip { from { transform: rotateY(-70deg); opacity: 0 } }`}</style>
    </div>
  );
}

export function NutritionBox({ product, flavourName, flavourColor, sizeLabel, servings }: { product: Product; flavourName: string; flavourColor: string; sizeLabel: string; servings: number | null }) {
  const [face, setFace] = useState<BoxFace>('front');
  const [highlight, setHighlight] = useState<LabelRowId | null>(null);
  const [magnify, setMagnify] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => setWebgl(hasWebGL()), []);
  useEffect(() => {
    if (face !== 'back') setMagnify(false);
  }, [face]);

  const n = product.nutrition;
  const data = useMemo<BoxData>(
    () => ({
      label: product.art.label,
      sub: product.art.sub,
      body: product.art.body,
      band: flavourColor,
      flavourName,
      sizeLabel,
      rows: labelRows(n),
      servingSize: null,
      servingsPerPack: servings,
      howTo: HOW_TO_STEPS,
      usageNote: SITE.usageNote,
      disclaimer: SITE.disclaimer,
    }),
    [product, flavourColor, flavourName, sizeLabel, servings, n],
  );

  const idx = BOX_FACES.findIndex((f) => f.id === face);
  const step = (d: 1 | -1) => setFace(BOX_FACES[(idx + d + 4) % 4].id);
  const onBack = face === 'back';

  return (
    <section aria-labelledby="label-title" className="border-t hairline bg-ink-950 py-20 md:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="eyebrow text-proof-400">Turn the box</p>
          <h2 id="label-title" className="display mt-4 text-display-md">
            Read the Label
          </h2>
          <p className="mt-5 max-w-[42ch] text-lede text-bone-300">Spin the pack to the back panel. Every figure we print, we can prove.</p>

          {/* Panel picker */}
          <div
            role="radiogroup"
            aria-label="Box panel"
            className="mt-8 grid grid-cols-4 gap-1 rounded-sm border hairline p-1"
            onKeyDown={(e) => radioKeyNav(e, BOX_FACES.map((f) => f.id), face, setFace)}
          >
            {BOX_FACES.map((f) => (
              <button
                key={f.id}
                role="radio"
                aria-checked={face === f.id}
                tabIndex={face === f.id ? 0 : -1}
                onClick={() => setFace(f.id)}
                className={cx(
                  'min-h-14 rounded-xs px-2 text-left text-xs font-semibold leading-tight transition-colors sm:text-sm',
                  face === f.id ? (f.id === 'back' ? 'bg-proof-400 text-ink-950' : 'bg-bone-100 text-ink-950') : 'text-bone-400 hover:text-bone-100',
                )}
              >
                <span className="block font-mono text-[10px] uppercase tracking-wider opacity-70">{f.short}</span>
                {f.label}
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Showing {BOX_FACES[idx].label} panel
          </p>

          {/* Accessible, always-readable copy of the back panel */}
          <div className={cx('mt-8 rounded-md border p-5 transition-colors duration-500', onBack ? 'border-proof-400/50 bg-proof-400/[0.05]' : 'hairline')}>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-bold">Nutrition Facts</h3>
              <span className="text-xs text-bone-400">Per serving (approx.) · 1 scoop</span>
            </div>
            <table className="mt-3 w-full border-collapse text-sm">
              <caption className="sr-only">Nutrition facts per serving for {product.name}, {flavourName}</caption>
              <tbody>
                {data.rows.map((r) => (
                  <tr
                    key={r.id}
                    tabIndex={0}
                    onMouseEnter={() => setHighlight(r.id)}
                    onMouseLeave={() => setHighlight(null)}
                    onFocus={() => {
                      setHighlight(r.id);
                      setFace('back');
                    }}
                    onBlur={() => setHighlight(null)}
                    onClick={() => setFace('back')}
                    className={cx('cursor-pointer border-b border-white/10 outline-none transition-colors focus-visible:bg-white/[0.06]', highlight === r.id && 'bg-blaze-500/15')}
                  >
                    <th scope="row" className={cx('py-2.5 text-left', r.bold ? 'font-semibold' : 'font-normal text-bone-300')} style={{ paddingLeft: `${r.level * 16}px` }}>
                      {r.label}
                    </th>
                    <td className="py-2.5 text-right font-mono">
                      {r.value != null ? (
                        `${r.value} ${r.unit}`
                      ) : (
                        <span className="placeholder-token" title="To be confirmed against the current label">
                          [x] {r.unit}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-bone-400">[x] = not yet supplied. Confirm all figures against the live label before launch. Hover a row to find it on the pack.</p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-[radial-gradient(60%_55%_at_50%_45%,#1d1d22,#0d0d0f_75%)] sm:aspect-square">
            <Stage3D
              load={loadNutritionBox}
              sceneProps={{ data, face, onFaceChange: setFace, highlight, magnify, reduced }}
              mobileLive
              allowReducedMotion
              className="absolute inset-0"
              label={`Interactive 3D ${product.shortName} box. Drag to turn it, or use the panel buttons. The back panel shows the nutrition facts, also listed in the table beside it.`}
              fallback={<FlatPanel data={data} face={face} highlight={highlight} />}
            />
            {/* Overlay controls */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-bone-400">
                <Hand className="size-3.5" aria-hidden /> {webgl ? 'Drag to turn' : 'Use the arrows to turn'}
              </p>
              <div className="pointer-events-auto flex items-center gap-2">
                {onBack && webgl && (
                  <button
                    onClick={() => setMagnify((m) => !m)}
                    aria-pressed={magnify}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-proof-400/60 bg-ink-950/80 px-4 text-sm font-semibold backdrop-blur hover:bg-ink-900"
                  >
                    {magnify ? <ZoomOut className="size-4" aria-hidden /> : <ZoomIn className="size-4" aria-hidden />}
                    {magnify ? 'Full box' : 'Zoom to read'}
                  </button>
                )}
                <button onClick={() => step(-1)} className="grid size-10 place-items-center rounded-full border hairline bg-ink-950/80 backdrop-blur hover:border-white/50" aria-label="Turn box left">
                  <ArrowLeft className="size-4" />
                </button>
                <button onClick={() => step(1)} className="grid size-10 place-items-center rounded-full border hairline bg-ink-950/80 backdrop-blur hover:border-white/50" aria-label="Turn box right">
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
            <span className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border hairline bg-ink-950/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-bone-300 backdrop-blur">
              {BOX_FACES[idx].label}
            </span>
          </div>
          <p className="mt-3 text-xs text-bone-400">Pack artwork is illustrative until the final dieline is supplied.</p>
        </div>
      </div>
    </section>
  );
}
