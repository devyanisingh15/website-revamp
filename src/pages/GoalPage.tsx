import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ArrowRight, Sunrise, Zap, Dumbbell, Moon, UserRound, ShoppingBag } from 'lucide-react';
import { getGoal, GOALS, ROUTINE_SLOTS, EXPERT, type RoutineSlot } from '@/data/goals';
import { getProduct } from '@/data/products';
import { useSeo } from '@/hooks/useSeo';
import { SEO } from '@/data/seo';
import { Stage3D } from '@/components/3d/Stage3D';
import { loadFigure } from '@/components/3d/loaders';
import { FigureFallback } from '@/components/sections/FigureFallback';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductArt } from '@/components/product/ProductArt';
import { Button } from '@/components/ui/Button';
import { Ph, MockTag } from '@/components/ui/Placeholder';
import { useCart } from '@/lib/cart';
import { useToast, TOAST_COPY } from '@/lib/toast';
import { getPrice } from '@/mocks/pricing';
import { formatINR } from '@/lib/format';
import type { Product } from '@/data/types';
import NotFoundPage from './NotFoundPage';

const SLOT_ICON: Record<RoutineSlot, typeof Sunrise> = { morning: Sunrise, 'pre-workout': Zap, 'post-workout': Dumbbell, night: Moon };

