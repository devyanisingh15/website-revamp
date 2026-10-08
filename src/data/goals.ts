import type { GoalId } from './types';

export type RoutineSlot = 'morning' | 'pre-workout' | 'post-workout' | 'night';

export interface Goal {
  id: GoalId;
  name: string;
  headline: string;
  intro: string;
  /** Product ids, in stack order. Beginners lists two first-protein options. */
  stack: string[];
  stackNote?: string;
  /**
   * Which stack item fits each slot. DRAFT — the document asks for this strip
   * but does not specify the mapping; it must be reviewed by the nutritionist.
   */
  routine: Record<RoutineSlot, string | null>;
  /** Parameters for the low-poly figure: 0 = lean, 1 = big */
  figure: { mass: number; definition: number; tint: string };
  bundleSavingPct: number | null;
  seo: { title: string; description: string };
  icon: 'dumbbell' | 'flame' | 'scale' | 'sprout' | 'leaf';
}

export const GOALS: Goal[] = [
  {
    id: 'muscle-gain',
    name: 'Muscle Gain',
    headline: 'Build Muscle That Shows.',
    intro: "More protein absorbed means more fuel for repair and growth. Here's the stack serious lifters swear by.",
    stack: ['biozyme-performance-whey', 'creatine-monohydrate', 'pre-workout'],
    routine: { morning: 'creatine-monohydrate', 'pre-workout': 'pre-workout', 'post-workout': 'biozyme-performance-whey', night: null },
    figure: { mass: 0.85, definition: 0.8, tint: '#e8202a' },
    bundleSavingPct: null,
    seo: {
      title: 'Best Supplements for Muscle Gain, MuscleBlaze',
      description: 'Build muscle with a lab-verified stack of whey, creatine and pre-workout chosen for Indian lifters.',
    },
    icon: 'dumbbell',
  },
  {
    id: 'fat-loss',
    name: 'Lean & Fat Loss',
    headline: 'Cut Fat. Keep Muscle.',
    intro: 'High protein, low carb, fewer calories. Stay full and protect lean muscle while you cut.',
    stack: ['biozyme-iso-zero', 'l-carnitine', 'protein-bar'],
    routine: { morning: 'l-carnitine', 'pre-workout': null, 'post-workout': 'biozyme-iso-zero', night: 'protein-bar' },
    figure: { mass: 0.25, definition: 0.95, tint: '#46e891' },
    bundleSavingPct: null,
    seo: {
      title: 'Low-Carb Protein for Fat Loss, MuscleBlaze',
      description: 'Cut fat and keep muscle with low-carb isolate whey and lean-friendly supplements.',
    },
    icon: 'flame',
  },
  {
    id: 'weight-gain',
    name: 'Weight Gain',
    headline: 'Eat Big Made Easy.',
    intro: 'Struggling to eat enough? A gainer shake adds quality calories and protein without another full meal.',
    stack: ['mass-gainer-xxl', 'peanut-butter', 'creatine-monohydrate'],
    routine: { morning: 'peanut-butter', 'pre-workout': null, 'post-workout': 'mass-gainer-xxl', night: 'creatine-monohydrate' },
    figure: { mass: 1, definition: 0.4, tint: '#ffb547' },
    bundleSavingPct: null,
    seo: {
      title: 'Weight Gain Supplements, MuscleBlaze',
      description: 'Mass Gainer XXL, peanut butter and creatine: a simple stack for hard gainers.',
    },
    icon: 'scale',
  },
  {
    id: 'beginners',
    name: 'Beginners',
    headline: 'Your First Protein, Sorted.',
    intro: 'New to supplements? Start simple. One protein, one shaker, one habit.',
    stack: ['raw-whey', 'shaker-bottle', 'multivitamin'],
    stackNote: 'Raw Whey or Biozyme Sachets (trial)',
    routine: { morning: 'multivitamin', 'pre-workout': null, 'post-workout': 'raw-whey', night: null },
    figure: { mass: 0.5, definition: 0.5, tint: '#f2efe9' },
    bundleSavingPct: null,
    seo: {
      title: 'Beginner Protein Stack, MuscleBlaze',
      description: 'New to supplements? Start with one protein, one shaker and one habit.',
    },
    icon: 'sprout',
  },
  {
    id: 'plant-powered',
    name: 'Plant-Powered',
    headline: 'Plant Protein. Full Power.',
    intro: 'Complete amino acid profile from plants for dairy-free days.',
    stack: ['plant-protein', 'bcaa', 'peanut-butter'],
    routine: { morning: 'peanut-butter', 'pre-workout': 'bcaa', 'post-workout': 'plant-protein', night: null },
    figure: { mass: 0.6, definition: 0.7, tint: '#9bb36a' },
    bundleSavingPct: null,
    seo: {
      title: 'Plant Protein Stack, MuscleBlaze',
      description: 'Complete amino acid profile from plants for dairy-free days. Plant protein, BCAAs and peanut butter.',
    },
    icon: 'leaf',
  },
];

export const ROUTINE_SLOTS: { id: RoutineSlot; label: string }[] = [
  { id: 'morning', label: 'Morning' },
  { id: 'pre-workout', label: 'Pre-workout' },
  { id: 'post-workout', label: 'Post-workout' },
  { id: 'night', label: 'Night' },
];

/** Expert note — name and credential to be supplied */
export const EXPERT = {
  note: 'Advice reviewed by a certified nutritionist',
  name: null as string | null,
  credential: null as string | null,
};

export const getGoal = (id: string) => GOALS.find((g) => g.id === id);
