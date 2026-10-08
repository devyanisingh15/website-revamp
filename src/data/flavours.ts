import type { Flavour } from './types';

/** The five Biozyme Performance flavours named in the content document. */
export const BIOZYME_FLAVOURS: Flavour[] = [
  { id: 'rich-milk-chocolate', name: 'Rich Milk Chocolate', family: 'chocolate', color: '#5b3322', accent: '#a0673f', notes: ['Cocoa', 'Milk'] },
  { id: 'chocolate-hazelnut', name: 'Chocolate Hazelnut', family: 'chocolate', color: '#7a4a2b', accent: '#c48a4f', notes: ['Cocoa', 'Hazelnut'] },
  { id: 'french-vanilla-creme', name: 'French Vanilla Creme', family: 'vanilla', color: '#ead9b0', accent: '#fff3d6', notes: ['Vanilla', 'Cream'] },
  { id: 'mango', name: 'Mango', family: 'fruit', color: '#f3a33a', accent: '#ffd36b', notes: ['Mango'] },
  { id: 'kesar-pista-badam', name: 'Kesar Pista Badam', family: 'indian-classics', color: '#e0b552', accent: '#9bb36a', notes: ['Kesar', 'Pista', 'Badam'] },
];

export const UNFLAVOURED: Flavour = { id: 'unflavoured', name: 'Unflavoured', family: 'unflavoured', color: '#efe9dc' };

/** Used where the flavour range for a SKU has not been supplied yet. */
export const FLAVOUR_TBC: Flavour = { id: 'tbc', name: 'Flavours to be confirmed', family: 'tbc', color: '#8a8a93' };

export const FLAVOUR_FAMILIES = [
  { id: 'chocolate', label: 'Chocolate' },
  { id: 'vanilla', label: 'Vanilla' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'fruit', label: 'Fruit' },
  { id: 'indian-classics', label: 'Indian Classics' },
  { id: 'unflavoured', label: 'Unflavoured' },
] as const;
