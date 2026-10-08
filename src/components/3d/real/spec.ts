import type { Flavour, Product } from '@/data/types';
import { MB_YELLOW, CHARCOAL, type WrapLabelSpec, type PouchSpec } from './labelArt';

/**
 * Maps a catalogue product (+ flavour + size) to a realistic pack model and
 * its printed artwork. One place to tune proportions and colourways.
 */
export type PackKind = 'tub' | 'jar' | 'pouch' | 'sachet' | 'bottle' | 'bar' | 'shaker';

export interface TubDims {
  radius: number; // body radius
  height: number; // body height (excluding cap)
  shoulder: number; // shoulder curve height
  neck: number; // neck/cap radius ratio
  capH: number;
}

export interface PackSpec {
  kind: PackKind;
  body: string; // plastic colour
  cap: string;
  dims?: TubDims;
  wrap?: WrapLabelSpec;
  pouch?: PouchSpec;
  bottle?: { name: string; sub: string; accent: string; base: string };
  bar?: { name: string; accent: string; flavour: string };
  powder: string;
}

const TUB_2KG: TubDims = { radius: 1, height: 2.05, shoulder: 0.62, neck: 0.8, capH: 0.44 };
const TUB_XL: TubDims = { radius: 1.12, height: 2.35, shoulder: 0.66, neck: 0.76, capH: 0.46 };
const JAR: TubDims = { radius: 0.82, height: 1.55, shoulder: 0.3, neck: 0.86, capH: 0.36 };

const ACCENT: Record<string, string> = {
  'biozyme-performance-whey': MB_YELLOW,
  'biozyme-gold-whey': '#d4a93a',
  'biozyme-iso-zero': '#3fb6e8',
  'mass-gainer-xxl': '#e8202a',
  'plant-protein': '#7fbf4d',
  'pre-workout': '#ff5a1f',
  'creatine-monohydrate': '#2f80ed',
  bcaa: '#19b8c9',
  'peanut-butter': '#c98a3a',
};

const LINES: Record<string, { lines: string[]; hero: string; category?: string }> = {
  'biozyme-performance-whey': { lines: ['BIOZYME', 'PERFORMANCE'], hero: 'WHEY' },
  'biozyme-gold-whey': { lines: ['BIOZYME', 'GOLD 100%'], hero: 'WHEY' },
  'biozyme-iso-zero': { lines: ['BIOZYME', 'ISO ZERO'], hero: 'ISOLATE' },
  'mass-gainer-xxl': { lines: ['MASS GAINER'], hero: 'XXL' },
  'plant-protein': { lines: ['PLANT'], hero: 'PROTEIN' },
  'pre-workout': { lines: ['PRE-WORKOUT'], hero: 'ENERGY' },
  'creatine-monohydrate': { lines: ['CREATINE'], hero: 'MONO', category: 'MICRONISED POWDER' },
  bcaa: { lines: ['BCAA'], hero: 'AMINOS' },
  'peanut-butter': { lines: ['PEANUT'], hero: 'BUTTER', category: 'SPREAD' },
};