export default function GoalPage() {
  const { goal: id } = useParams();
  const goal = id ? getGoal(id) : undefined;
  const { add } = useCart();
  const { push } = useToast();
  useSeo(goal ? goal.seo : { ...SEO.notFound, noindex: true });
  if (!goal) return <NotFoundPage />;

  const stack = goal.stack.map(getProduct).filter(Boolean) as Product[];
  const stackTotal = stack.reduce((s, p) => s + (getPrice(p.id, p.sizes[0].id)?.price ?? 0), 0);
  const others = GOALS.filter((g) => g.id !== goal.id);

  const addStack = () => {
    stack.forEach((p) => add({ productId: p.id, flavourId: p.flavours[0]?.id ?? null, sizeId: p.sizes[0].id }));
    push({ tone: 'success', title: TOAST_COPY.added, body: `${goal.name} stack · ${stack.length} products` });
  };

  return (
    <div className="bg-ink-950">
      {/* Hero with goal figure */}
      <section className="relative overflow-hidden border-b hairline">
        <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(45% 60% at 72% 50%, ${goal.figure.tint}22, transparent 70%)` }} />
        <div className="container-x relative grid gap-8 py-10 md:py-16 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-bone-400">
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight className="size-3" aria-hidden />
              <Link to="/goals" className="hover:text-white">Shop by Goal</Link>
              <ChevronRight className="size-3" aria-hidden />
              <span aria-current="page" className="text-bone-100">{goal.name}</span>
            </nav>
            <p className="eyebrow mt-10" style={{ color: goal.figure.tint }}>
              Goal · {goal.name}
            </p>
            <h1 className="display mt-4 text-display-xl">{goal.headline}</h1>
            <p className="mt-6 max-w-[46ch] text-lede text-bone-300">{goal.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={addStack} icon={<ShoppingBag className="size-4" />}>
                Get the Stack · Save {goal.bundleSavingPct != null ? `${goal.bundleSavingPct}` : <Ph label="bundle saving percentage">[x]</Ph>}%
              </Button>
              <a href="#stack" className="inline-flex h-14 items-center gap-2 px-2 font-semibold">
                See the stack <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
          <div className="relative h-[340px] md:h-[460px] lg:col-span-5">
            <Stage3D
              load={loadFigure}
              sceneProps={goal.figure}
              mobileLive
              className="absolute inset-0"
              label={`Low-poly figure representing the ${goal.name.toLowerCase()} goal.`}
              fallback={
                <div className="grid size-full place-items-center">
                  <FigureFallback {...goal.figure} />
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Stack */}
      <section id="stack" aria-labelledby="stack-title" className="surface-bone py-20 md:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-ink-600">The 3-product stack</p>
              <h2 id="stack-title" className="display mt-3 text-display-md">
                Your {goal.name} Stack
              </h2>
              {goal.stackNote && <p className="mt-3 text-ink-600">Start with {goal.stackNote}.</p>}
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-2 text-sm text-ink-600">
                Stack total {stackTotal > 0 && <MockTag className="border-amber-700/40 text-amber-800">Demo price</MockTag>}
              </p>
              <p className="font-mono text-2xl font-semibold">{stackTotal > 0 ? formatINR(stackTotal) : '₹[price]'}</p>
            </div>
          </div>
          <ol className="mt-12 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((p, i) => (
              <li key={p.id} className="relative">
                <span className="absolute -top-7 left-0 font-mono text-xs text-blaze-600">0{i + 1}</span>
                <ProductCard product={p} tone="light" />
              </li>
            ))}
          </ol>
          {goal.id === 'beginners' && (
            <p className="mt-10 text-sm text-ink-600">
              Prefer to try a flavour first?{' '}
              <Link to="/product/biozyme-performance-whey-sachets" className="font-semibold text-ink-950 underline underline-offset-4">
                Biozyme Sachets (trial)
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* Routine */}
      <section aria-labelledby="routine-title" className="py-20 md:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="routine-title" className="display text-display-md">
              Your Day
            </h2>
            <MockTag>Draft routine · pending nutritionist review</MockTag>
          </div>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-md border hairline bg-white/10 md:grid-cols-4">
            {ROUTINE_SLOTS.map((slot) => {
              const p = goal.routine[slot.id] ? getProduct(goal.routine[slot.id]!) : null;
              const Icon = SLOT_ICON[slot.id];
              return (
                <li key={slot.id} className="flex min-h-[220px] flex-col bg-ink-950 p-6">
                  <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-400">
                    <Icon className="size-4" style={{ color: goal.figure.tint }} aria-hidden />
                    {slot.label}
                  </p>
                  {p ? (
                    <Link to={`/product/${p.slug}`} className="group mt-auto flex items-end gap-4">
                      <span className="w-16 shrink-0 transition-transform group-hover:-rotate-6">
                        <ProductArt art={p.art} band={p.flavours[0]?.family === 'tbc' ? undefined : p.flavours[0]?.color} shadow={false} />
                      </span>
                      <span className="pb-1 font-semibold group-hover:underline">{p.shortName}</span>
                    </Link>
                  ) : (
                    <p className="mt-auto text-sm text-bone-400">No stack product in this slot</p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Expert note + quiz CTA */}
      <section className="border-t hairline py-16">
        <div className="container-x grid gap-6 md:grid-cols-2">
          <figure className="flex items-start gap-5 rounded-md border hairline p-6">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-ink-800">
              <UserRound className="size-6 text-bone-400" aria-hidden />
            </span>
            <figcaption>
              <p className="font-semibold">{EXPERT.note}</p>
              <p className="mt-1 text-sm text-bone-400">
                {EXPERT.name ?? <Ph label="nutritionist name">[Name]</Ph>}, {EXPERT.credential ?? <Ph label="nutritionist credential">[Credential]</Ph>}
              </p>
            </figcaption>
          </figure>
          <Link to="/#goal-finder" className="group flex items-center justify-between gap-4 rounded-md bg-blaze-500 p-6 text-white">
            <span>
              <span className="block text-sm opacity-80">Not your goal?</span>
              <span className="mt-1 block text-xl font-bold">Take the 30-second quiz</span>
            </span>
            <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
        <nav aria-label="Other goals" className="container-x mt-10 flex flex-wrap gap-2">
          {others.map((g) => (
            <Link key={g.id} to={`/goals/${g.id}`} className="rounded-full border hairline px-4 py-2 text-sm font-semibold text-bone-300 hover:border-white/50 hover:text-white">
              {g.name}
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
