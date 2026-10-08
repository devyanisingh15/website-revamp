import type { CategoryId } from './types';

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  /** Intro line from the content document */
  intro: string;
  /** Longer header intro (whey only in the document) */
  headerIntro?: string;
  /** Colour used for the category tub in the 3D carousel */
  tub: string;
  inShopNav: boolean;
  seo?: { title: string; description: string };
}

export const CATEGORIES: Category[] = [
  {
    id: 'whey-protein',
    name: 'Whey Protein',
    shortName: 'Whey Protein',
    intro: 'Fast-absorbing protein for recovery after every session.',
    headerIntro:
      'Fast-absorbing, lab-verified whey for muscle recovery and growth. Choose by protein per scoop, carbs or flavour, and compare up to 3 side by side.',
    tub: '#121214',
    inShopNav: true,
    seo: {
      title: 'Buy Whey Protein Online in India, MuscleBlaze',
      description: 'Biozyme whey with up to 27 g protein per scoop. Compare flavours, sizes and prices. Every batch lab tested.',
    },
  },
  { id: 'mass-gainers', name: 'Mass & Weight Gainers', shortName: 'Gainers', intro: 'Calories and protein in one shake for hard gainers.', tub: '#1b1b1f', inShopNav: true },
  { id: 'plant-protein', name: 'Plant Protein', shortName: 'Plant Protein', intro: 'Complete plant protein for dairy-free days.', tub: '#1e2a1d', inShopNav: true },
  { id: 'pre-workout', name: 'Pre-Workout', shortName: 'Pre-Workout', intro: 'Energy and focus for your heaviest sets.', tub: '#26070a', inShopNav: true },
  { id: 'creatine', name: 'Creatine', shortName: 'Creatine', intro: 'The most researched supplement for strength and power.', tub: '#e9e5dc', inShopNav: true },
  { id: 'bcaas-eaas', name: 'BCAAs & EAAs', shortName: 'BCAAs & EAAs', intro: 'Intra-workout aminos to keep you going.', tub: '#0c2230', inShopNav: true },
  { id: 'bars-snacks', name: 'Bars & Snacks', shortName: 'Bars & Snacks', intro: 'High-protein snacks for the space between meals.', tub: '#2b1810', inShopNav: true },
  { id: 'sachets', name: 'Sachets & Trial Packs', shortName: 'Sachets', intro: 'Try a flavour before you commit to a tub.', tub: '#3a0d10', inShopNav: true },
  { id: 'wellness', name: 'Wellness', shortName: 'Wellness', intro: 'Everyday support for training days.', tub: '#0d1f2b', inShopNav: false },
  { id: 'accessories', name: 'Accessories', shortName: 'Accessories', intro: 'Shakers and gear.', tub: '#151517', inShopNav: false },
];

/** The seven carousel cards named on the homepage */
export const HOME_CATEGORY_IDS: CategoryId[] = ['whey-protein', 'mass-gainers', 'plant-protein', 'pre-workout', 'creatine', 'bars-snacks', 'sachets'];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
