import { Link } from 'react-router-dom';
import { X, GitCompareArrows } from 'lucide-react';
import { useCompare, MAX_COMPARE } from '@/lib/compare';
import { getProduct } from '@/data/products';
import { getPrice } from '@/mocks/pricing';
import { formatINR } from '@/lib/format';
import { ProductArt } from '../product/ProductArt';
import { Dialog } from '../ui/Dialog';
import { Ph, MockTag } from '../ui/Placeholder';
import { Button } from '../ui/Button';
import { useAddToCart } from '@/hooks/useAddToCart';
import type { Product } from '@/data/types';

/** Sticky tray that appears once one product is picked for comparison. */
export function CompareTray() {
  const { ids, toggle, clear, open, setOpen } = useCompare();
  const products = ids.map(getProduct).filter(Boolean) as Product[];
  if (!products.length) return null;

  return (
    <>
      <div className="h-20" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-[45] border-t hairline bg-ink-900/95 backdrop-blur-md" role="region" aria-label="Compare tray">
        <div className="container-x flex items-center gap-3 py-3">
          <GitCompareArrows className="hidden size-5 text-proof-400 sm:block" aria-hidden />
          <ul className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
            {Array.from({ length: MAX_COMPARE }).map((_, i) => {
              const p = products[i];
              return (
                <li key={i} className="flex h-14 min-w-[56px] items-center gap-2 rounded-sm border border-dashed border-white/15 px-2 sm:min-w-[200px]">
                  {p ? (
                    <>
                      <span className="w-8 shrink-0">
                        <ProductArt art={p.art} band={p.flavours[0]?.color} shadow={false} />
                      </span>
                      <span className="hidden flex-1 truncate text-sm font-semibold sm:block">{p.shortName}</span>
                      <button onClick={() => toggle(p.id)} className="grid size-8 shrink-0 place-items-center rounded-sm hover:bg-white/10" aria-label={`Remove ${p.shortName} from compare`}>
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <span className="hidden px-2 text-xs text-bone-400 sm:block">Add a product</span>
                  )}
                </li>
              );
            })}
          </ul>
          <button onClick={clear} className="hidden text-sm text-bone-400 hover:text-white sm:block">
            Clear
          </button>
          <Button size="md" variant="proof" onClick={() => setOpen(true)} disabled={products.length < 2}>
            Compare {products.length}/{MAX_COMPARE}
          </Button>
        </div>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Compare side by side">
        <CompareTable products={products} />
      </Dialog>
    </>
  );
}

function perServing(p: Product) {
  const size = p.sizes[0];
  const price = size ? getPrice(p.id, size.id) : null;
  if (!price || !size?.servings) return null;
  return price.price / size.servings;
}

function CompareTable({ products }: { products: Product[] }) {
  const addToCart = useAddToCart();
  const g = (v: number | null, unit: string) => (v == null ? <Ph>[x]</Ph> : `${v} ${unit}`);
  const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
    { label: 'Protein', render: (p) => g(p.nutrition.protein, 'g') },
    { label: 'Carbs', render: (p) => g(p.nutrition.carbs, 'g') },
    { label: 'BCAAs', render: (p) => g(p.nutrition.bcaas, 'g') },
    { label: 'Calories', render: (p) => (p.nutrition.calories == null ? <Ph>[x]</Ph> : `~${p.nutrition.calories} kcal`) },
    {
      label: 'Price per serving',
      render: (p) => {
        const v = perServing(p);
        return v == null ? (
          <>
            ₹<Ph>[y]</Ph>
          </>
        ) : (
          <span className="inline-flex items-center gap-2">
            {formatINR(v)} <MockTag />
          </span>
        );
      },
    },
  ];
  // Highlight the best known value per row
  const best = (i: number) => {
    const vals = products.map((p) => [p.nutrition.protein, p.nutrition.carbs, p.nutrition.bcaas, p.nutrition.calories, perServing(p)][i]);
    const known = vals.filter((v): v is number => v != null);
    if (known.length < 2) return -1;
    const target = i === 1 || i === 3 || i === 4 ? Math.min(...known) : Math.max(...known);
    return vals.indexOf(target);
  };

  return (
    <div className="overflow-x-auto p-5">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <caption className="sr-only">Nutrition and price comparison, per serving</caption>
        <thead>
          <tr>
            <th scope="col" className="w-36 pb-4 align-bottom text-xs font-normal text-bone-400">
              Per serving
            </th>
            {products.map((p) => (
              <th key={p.id} scope="col" className="pb-4 align-bottom">
                <Link to={`/product/${p.slug}`} className="block w-24">
                  <ProductArt art={p.art} band={p.flavours[0]?.color} protein={p.nutrition.protein} />
                </Link>
                <span className="mt-3 block text-sm font-bold">{p.shortName}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const b = best(i);
            return (
              <tr key={r.label} className="border-t hairline">
                <th scope="row" className="py-4 text-sm font-medium text-bone-400">
                  {r.label}
                </th>
                {products.map((p, j) => (
                  <td key={p.id} className={`py-4 font-mono text-sm ${b === j ? 'text-proof-400' : ''}`}>
                    {r.render(p)}
                  </td>
                ))}
              </tr>
            );
          })}
          <tr className="border-t hairline">
            <td />
            {products.map((p) => (
              <td key={p.id} className="pt-5">
                <Button size="sm" onClick={(e) => addToCart({ productId: p.id, flavourId: p.flavours[0]?.id ?? null, sizeId: p.sizes[0]?.id ?? 'std', from: e.currentTarget })}>
                  Add to Cart
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="mt-6 text-xs text-bone-400">Values marked [x] are not yet supplied. Figures should be checked against the live label before launch.</p>
    </div>
  );
}
