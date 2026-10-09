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

/**
 * Legacy "flavour range not supplied" marker. No product uses it any more
 * (every SKU now has mock flavours below) but the `tbc` family is still
 * understood by the UI and 3D code.
 */
export const FLAVOUR_TBC: Flavour = { id: 'tbc', name: 'Flavours to be confirmed', family: 'tbc', color: '#8a8a93' };

/**
 * MOCK — flavour ranges for SKUs other than Biozyme Performance. The content
 * document names only the five Biozyme flavours; replace these with the live
 * range per SKU.
 */
const fl = (id: string, name: string, family: Flavour['family'], color: string, accent?: string): Flavour => ({ id, name, family, color, accent });

export const MOCK_FLAVOURS = {
  richChocolate: fl('rich-chocolate', 'Rich Chocolate', 'chocolate', '#4e2a1c', '#8a5634'),
  cafeMocha: fl('cafe-mocha', 'Café Mocha', 'coffee', '#6b4a35', '#b08661'),
  malaiKulfi: fl('malai-kulfi', 'Malai Kulfi', 'indian-classics', '#efe0b8', '#c9a64a'),
  iceCreamChocolate: fl('ice-cream-chocolate', 'Ice Cream Chocolate', 'chocolate', '#6a3d26', '#a8724a'),
  classicVanilla: fl('classic-vanilla', 'Classic Vanilla', 'vanilla', '#f0e2bf', '#fff4d8'),
  strawberry: fl('strawberry', 'Strawberry', 'fruit', '#e4677a', '#ffb3be'),
  chocolate: fl('chocolate', 'Chocolate', 'chocolate', '#553021', '#8e5a3a'),
  banana: fl('banana', 'Banana', 'fruit', '#f2d36b', '#fff0a8'),
  coffeeCaramel: fl('coffee-caramel', 'Coffee Caramel', 'coffee', '#7a5233', '#c8955a'),
  fruitPunch: fl('fruit-punch', 'Fruit Punch', 'fruit', '#d8344a', '#ff8a5b'),
  greenApple: fl('green-apple', 'Green Apple', 'fruit', '#8cc63f', '#d4f08a'),
  watermelon: fl('watermelon', 'Watermelon', 'fruit', '#e9475a', '#7cc46a'),
  orange: fl('orange', 'Orange', 'fruit', '#f28c28', '#ffc27a'),
  chocoAlmond: fl('choco-almond', 'Choco Almond', 'chocolate', '#4a2a1a', '#c49a6c'),
  coffeeMocha: fl('coffee-mocha', 'Coffee Mocha', 'coffee', '#5d3e2b', '#a77b55'),
  darkChocolate: fl('dark-chocolate', 'Dark Chocolate', 'chocolate', '#3d2116', '#7a4a33'),
  unsweetened: fl('unsweetened', 'Unsweetened', 'unflavoured', '#b5762f', '#d9a35f'),
};

export const FLAVOUR_FAMILIES = [
  { id: 'chocolate', label: 'Chocolate' },
  { id: 'vanilla', label: 'Vanilla' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'fruit', label: 'Fruit' },
  { id: 'indian-classics', label: 'Indian Classics' },
  { id: 'unflavoured', label: 'Unflavoured' },
] as const;