export function packSpec(p: Product, flavour?: Flavour, size?: string): PackSpec {
  // Net weight printed on the pack: chosen size, else the product's first size; [x] when TBC
  const first = p.sizes[0]?.label ?? '';
  const sizeLabel = size ?? (/tbc/i.test(first) ? '[x] g' : first);
  const fl = flavour && flavour.family !== 'tbc' ? flavour : undefined;
  const flavourName = fl?.name ?? (p.flavours[0]?.family === 'tbc' ? 'Flavour TBC' : p.flavours[0]?.name ?? '');
  const flavourColor = fl?.color ?? '#6b4029';
  const accent = ACCENT[p.id] ?? MB_YELLOW;
  const powder = fl?.color ?? '#e9dfcb';
  const isBiozyme = p.id.startsWith('biozyme');
  const base = p.id === 'biozyme-iso-zero' ? '#4a4d52' : p.id === 'biozyme-gold-whey' ? '#33302a' : CHARCOAL;

  const wrap = (): WrapLabelSpec => ({
    ...(LINES[p.id] ?? { lines: [p.shortName.toUpperCase()], hero: '' }),
    accent,
    base,
    flavourName,
    flavourColor,
    netWeight: sizeLabel,
    badgeTop: p.isClinicallyTested ? 'CLINICALLY' : undefined,
    badgeSub: p.isClinicallyTested ? 'TESTED · HIGHER PROTEIN\nABSORPTION BY' : undefined,
    badgeBig: p.isClinicallyTested ? '50%' : undefined,
    features: isBiozyme ? ['Enhanced Absorption Formula (EAF)', 'Tested on Indian bodies'] : ['Lab verified', 'Authenticity code on every tub'],
    certified: isBiozyme,
    nutrition: p.nutrition.sourced ? p.nutrition : null,
    servings: null,
  });

  // Choosing a sachet size on a tub product shows the sachet
  const shape = /sachet/i.test(sizeLabel) ? 'sachet' : p.art.shape;
  switch (shape) {
    case 'tub':
      return { kind: 'tub', body: '#9b9da2', cap: '#a9abb0', dims: TUB_2KG, wrap: wrap(), powder };
    case 'tub-wide':
      return { kind: 'tub', body: '#2b2c30', cap: '#3a3b40', dims: TUB_XL, wrap: wrap(), powder };
    case 'jar':
      return { kind: 'jar', body: p.id === 'creatine-monohydrate' ? '#e9eaec' : '#2b2c30', cap: p.id === 'creatine-monohydrate' ? '#2f80ed' : '#1c1d20', dims: JAR, wrap: wrap(), powder };
    case 'pouch': {
      const oats = p.id === 'high-protein-oats';
      return {
        kind: 'pouch',
        body: '#f3f2f0',
        cap: '#f3f2f0',
        powder,
        pouch: oats
          ? { brand: 'MB FIT', lines: ['HIGH', 'PROTEIN', 'OATS'], accent: '#6b4029', flavourName: 'Dark Chocolate', netWeight: '1kg', stripLeft: 'Super Seeds & Raisins', stripRight: '22g Protein', descriptor: 'Breakfast Cereals, including rolled oats', illustration: 'oats' }
          : { brand: 'MB', lines: ['RAW', 'WHEY'], accent: '#2b2c30', flavourName: 'Unflavoured', netWeight: sizeLabel, stripLeft: 'Whey Protein Concentrate', stripRight: 'Lab verified', descriptor: 'Whey protein powder', illustration: 'powder' },
      };
    }
    case 'sachet':
      return {
        kind: 'sachet',
        body: '#2b2c30',
        cap: '#2b2c30',
        powder,
        pouch: { brand: 'MB', lines: ['BIOZYME', 'WHEY'], accent: '#3a3b3f', flavourName, netWeight: '36 g', stripLeft: '1 serve', stripRight: p.nutrition.protein ? `${p.nutrition.protein}g Protein` : 'Protein [x] g', descriptor: 'Trial sachet', illustration: 'none' },
      };
    case 'bottle': {
      const name = p.shortName.toUpperCase();
      return { kind: 'bottle', body: '#1d1e21', cap: '#e8202a', powder, bottle: { name, sub: 'DAILY ESSENTIALS', accent: p.id === 'fish-oil' ? '#e3a62b' : p.id === 'multivitamin' ? '#3fb36b' : '#3a8de0', base: CHARCOAL } };
    }
    case 'bar':
      return { kind: 'bar', body: '#4a2a1a', cap: '#4a2a1a', powder, bar: { name: 'Protein Bar', accent: '#7a3b22', flavour: 'Flavour TBC' } };
    case 'shaker':
    default:
      return { kind: 'shaker', body: '#141416', cap: '#141416', powder };
  }
}

/** Camera framing per pack kind: distance, look height, and where the floor sits. */
export function framing(spec: PackSpec) {
  const F: Record<PackKind, { z: number; y: number; floorY: number }> = {
    tub: { z: 9.4, y: 0.15, floorY: -1.3 },
    jar: { z: 7.2, y: 0.1, floorY: -1.03 },
    pouch: { z: 8.6, y: 0.1, floorY: -1.43 },
    sachet: { z: 6.4, y: 0.05, floorY: -0.96 },
    bottle: { z: 6.6, y: 0.05, floorY: -1.07 },
    bar: { z: 8, y: 0, floorY: -0.8 },
    shaker: { z: 8.4, y: 0.1, floorY: -1.3 },
  };
  const f = { ...F[spec.kind] };
  if (spec.dims) {
    const total = spec.dims.height + 0.14 + spec.dims.capH;
    f.floorY = -total / 2;
    if (spec.dims.radius > 1.05) f.z = 10.4;
  }
  return f;
}
