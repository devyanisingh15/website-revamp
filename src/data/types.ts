/**
 * Domain types. The catalogue is currently filled with MOCK values (see
 * `src/data/products.ts`) — replace with the product information system.
 * Fields typed `number | null` mean "not applicable" for that product
 * (e.g. protein in creatine) rather than "unknown".
 */

export type CategoryId =
  | 'whey-protein'
  | 'mass-gainers'
  | 'plant-protein'
  | 'pre-workout'
  | 'creatine'
  | 'bcaas-eaas'
  | 'bars-snacks'
  | 'sachets'
  | 'wellness'
  | 'accessories';

export type GoalId = 'muscle-gain' | 'fat-loss' | 'weight-gain' | 'beginners' | 'plant-powered';
export type FilterGoal = 'muscle-gain' | 'fat-loss' | 'weight-gain' | 'general-fitness';
export type ProteinType = 'concentrate' | 'isolate' | 'blend' | 'plant';
export type FlavourFamily = 'chocolate' | 'vanilla' | 'coffee' | 'fruit' | 'indian-classics' | 'unflavoured' | 'tbc';
export type PackFamily = 'sachet' | '500g-1kg' | '2kg' | '4kg+' | 'unit';
export type Badge = 'Bestseller' | 'New Flavour' | 'Low Carb' | 'Value Pack';
export type ArtShape = 'tub' | 'tub-wide' | 'jar' | 'bottle' | 'bar' | 'sachet' | 'shaker' | 'pouch';

export interface Flavour {
  id: string;
  name: string;
  family: FlavourFamily;
  /** Powder / band colour used by 2D art and 3D materials */
  color: string;
  /** Secondary ingredient colour (e.g. pista green on Kesar Pista Badam) */
  accent?: string;
  /** Ingredient words used by the flavour wall particle swirl */
  notes?: string[];
}

export interface PackSize {
  id: string;
  label: string;
  family: PackFamily;
  /** Servings per pack (MOCK unless stated). null = not applicable (e.g. a shaker) */
  servings: number | null;
}

export interface Nutrition {
  protein: number | null;
  carbs: number | null;
  bcaas: number | null;
  eaas: number | null;
  calories: number | null;
  /** Extra label rows — MOCK values for the concept build */
  sugars?: number | null;
  fat?: number | null;
  /** mg per serving */
  sodium?: number | null;
  /** e.g. "36 g" — MOCK */
  servingSize?: string | null;
  /** What one serving is called on cards: "scoop", "serving", "bar"… */
  servingLabel?: string;
  /**
   * True only where protein / EAAs / BCAAs / calories are taken from the
   * supplied content document (Biozyme Performance). Everything else is mock.
   */
  sourced: boolean;
}

export interface ProductArt {
  shape: ArtShape;
  body: string;
  label: string;
  sub?: string;
  bandText?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: CategoryId;
  oneLiner: string;
  whoItsFor?: string;
  proteinType: ProteinType | null;
  goals: FilterGoal[];
  nutrition: Nutrition;
  /** Short spec chips shown under the title when there are no protein macros — MOCK */
  keySpecs?: string[];
  flavours: Flavour[];
  sizes: PackSize[];
  /** MOCK — ratings come from the reviews service once connected */
  rating: number;
  reviewCount: number;
  art: ProductArt;
  /** Path to a Draco-compressed GLB once the 3D team supplies it */
  model3d: string | null;
  /** Packshot path once photography is supplied */
  image: string | null;
  isClinicallyTested?: boolean;
  frequentlyBoughtWith?: string[];
  addedAt: string;
}
