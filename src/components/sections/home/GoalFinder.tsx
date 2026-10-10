import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Plus } from 'lucide-react';
import { Stage3D } from '@/components/3d/Stage3D';
import { loadFigure } from '@/components/3d/loaders';
import { QUESTIONS, matchProduct, figureFor, type QuizAnswers } from '@/lib/quiz';
import { getProduct } from '@/data/products';
import { ProductArt } from '@/components/product/ProductArt';
import { Price } from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';
import { useAddToCart } from '@/hooks/useAddToCart';
import { FigureFallback } from '../FigureFallback';
import { cx } from '@/lib/format';

export function GoalFinder() {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [step, setStep] = useState(0);
  const [showAlts, setShowAlts] = useState(false);
  const addToCart = useAddToCart();
  const panel = useRef<HTMLDivElement>(null);
  const done = step >= QUESTIONS.length;
  const result = useMemo(() => (done ? matchProduct(answers) : null), [done, answers]);
  const fig = figureFor(answers);
  const product = result ? getProduct(result.productId)! : null;

  const choose = (key: keyof QuizAnswers, v: string) => {
    setAnswers((a) => ({ ...a, [key]: v }));
    setTimeout(() => {
      setStep((s) => s + 1);
      panel.current?.focus();
    }, 220);
  };
  const reset = () => {
    setAnswers({});
    setStep(0);
    setShowAlts(false);
    panel.current?.focus();
  };

  return (
    <section id="goal-finder" aria-labelledby="quiz-title" className="relative overflow-hidden border-y hairline bg-ink-900 py-20 md:py-24">
      <div className="container-x">
        {/* Header row: compact heading beside the intro, so the quiz and figure sit higher */}
        <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-3 text-bone-400">
              <span className="text-blaze-500">05</span>
              <span className="h-px w-8 bg-current opacity-40" aria-hidden />
              Your goal
            </p>
            <h2 id="quiz-title" className="display mt-5 text-display-md">
              Not Sure Where to Start?
            </h2>
          </div>
          <p className="max-w-[40ch] text-lede text-bone-200 lg:col-span-5 lg:justify-self-end">Answer 3 quick questions and we’ll match you to the right protein.</p>
        </div>

        {/* Figure beside the form: the build changes as you answer */}
        <div className="mt-12 grid gap-10 md:grid-cols-12 md:items-stretch lg:mt-16">
          <div className="relative hidden min-h-[440px] md:col-span-5 md:block lg:col-span-4">
            <Stage3D
              load={loadFigure}
              sceneProps={fig}
              className="absolute inset-0"
              label="Low-poly figure that changes build to reflect your answers: leaner for fat loss, bigger for muscle or weight gain."
              fallback={
                <div className="grid size-full place-items-center">
                  <FigureFallback {...fig} />
                </div>
              }
            />
          </div>

          <div className="md:col-span-7 lg:col-span-8">
            {/* Progress */}
            <div className="flex items-center gap-3" aria-hidden>
              {QUESTIONS.map((q, i) => (
                <span key={q.key} className={cx('h-1 flex-1 rounded-full transition-colors duration-500', i < step ? 'bg-blaze-500' : i === step ? 'bg-bone-100' : 'bg-white/10')} />
              ))}
            </div>
            <p className="sr-only" aria-live="polite">
              {done ? 'Quiz complete' : `Question ${step + 1} of ${QUESTIONS.length}`}
            </p>

            <div ref={panel} tabIndex={-1} className="mt-8 min-h-[300px] outline-none md:min-h-0">
              {!done && (
                <fieldset key={step} className="animate-rise">
                  <legend className="font-mono text-xs uppercase tracking-[0.18em] text-bone-400">
                    Question {step + 1} / {QUESTIONS.length}
                  </legend>
                  <p className="display-tight mt-3 text-3xl md:text-4xl" aria-hidden>
                    {QUESTIONS[step].q}
                  </p>
                  <span className="sr-only">{QUESTIONS[step].q}</span>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {QUESTIONS[step].options.map((o) => {
                      const selected = answers[QUESTIONS[step].key] === o.v;
                      return (
                        <button
                          key={o.v}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => choose(QUESTIONS[step].key, o.v)}
                          className={cx(
                            'group flex min-h-16 items-center justify-between rounded-sm border px-5 text-left text-[17px] font-semibold transition-all',
                            selected ? 'border-blaze-500 bg-blaze-500 text-white' : 'border-white/15 hover:border-white/60 hover:bg-white/[0.03]',
                          )}
                        >
                          {o.label}
                          <span className={cx('size-3 rounded-full border transition-colors', selected ? 'border-white bg-white' : 'border-white/40 group-hover:border-white')} aria-hidden />
                        </button>
                      );
                    })}
                  </div>
                  {step > 0 && (
                    <button onClick={() => setStep((s) => s - 1)} className="mt-6 inline-flex items-center gap-2 text-sm text-bone-400 hover:text-bone-100">
                      <ArrowLeft className="size-4" aria-hidden /> Back
                    </button>
                  )}
                </fieldset>
              )}

              {done && result && product && (
                <div className="animate-rise">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-proof-400">Your match</p>
                  <div className="mt-4 grid gap-6 rounded-md border hairline bg-ink-950 p-6 sm:grid-cols-[140px_1fr]">
                    <div className="mx-auto w-32 sm:w-full">
                      <ProductArt art={product.art} band={product.flavours[0]?.color} protein={product.nutrition.protein} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Your match: {product.shortName}</h3>
                      <p className="mt-2 text-bone-300">
                        <span className="font-semibold text-bone-100">Why: </span>
                        {result.why}
                      </p>
                      <Price productId={product.id} sizeId={product.sizes[0].id} className="mt-4" showMrp={false} />
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button icon={<Plus className="size-4" />} onClick={(e) => addToCart({ productId: product.id, flavourId: product.flavours[0]?.id ?? null, sizeId: product.sizes[0].id, from: e.currentTarget })}>
                          Add to Cart
                        </Button>
                        <Button variant="secondary" onClick={() => setShowAlts((v) => !v)} aria-expanded={showAlts}>
                          See Alternatives
                        </Button>
                      </div>
                    </div>
                  </div>
                  {showAlts && (
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {result.alternatives.map((id) => {
                        const p = getProduct(id)!;
                        return (
                          <li key={id}>
                            <Link to={`/product/${p.slug}`} className="flex items-center gap-4 rounded-sm border hairline p-4 hover:border-white/40">
                              <span className="w-12 shrink-0">
                                <ProductArt art={p.art} band={p.flavours[0]?.color} shadow={false} />
                              </span>
                              <span>
                                <span className="block font-semibold">{p.shortName}</span>
                                <span className="block text-sm text-bone-400">{p.oneLiner ?? 'View product'}</span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <button onClick={reset} className="mt-6 inline-flex items-center gap-2 text-sm text-bone-400 hover:text-bone-100">
                    <RotateCcw className="size-4" aria-hidden /> Start over
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
