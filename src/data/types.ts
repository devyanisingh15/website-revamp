/**
 * Domain types. Values typed `number | null` are unknown until connected to
 * the product information system — the UI renders a visible placeholder for
 * every null instead of guessing.
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
  /** Servings per pack — null until confirmed from label */
  servings: number | null;
}

export interface Nutrition {
  protein: number | null;
  carbs: number | null;
  bcaas: number | null;
  eaas: number | null;
  calories: number | null;
  /** True only where the figure is taken from the supplied content document */
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
  oneLiner: string | null;
  whoItsFor?: string;
  proteinType: ProteinType | null;
  goals: FilterGoal[];
  nutrition: Nutrition;
  flavours: Flavour[];
  sizes: PackSize[];
  /** Ratings come from the reviews service; null until connected */
  rating: number | null;
  reviewCount: number | null;
  art: ProductArt;
  /** Path to a Draco-compressed GLB once the 3D team supplies it */
  model3d: string | null;
  /** Packshot path once photography is supplied */
  image: string | null;
  isClinicallyTested?: boolean;
  frequentlyBoughtWith?: string[];
  addedAt: string;
}
