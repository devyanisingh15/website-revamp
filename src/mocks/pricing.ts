/**
 * MOCK PRICING — NOT REAL PRICES
 * ------------------------------------------------------------
 * The content document supplies no prices (it uses ₹[price], MRP ₹[mrp]).
 * These are plausible Indian online-retail prices (selling price + MRP,
 * inclusive of taxes) so the catalogue, cart, free-delivery meter, coupon and
 * checkout maths look complete. Every price rendered from this module is
 * tagged "Demo price" in the UI (see <Price />).
 *
 * PRICE_MODE = 'demo' shows these numbers; 'placeholder' renders ₹[price]
 * tokens instead. Replace `getPrice` with the pricing service before launch.
 */

export type PriceMode = 'demo' | 'placeholder';
export const PRICE_MODE: PriceMode = 'demo';

export interface PricePoint {
  price: number;
  mrp: number;
}

// MOCK — replace with real data. Keys are product id → pack size id (see src/data/products.ts).
const DEMO: Record<string, Record<string, PricePoint>> = {
  'biozyme-performance-whey': {
    '1kg': { price: 2349, mrp: 3299 },
    '2kg': { price: 4399, mrp: 6149 },
    '4kg': { price: 7999, mrp: 11499 },
    'sachet-5x36': { price: 449, mrp: 549 },
  },
  'biozyme-gold-whey': {
    '1kg': { price: 2699, mrp: 3849 },
    '2kg': { price: 4999, mrp: 7099 },
    '4kg': { price: 9299, mrp: 13499 },
  },
  'biozyme-iso-zero': {
    '1kg': { price: 3299, mrp: 4599 },
    '2kg': { price: 6199, mrp: 8599 },
  },
  'raw-whey': {
    '1kg': { price: 1799, mrp: 2499 },
    '2kg': { price: 3399, mrp: 4699 },
  },
  'mass-gainer-xxl': {
    '1kg': { price: 899, mrp: 1199 },
    '3kg': { price: 2249, mrp: 2999 },
    '5kg': { price: 3399, mrp: 4499 },
  },
  'plant-protein': {
    '500g': { price: 1199, mrp: 1599 },
    '1kg': { price: 2099, mrp: 2899 },
  },
  'pre-workout': { '300g': { price: 1349, mrp: 1899 } },
  'creatine-monohydrate': {
    '250g': { price: 849, mrp: 1199 },
    '100g': { price: 449, mrp: 599 },
  },
  bcaa: { '450g': { price: 1299, mrp: 1799 } },
  'protein-bar': {
    'pack-6': { price: 599, mrp: 720 },
    'pack-12': { price: 1149, mrp: 1440 },
  },
  'peanut-butter': { '1kg': { price: 449, mrp: 599 } },
  'high-protein-oats': { '1kg': { price: 399, mrp: 499 } },
  'biozyme-sachets': { 'sachet-5x36': { price: 449, mrp: 549 } },
  'l-carnitine': { '60caps': { price: 899, mrp: 1199 } },
  multivitamin: { '60tabs': { price: 549, mrp: 799 } },
  'fish-oil': { '60softgels': { price: 599, mrp: 899 } },
  'shaker-bottle': { '700ml': { price: 299, mrp: 449 } },
};

export function getPrice(productId: string, sizeId: string): PricePoint | null {
  // Unknown size ids (e.g. a cart saved before the pack sizes changed) fall back to the first listed size
  const sizes = DEMO[productId];
  if (!sizes) return null;
  return sizes[sizeId] ?? Object.values(sizes)[0] ?? null;
}

/** Lowest demo price across sizes — used for sorting and the price slider. */
export function getFromPrice(productId: string): PricePoint | null {
  const sizes = DEMO[productId];
  if (!sizes) return null;
  return Object.values(sizes).sort((a, b) => a.price - b.price)[0] ?? null;
}

export const FREE_DELIVERY_THRESHOLD = 999; // From the announcement bar copy
export const SHAKER_UPSELL_ID = 'shaker-bottle';
