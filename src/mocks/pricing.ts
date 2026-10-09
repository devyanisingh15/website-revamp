/**
 * DEMO PRICING — NOT REAL PRICES
 * ------------------------------------------------------------
 * The content document supplies no prices (it uses ₹[price], MRP ₹[mrp]).
 * These round numbers exist only so the cart, free-delivery meter, coupon
 * and checkout maths can be demonstrated. Every price rendered from this
 * module is tagged "Demo price" in the UI (see <Price />).
 *
 * Set PRICE_MODE to 'placeholder' to render ₹[price] tokens instead.
 * Replace `getPrice` with the pricing service before launch.
 */

export type PriceMode = 'demo' | 'placeholder';
export const PRICE_MODE: PriceMode = 'demo';

export interface PricePoint {
  price: number;
  mrp: number;
}

const DEMO: Record<string, Record<string, PricePoint>> = {
  'biozyme-performance-whey': {
    '1kg': { price: 2000, mrp: 2500 },
    '2kg': { price: 3800, mrp: 4800 },
    '4kg': { price: 7200, mrp: 9200 },
    'sachet-5x36': { price: 400, mrp: 450 },
  },
  'biozyme-gold-whey': {
    '1kg': { price: 2600, mrp: 3200 },
    '2kg': { price: 5000, mrp: 6200 },
    '4kg': { price: 9600, mrp: 12000 },
  },
  'biozyme-iso-zero': {
    '1kg': { price: 3000, mrp: 3700 },
    '2kg': { price: 5800, mrp: 7200 },
  },
  'raw-whey': {
    '1kg': { price: 1600, mrp: 2000 },
    '2kg': { price: 3000, mrp: 3800 },
  },
  'mass-gainer-xxl': {
    '1kg': { price: 800, mrp: 1000 },
    '3kg': { price: 2000, mrp: 2600 },
    '5kg': { price: 3200, mrp: 4000 },
  },
  'plant-protein': { std: { price: 1800, mrp: 2200 } },
  'pre-workout': { std: { price: 1200, mrp: 1500 } },
  'creatine-monohydrate': { std: { price: 700, mrp: 900 } },
  bcaa: { std: { price: 1100, mrp: 1400 } },
  'protein-bar': { std: { price: 600, mrp: 700 } },
  'peanut-butter': { std: { price: 400, mrp: 500 } },
  'high-protein-oats': { '1kg': { price: 500, mrp: 600 } },
  'biozyme-sachets': { 'sachet-5x36': { price: 400, mrp: 450 } },
  'l-carnitine': { std: { price: 900, mrp: 1100 } },
  multivitamin: { std: { price: 500, mrp: 650 } },
  'fish-oil': { std: { price: 600, mrp: 750 } },
  'shaker-bottle': { std: { price: 300, mrp: 400 } },
};

export function getPrice(productId: string, sizeId: string): PricePoint | null {
  return DEMO[productId]?.[sizeId] ?? null;
}

/** Lowest demo price across sizes — used for sorting and the price slider. */
export function getFromPrice(productId: string): PricePoint | null {
  const sizes = DEMO[productId];
  if (!sizes) return null;
  return Object.values(sizes).sort((a, b) => a.price - b.price)[0] ?? null;
}

export const FREE_DELIVERY_THRESHOLD = 999; // From the announcement bar copy
export const SHAKER_UPSELL_ID = 'shaker-bottle';
