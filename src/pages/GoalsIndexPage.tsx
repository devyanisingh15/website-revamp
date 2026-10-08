import { Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Flame, Scale, Sprout, Leaf } from 'lucide-react';
import { GOALS } from '@/data/goals';
import { SEO } from '@/data/seo';
import { useSeo } from '@/hooks/useSeo';
import { getProduct } from '@/data/products';
import { ProductArt } from '@/components/product/ProductArt';

const ICONS = { dumbbell: Dumbbell, flame: Flame, scale: Scale, sprout: Sprout, leaf: Leaf };

export default function GoalsIndexPage() {
  useSeo(SEO.goals);
  return (
    <div className="bg-ink-950">
      <header className="container-x py-16 md:py-24">
        <p className="eyebrow text-bone-400">Five goals · one stack each</p>
        <h1 className="display mt-4 max-w-[14ch] text-display-xl">Shop by Goal</h1>
        <p className="mt-6 max-w-[48ch] text-lede text-bone-300">Each goal comes with a 3-product stack and a simple routine. Not sure? Take the 30-second quiz.</p>
      </header>
      <ul className="container-x grid gap-px overflow-hidden rounded-md border hairline bg-white/10 pb-0 md:grid-cols-2 lg:grid-cols-5">
        {GOALS.map((g, i) => {
          const Icon = ICONS[g.icon];
          const hero = getProduct(g.stack[0])!;
          return (
            <li key={g.id} className="bg-ink-950">
              <Link to={`/goals/${g.id}`} className="group flex h-full min-h-[380px] flex-col p-6 transition-colors hover:bg-ink-900">
                <span className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blaze-500">0{i + 1}</span>
                  <Icon className="size-5" style={{ color: g.figure.tint }} aria-hidden />
                </span>
                <span className="mx-auto my-8 w-28 transition-transform duration-500 group-hover:-translate-y-2 group-hover:-rotate-3">
                  <ProductArt art={hero.art} band={hero.flavours[0]?.family === 'tbc' ? undefined : hero.flavours[0]?.color} />
                </span>
                <span className="mt-auto">
                  <span className="block text-sm text-bone-400">{g.name}</span>
                  <span className="display-tight mt-1 block text-2xl">{g.headline}</span>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                    See the stack <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="container-x py-16">
        <Link to="/#goal-finder" className="inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline">
          Not sure? Take the 30-second quiz <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
