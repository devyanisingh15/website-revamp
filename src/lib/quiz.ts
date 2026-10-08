/**
 * GOAL FINDER LOGIC — rules map answers to a product using only reasons stated
 * in the content document. Replace with the nutrition team's matrix.
 */
export type QuizGoal = 'build' | 'lose' | 'gain' | 'fit';
export type QuizFreq = '0-2' | '3-4' | '5+';
export type QuizPref = 'low-carb' | 'veg' | 'lactose' | 'none';

export interface QuizAnswers {
  goal?: QuizGoal;
  freq?: QuizFreq;
  pref?: QuizPref;
}

export const QUESTIONS = [
  {
    key: 'goal' as const,
    q: 'What’s your goal?',
    options: [
      { v: 'build', label: 'Build muscle' },
      { v: 'lose', label: 'Lose fat' },
      { v: 'gain', label: 'Gain weight' },
      { v: 'fit', label: 'Stay fit' },
    ],
  },
  {
    key: 'freq' as const,
    q: 'How often do you train?',
    options: [
      { v: '0-2', label: '0–2 days' },
      { v: '3-4', label: '3–4 days' },
      { v: '5+', label: '5+ days' },
    ],
  },
  {
    key: 'pref' as const,
    q: 'Any preferences?',
    options: [
      { v: 'low-carb', label: 'Low carb' },
      { v: 'veg', label: 'Vegetarian-friendly' },
      { v: 'lactose', label: 'Lactose-sensitive' },
      { v: 'none', label: 'None' },
    ],
  },
];

export interface QuizResult {
  productId: string;
  why: string;
  alternatives: string[];
}

export function matchProduct(a: QuizAnswers): QuizResult {
  if (a.pref === 'low-carb' || a.pref === 'lactose')
    return { productId: 'biozyme-iso-zero', why: 'Choose Iso Zero if you want lower carbs or are lactose-sensitive.', alternatives: ['plant-protein', 'biozyme-performance-whey'] };
  if (a.pref === 'veg')
    return { productId: 'plant-protein', why: 'Complete plant protein for dairy-free days.', alternatives: ['biozyme-performance-whey', 'raw-whey'] };
  if (a.goal === 'gain')
    return { productId: 'mass-gainer-xxl', why: 'Calories and protein in one shake for hard gainers.', alternatives: ['biozyme-performance-whey', 'peanut-butter'] };
  if (a.goal === 'lose')
    return { productId: 'biozyme-iso-zero', why: 'High protein, low carb, fewer calories. Stay full and protect lean muscle while you cut.', alternatives: ['protein-bar', 'biozyme-performance-whey'] };
  if (a.goal === 'fit' && a.freq === '0-2')
    return { productId: 'biozyme-sachets', why: 'New to supplements? Start simple. One protein, one shaker, one habit.', alternatives: ['raw-whey', 'biozyme-performance-whey'] };
  return { productId: 'biozyme-performance-whey', why: 'Clinically tested whey for 50% higher protein absorption.', alternatives: ['biozyme-gold-whey', 'biozyme-iso-zero'] };
}

/** Figure morph targets per answer (visual only). */
export function figureFor(a: QuizAnswers) {
  let mass = 0.5;
  let definition = 0.5;
  let tint = '#f2efe9';
  if (a.goal === 'build') { mass = 0.8; definition = 0.75; tint = '#e8202a'; }
  if (a.goal === 'lose') { mass = 0.25; definition = 0.95; tint = '#46e891'; }
  if (a.goal === 'gain') { mass = 1; definition = 0.35; tint = '#ffb547'; }
  if (a.goal === 'fit') { mass = 0.45; definition = 0.6; tint = '#f2efe9'; }
  if (a.freq === '5+') definition = Math.min(1, definition + 0.15);
  if (a.freq === '0-2') definition = Math.max(0, definition - 0.15);
  if (a.pref === 'veg') tint = '#9bb36a';
  return { mass, definition, tint };
}
