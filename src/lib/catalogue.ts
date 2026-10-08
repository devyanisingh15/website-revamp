import type { FilterGoal, PackFamily, Product, ProteinType, FlavourFamily } from '@/data/types';
import { PRODUCTS } from '@/data/products';
import { getFromPrice } from '@/mocks/pricing';
import { RECOMMENDED_ORDER, BESTSELLING_ORDER, OUT_OF_STOCK } from '@/mocks/merchandising';

/** Filter + sort definitions for the shop page (labels from the content document). */
export const FILTERS = {
  goal: [
    { v: 'muscle-gain', label: 'Muscle Gain' },
    { v: 'fat-loss', label: 'Fat Loss' },
    { v: 'weight-gain', label: 'Weight Gain' },
    { v: 'general-fitness', label: 'General Fitness' },
  ],
  type: [
    { v: 'concentrate', label: 'Concentrate' },
    { v: 'isolate', label: 'Isolate' },
    { v: 'blend', label: 'Blend' },
    { v: 'plant', label: 'Plant' },
  ],
  protein: [
    { v: '20-24', label: '20–24 g', min: 20, max: 24.99 },
    { v: '25-27', label: '25–27 g', min: 25, max: 27.99 },
    { v: '28+', label: '28 g+', min: 28, max: Infinity },
  ],
  flavour: [
    { v: 'chocolate', label: 'Chocolate' },
    { v: 'vanilla', label: 'Vanilla' },
    { v: 'coffee', label: 'Coffee' },
    { v: 'fruit', label: 'Fruit' },
    { v: 'indian-classics', label: 'Indian Classics' },
    { v: 'unflavoured', label: 'Unflavoured' },
  ],
  pack: [
    { v: 'sachet', label: 'Sachet' },
    { v: '500g-1kg', label: '500 g–1 kg' },
    { v: '2kg', label: '2 kg' },
    { v: '4kg+', label: '4 kg+' },
  ],
} as const;

export const SORTS = [
  { v: 'recommended', label: 'Recommended' },
  { v: 'bestselling', label: 'Bestselling' },
  { v: 'price-asc', label: 'Price low–high' },
  { v: 'price-desc', label: 'Price high–low' },
  { v: 'protein-per-rupee', label: 'Protein per ₹' },
  { v: 'newest', label: 'Newest' },
] as const;

export type SortId = (typeof SORTS)[number]['v'];
export type MultiKey = keyof typeof FILTERS;

export interface FilterState {
  goal: FilterGoal[];
  type: ProteinType[];
  protein: string[];
  flavour: FlavourFamily[];
  pack: PackFamily[];
  priceMax: number | null;
  rating4: boolean;
  inStock: boolean;
  sort: SortId;
}

export const PRICE_BOUNDS = (() => {
  const prices = PRODUCTS.map((p) => getFromPrice(p.id)?.price).filter((x): x is number => x != null);
  return { min: Math.min(...prices), max: Math.max(...prices) };
})();

export function parseFilters(sp: URLSearchParams): FilterState {
  const list = <T extends string>(k: string) => (sp.get(k)?.split(',').filter(Boolean) ?? []) as T[];
  const sort = (sp.get('sort') as SortId) ?? 'recommended';
  return {
    goal: list('goal'),
    type: list('type'),
    protein: list('protein'),
    flavour: list('flavour'),
    pack: list('pack'),
    priceMax: sp.get('max') ? Number(sp.get('max')) : null,
    rating4: sp.get('rating') === '4',
    inStock: sp.get('stock') === '1',
    sort: SORTS.some((s) => s.v === sort) ? sort : 'recommended',
  };
}

export function toSearch(f: FilterState): URLSearchParams {
  const sp = new URLSearchParams();
  (['goal', 'type', 'protein', 'flavour', 'pack'] as const).forEach((k) => f[k].length && sp.set(k, f[k].join(',')));
  if (f.priceMax != null) sp.set('max', String(f.priceMax));
  if (f.rating4) sp.set('rating', '4');
  if (f.inStock) sp.set('stock', '1');
  if (f.sort !== 'recommended') sp.set('sort', f.sort);
  return sp;
}

export function activeCount(f: FilterState) {
  return f.goal.length + f.type.length + f.protein.length + f.flavour.length + f.pack.length + (f.priceMax != null ? 1 : 0) + (f.rating4 ? 1 : 0) + (f.inStock ? 1 : 0);
}

const inStock = (p: Product) => p.flavours.length === 0 || p.flavours.some((fl) => !(OUT_OF_STOCK[p.id] ?? []).includes(fl.id));

/** Protein grams per ₹ — needs protein per serving, servings per pack and price. */
export function proteinPerRupee(p: Product): number | null {
  const size = p.sizes.find((s) => s.servings);
  if (!size || p.nutrition.protein == null) return null;
  const price = getFromPrice(p.id);
  if (!price) return null;
  return (p.nutrition.protein * (size.servings ?? 0)) / price.price;
}

export function applyFilters(products: Product[], f: FilterState): Product[] {
  const out = products.filter((p) => {
    if (f.goal.length && !f.goal.some((g) => p.goals.includes(g))) return false;
    if (f.type.length && (!p.proteinType || !f.type.includes(p.proteinType))) return false;
    if (f.protein.length) {
      const g = p.nutrition.protein;
      if (g == null) return false;
      if (!f.protein.some((r) => {
        const def = FILTERS.protein.find((x) => x.v === r);
        return def && g >= def.min && g <= def.max;
      })) return false;
    }
    if (f.flavour.length && !p.flavours.some((fl) => f.flavour.includes(fl.family))) return false;
    if (f.pack.length && !p.sizes.some((s) => f.pack.includes(s.family))) return false;
    if (f.priceMax != null) {
      const price = getFromPrice(p.id)?.price;
      if (price == null || price > f.priceMax) return false;
    }
    if (f.rating4 && (p.rating == null || p.rating < 4)) return false;
    if (f.inStock && !inStock(p)) return false;
    return true;
  });

  const rank = (order: string[]) => (p: Product) => {
    const i = order.indexOf(p.id);
    return i === -1 ? 999 : i;
  };
  const nullsLast = (a: number | null | undefined, b: number | null | undefined, dir: 1 | -1) => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    return (a - b) * dir;
  };

  switch (f.sort) {
    case 'bestselling':
      return out.sort((a, b) => rank(BESTSELLING_ORDER)(a) - rank(BESTSELLING_ORDER)(b));
    case 'price-asc':
      return out.sort((a, b) => nullsLast(getFromPrice(a.id)?.price, getFromPrice(b.id)?.price, 1));
    case 'price-desc':
      return out.sort((a, b) => nullsLast(getFromPrice(a.id)?.price, getFromPrice(b.id)?.price, -1));
    case 'protein-per-rupee':
      return out.sort((a, b) => nullsLast(proteinPerRupee(a), proteinPerRupee(b), -1));
    case 'newest':
      return out.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    default:
      return out.sort((a, b) => rank(RECOMMENDED_ORDER)(a) - rank(RECOMMENDED_ORDER)(b));
  }
}
