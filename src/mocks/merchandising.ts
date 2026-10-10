import type { Badge } from '@/data/types';

/**
 * MOCK MERCHANDISING — replace with data from the commerce team.
 * Badge assignment, "recommended" order and "bestselling" order are
 * merchandising decisions backed by sales data we do not have.
 * The only badge grounded in the content document is Iso Zero → Low Carb.
 */
export const BADGES: Record<string, Badge[]> = {
  'biozyme-performance-whey': ['Bestseller'],
  'biozyme-iso-zero': ['Low Carb'],
  'mass-gainer-xxl': ['Value Pack'],
  'biozyme-sachets': ['New Flavour'],
};

export const RECOMMENDED_ORDER = [
  'biozyme-performance-whey',
  'biozyme-iso-zero',
  'biozyme-gold-whey',
  'raw-whey',
  'creatine-monohydrate',
  'mass-gainer-xxl',
  'plant-protein',
  'pre-workout',
  'biozyme-sachets',
  'bcaa',
  'protein-bar',
  'peanut-butter',
  'high-protein-oats',
  'l-carnitine',
  'multivitamin',
  'fish-oil',
  'shaker-bottle',
];

/** Stand-in for a sales-rank feed. */
export const BESTSELLING_ORDER = [
  'biozyme-performance-whey',
  'raw-whey',
  'creatine-monohydrate',
  'biozyme-iso-zero',
  'mass-gainer-xxl',
  'biozyme-gold-whey',
  'peanut-butter',
  'high-protein-oats',
  'pre-workout',
  'biozyme-sachets',
  'protein-bar',
  'plant-protein',
  'bcaa',
  'multivitamin',
  'fish-oil',
  'l-carnitine',
  'shaker-bottle',
];

export const HOME_BESTSELLERS = ['biozyme-performance-whey', 'biozyme-iso-zero', 'mass-gainer-xxl', 'biozyme-sachets'];

/** Demo stock state so the "Sold out in this flavour" path can be exercised. */
export const OUT_OF_STOCK: Record<string, string[]> = {
  'biozyme-performance-whey': ['mango'],
};

export const isOutOfStock = (productId: string, flavourId?: string) =>
  !!flavourId && (OUT_OF_STOCK[productId] ?? []).includes(flavourId);
