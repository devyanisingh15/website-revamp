import type { PackSize, Product } from './types';
import { BIOZYME_FLAVOURS, MOCK_FLAVOURS as F, UNFLAVOURED } from './flavours';

/**
 * PRODUCT CATALOGUE — MOCK DATA
 * ------------------------------------------------------------
 * Sourced from the content document (do not change without a new source):
 *   - product names and categories
 *   - Biozyme Performance: 25 g protein, 11.75 g EAAs, 5.51 g BCAAs,
 *     ~120 kcal per scoop, "50% higher protein absorption", the five
 *     Biozyme flavours (see `BIOZYME_FLAVOURS`)
 *   - High Protein Oats: "22 g protein per 100 g" (pack image)
 *
 * Everything else — one-liners not in the document, nutrition for other
 * SKUs, extra label rows, flavour ranges, pack sizes, servings, ratings and
 * review counts — is MOCK data so the concept looks complete.
 * Replace this module with a fetch from the product information service.
 * Prices live separately in `src/mocks/pricing.ts`; reviews in `src/mocks/reviews.ts`.
 */

// MOCK — replace with real data
const BIOZYME_SIZES: PackSize[] = [
  { id: '1kg', label: '1 kg', family: '500g-1kg', servings: 27 },
  { id: '2kg', label: '2 kg', family: '2kg', servings: 55 },
  { id: '4kg', label: '4 kg', family: '4kg+', servings: 111 },
  { id: 'sachet-5x36', label: 'Sachet pack (5 × 36 g)', family: 'sachet', servings: 5 },
];

/** 33 g scoop whey sizes (Gold, Iso Zero, Raw) — MOCK servings */
const WHEY_33G_SIZES: PackSize[] = [
  { id: '1kg', label: '1 kg', family: '500g-1kg', servings: 30 },
  { id: '2kg', label: '2 kg', family: '2kg', servings: 60 },
  { id: '4kg', label: '4 kg', family: '4kg+', servings: 121 },
];

export const PRODUCTS: Product[] = [
  {
    id: 'biozyme-performance-whey',
    slug: 'biozyme-performance-whey-protein',
    name: 'MuscleBlaze Biozyme Performance Whey Protein',
    shortName: 'Biozyme Performance',
    category: 'whey-protein',
    oneLiner: 'Clinically tested whey for 50% higher protein absorption.',
    whoItsFor: 'Gym-goers and athletes aiming to build muscle, recover faster and hit daily protein targets.',
    proteinType: 'concentrate',
    goals: ['muscle-gain', 'general-fitness'],
    // protein / EAAs / BCAAs / calories from the content document; carbs, sugars, fat, sodium, serving size are MOCK
    nutrition: { protein: 25, carbs: 3.6, bcaas: 5.51, eaas: 11.75, calories: 120, sugars: 1.4, fat: 1.2, sodium: 82, servingSize: '36 g', servingLabel: 'scoop', sourced: true },
    flavours: BIOZYME_FLAVOURS,
    sizes: BIOZYME_SIZES,
    rating: 4.5, // MOCK
    reviewCount: 12486, // MOCK
    art: { shape: 'tub', body: '#121214', label: 'BIOZYME', sub: 'PERFORMANCE', bandText: 'WHEY PROTEIN' },
    model3d: null,
    image: null,
    isClinicallyTested: true,
    frequentlyBoughtWith: ['creatine-monohydrate', 'shaker-bottle', 'fish-oil'],
    addedAt: '2024-01-01',
  },
  {
    id: 'biozyme-gold-whey',
    slug: 'biozyme-gold-100-whey',
    name: 'MuscleBlaze Biozyme Gold 100% Whey',
    shortName: 'Biozyme Gold',
    category: 'whey-protein',
    oneLiner: 'A whey concentrate and isolate blend for everyday muscle building.', // MOCK
    whoItsFor: 'Regular lifters who want a premium blend with smooth mixability.', // MOCK
    proteinType: 'blend',
    goals: ['muscle-gain'],
    // MOCK — replace with real label values
    nutrition: { protein: 24, carbs: 3.2, bcaas: 5.4, eaas: 11.2, calories: 118, sugars: 1.2, fat: 1.4, sodium: 75, servingSize: '33 g', servingLabel: 'scoop', sourced: false },
    flavours: [F.richChocolate, F.cafeMocha, F.malaiKulfi],
    sizes: WHEY_33G_SIZES,
    rating: 4.4,
    reviewCount: 6312,
    art: { shape: 'tub', body: '#1a1508', label: 'BIOZYME', sub: 'GOLD 100% WHEY', bandText: 'WHEY PROTEIN' },
    model3d: null,
    image: null,
    frequentlyBoughtWith: ['creatine-monohydrate', 'shaker-bottle'],
    addedAt: '2024-03-01',
  },
  {
    id: 'biozyme-iso-zero',
    slug: 'biozyme-iso-zero',
    name: 'MuscleBlaze Biozyme Iso Zero',
    shortName: 'Biozyme Iso Zero',
    category: 'whey-protein',
    oneLiner: 'Choose Iso Zero if you want lower carbs or are lactose-sensitive.',
    whoItsFor: 'Anyone cutting, counting carbs or who finds regular whey heavy on the stomach.', // MOCK
    proteinType: 'isolate',
    goals: ['fat-loss', 'muscle-gain'],
    // MOCK — replace with real label values
    nutrition: { protein: 27, carbs: 0.8, bcaas: 6.1, eaas: 12.6, calories: 114, sugars: 0.3, fat: 0.4, sodium: 64, servingSize: '33 g', servingLabel: 'scoop', sourced: false },
    flavours: [F.iceCreamChocolate, F.classicVanilla, F.strawberry],
    sizes: WHEY_33G_SIZES.slice(0, 2),
    rating: 4.5,
    reviewCount: 3128,
    art: { shape: 'tub', body: '#e9ecef', label: 'BIOZYME', sub: 'ISO ZERO', bandText: 'WHEY PROTEIN' },
    model3d: null,
    image: null,
    frequentlyBoughtWith: ['l-carnitine', 'shaker-bottle'],
    addedAt: '2024-06-01',
  },
  {
    id: 'raw-whey',
    slug: 'raw-whey-protein',
    name: 'MuscleBlaze Raw Whey Protein',
    shortName: 'Raw Whey',
    category: 'whey-protein',
    oneLiner: 'Unflavoured whey concentrate, nothing added. Mix it into anything.', // MOCK
    whoItsFor: 'Beginners and anyone who wants to add protein to shakes, oats or atta.', // MOCK
    proteinType: 'concentrate',
    goals: ['general-fitness', 'muscle-gain'],
    // MOCK — replace with real label values
    nutrition: { protein: 24, carbs: 2.6, bcaas: 5.3, eaas: 10.9, calories: 123, sugars: 2.1, fat: 1.9, sodium: 70, servingSize: '33 g', servingLabel: 'scoop', sourced: false },
    flavours: [UNFLAVOURED],
    sizes: WHEY_33G_SIZES.slice(0, 2),
    rating: 4.3,
    reviewCount: 4870,
    art: { shape: 'pouch', body: '#f2efe9', label: 'RAW WHEY', sub: 'UNFLAVOURED' },
    model3d: null,
    image: null,
    frequentlyBoughtWith: ['shaker-bottle', 'multivitamin'],
    addedAt: '2023-01-01',
  },
  {
    id: 'mass-gainer-xxl',
    slug: 'mass-gainer-xxl',
    name: 'MuscleBlaze Mass Gainer XXL',
    shortName: 'Mass Gainer XXL',
    category: 'mass-gainers',
    oneLiner: 'Calories and protein in one shake for hard gainers.',
    whoItsFor: 'Lean builds and hard gainers who struggle to eat enough in a day.', // MOCK
    proteinType: 'blend',
    goals: ['weight-gain'],
    // MOCK — replace with real label values (per 100 g serving)
    nutrition: { protein: 15, carbs: 76, bcaas: 3.1, eaas: 6.6, calories: 382, sugars: 9.5, fat: 1.6, sodium: 160, servingSize: '100 g', servingLabel: 'serving', sourced: false },
    flavours: [F.chocolate, F.banana, BIOZYME_FLAVOURS[4]],
    sizes: [
      { id: '1kg', label: '1 kg', family: '500g-1kg', servings: 10 },
      { id: '3kg', label: '3 kg', family: '2kg', servings: 30 },
      { id: '5kg', label: '5 kg', family: '4kg+', servings: 50 },
    ],
    rating: 4.3,
    reviewCount: 5604,
    art: { shape: 'tub-wide', body: '#1b1b1f', label: 'MASS GAINER', sub: 'XXL' },
    model3d: null,
    image: null,
    frequentlyBoughtWith: ['creatine-monohydrate', 'peanut-butter'],
    addedAt: '2023-05-01',
  },
  {
    id: 'plant-protein',
    slug: 'plant-protein',
    name: 'MuscleBlaze Plant Protein',
    shortName: 'Plant Protein',
    category: 'plant-protein',
    oneLiner: 'Complete plant protein for dairy-free days.',
    whoItsFor: 'Vegans, the lactose-intolerant and anyone cutting back on dairy.', // MOCK
    proteinType: 'plant',
    goals: ['general-fitness', 'muscle-gain'],
    // MOCK — replace with real label values
    nutrition: { protein: 25, carbs: 3.8, bcaas: 4.8, eaas: 9.8, calories: 132, sugars: 0.9, fat: 2.2, sodium: 290, servingSize: '35 g', servingLabel: 'scoop', sourced: false },
    flavours: [F.chocolate, F.coffeeCaramel],
    sizes: [
      { id: '500g', label: '500 g', family: '500g-1kg', servings: 14 },
      { id: '1kg', label: '1 kg', family: '500g-1kg', servings: 28 },
    ],
    rating: 4.2,
    reviewCount: 742,
    art: { shape: 'tub', body: '#1e2a1d', label: 'PLANT', sub: 'PROTEIN' },
    model3d: null,
    image: null,
    frequentlyBoughtWith: ['bcaa', 'peanut-butter'],
    addedAt: '2024-08-01',
  },
  {
    id: 'pre-workout',
    slug: 'pre-workout',
    name: 'MuscleBlaze Pre-Workout',
    shortName: 'Pre-Workout',
    category: 'pre-workout',
    oneLiner: 'Energy and focus for your heaviest sets.',
    whoItsFor: 'Experienced lifters training hard. Not for under-18s or the caffeine-sensitive.', // MOCK
    proteinType: null,
    goals: ['muscle-gain'],
    // MOCK — per 10 g scoop
    nutrition: { protein: null, carbs: 1.2, bcaas: null, eaas: null, calories: 6, sugars: 0, fat: 0, sodium: 45, servingSize: '10 g', servingLabel: 'scoop', sourced: false },
    keySpecs: ['175 mg Caffeine', '3 g L-Citrulline', '2 g Beta-Alanine'],
    flavours: [F.fruitPunch, F.greenApple, F.watermelon],
    sizes: [{ id: '300g', label: '300 g', family: 'unit', servings: 30 }],
    rating: 4.3,
    reviewCount: 1186,
    art: { shape: 'jar', body: '#26070a', label: 'PRE', sub: 'WORKOUT' },
    model3d: null,
    image: null,
    frequentlyBoughtWith: ['creatine-monohydrate', 'shaker-bottle'],
    addedAt: '2024-02-01',
  },
  {
    id: 'creatine-monohydrate',
    slug: 'creatine-monohydrate',
    name: 'MuscleBlaze Creatine Monohydrate',
    shortName: 'Creatine Monohydrate',
    category: 'creatine',
    oneLiner: 'The most researched supplement for strength and power.',
    whoItsFor: 'Anyone lifting for strength or size. Take 3 g daily, training day or not.', // MOCK
    proteinType: null,
    goals: ['muscle-gain', 'weight-gain'],
    // MOCK — per 3 g serve
    nutrition: { protein: null, carbs: 0, bcaas: null, eaas: null, calories: 0, sugars: 0, fat: 0, sodium: 0, servingSize: '3 g', servingLabel: 'serve', sourced: false },
    keySpecs: ['3 g Creatine per serve', 'Micronised', 'Zero sugar'],
    flavours: [UNFLAVOURED],
    sizes: [
      { id: '250g', label: '250 g', family: 'unit', servings: 83 },
      { id: '100g', label: '100 g', family: 'unit', servings: 33 },
    ],
    rating: 4.5,
    reviewCount: 7935,
    art: { shape: 'jar', body: '#f2efe9', label: 'CREATINE', sub: 'MONOHYDRATE' },
    model3d: null,
    image: null,
    frequentlyBoughtWith: ['biozyme-performance-whey', 'shaker-bottle'],
    addedAt: '2023-09-01',
  },
  {
    id: 'bcaa',
    slug: 'bcaa',
    name: 'MuscleBlaze BCAA',
    shortName: 'BCAAs',
    category: 'bcaas-eaas',
    oneLiner: 'Intra-workout aminos to keep you going.',
    whoItsFor: 'Lifters and runners with long sessions who like something to sip while training.', // MOCK
    proteinType: null,
    goals: ['general-fitness'],
    // MOCK — per 10 g scoop
    nutrition: { protein: null, carbs: 1, bcaas: 7, eaas: null, calories: 8, sugars: 0, fat: 0, sodium: 120, servingSize: '10 g', servingLabel: 'scoop', sourced: false },
    keySpecs: ['7 g BCAAs (2:1:1)', 'Electrolytes', 'Zero sugar'],
    flavours: [F.watermelon, F.greenApple, F.orange],
    sizes: [{ id: '450g', label: '450 g', family: 'unit', servings: 45 }],
    rating: 4.2,
    reviewCount: 968,
    art: { shape: 'jar', body: '#0c2230', label: 'BCAA', sub: 'AMINOS' },
    model3d: null,
    image: null,
    frequentlyBoughtWith: ['shaker-bottle', 'plant-protein'],
    addedAt: '2023-07-01',
  },
  {
    id: 'protein-bar',
    slug: 'protein-bar',
    name: 'MuscleBlaze Protein Bar',
    shortName: 'Protein Bar',
    category: 'bars-snacks',
    oneLiner: 'High-protein snacks for the space between meals.',
    whoItsFor: 'Busy days, office drawers and gym bags.', // MOCK
    proteinType: null,
    goals: ['fat-loss', 'general-fitness'],
    // MOCK — per 60 g bar
    nutrition: { protein: 20, carbs: 22, bcaas: null, eaas: null, calories: 248, sugars: 3.5, fat: 8.2, sodium: 140, servingSize: '60 g', servingLabel: 'bar', sourced: false },
    flavours: [F.chocoAlmond, F.coffeeMocha],
    sizes: [
      { id: 'pack-6', label: 'Box of 6', family: 'unit', servings: 6 },
      { id: 'pack-12', label: 'Box of 12', family: 'unit', servings: 12 },
    ],
    rating: 4.3,
    reviewCount: 1412,
    art: { shape: 'bar', body: '#2b1810', label: 'PROTEIN BAR' },
    model3d: null,
    image: null,
    addedAt: '2024-04-01',
  },
  {
    id: 'peanut-butter',
    slug: 'peanut-butter',
    name: 'MuscleBlaze Peanut Butter',
    shortName: 'Peanut Butter',
    category: 'bars-snacks',
    oneLiner: 'High-protein peanut butter with roasted peanuts. No palm oil.', // MOCK
    whoItsFor: 'Anyone who wants an easy, calorie-dense add-on to toast, oats or shakes.', // MOCK
    proteinType: null,
    goals: ['weight-gain', 'general-fitness'],
    // MOCK — per 32 g serving (2 tbsp)
    nutrition: { protein: 9, carbs: 5.8, bcaas: null, eaas: null, calories: 192, sugars: 2.4, fat: 14.6, sodium: 90, servingSize: '32 g', servingLabel: 'serving', sourced: false },
    flavours: [F.darkChocolate, F.unsweetened],
    sizes: [{ id: '1kg', label: '1 kg', family: '500g-1kg', servings: 31 }],
    rating: 4.4,
    reviewCount: 3560,
    art: { shape: 'jar', body: '#b5762f', label: 'PEANUT', sub: 'BUTTER' },
    model3d: null,
    image: null,
    addedAt: '2023-11-01',
  },
  {
    id: 'high-protein-oats',
    slug: 'mb-fit-high-protein-oats',
    name: 'MuscleBlaze MB FiT High Protein Oats',
    shortName: 'High Protein Oats',
    category: 'bars-snacks',
    // From the supplied pack image: "22g Protein per 100g", "Super Seeds & Raisins"
    oneLiner: '22 g protein per 100 g, with super seeds & raisins.',
    whoItsFor: 'A quick high-protein breakfast before work or training.', // MOCK
    proteinType: null,
    goals: ['general-fitness', 'weight-gain'],
    // 22 g / 100 g from the pack image → 11 g per 50 g; other rows MOCK
    nutrition: { protein: 11, carbs: 30, bcaas: null, eaas: null, calories: 196, sugars: 4.2, fat: 3.8, sodium: 35, servingSize: '50 g', servingLabel: 'bowl', sourced: false },
    flavours: [{ id: 'dark-chocolate', name: 'Dark Chocolate', family: 'chocolate', color: '#5a3420', accent: '#8a5a3c', notes: ['Cocoa'] }],
    sizes: [{ id: '1kg', label: '1 kg', family: '500g-1kg', servings: 20 }],
    rating: 4.3,
    reviewCount: 1072,
    art: { shape: 'pouch', body: '#6b4029', label: 'HIGH PROTEIN OATS', sub: 'MB FIT' },
    model3d: null,
    image: null,
    addedAt: '2024-09-01',
  },
  {
    id: 'biozyme-sachets',
    slug: 'biozyme-performance-whey-sachets',
    name: 'MuscleBlaze Biozyme Performance Whey Sachets',
    shortName: 'Biozyme Sachets',
    category: 'sachets',
    oneLiner: 'Try a flavour before you commit to a tub.',
    whoItsFor: 'First-timers, travellers and anyone choosing a flavour.', // MOCK
    proteinType: 'concentrate',
    goals: ['general-fitness', 'muscle-gain'],
    // Same formula as Biozyme Performance (sourced figures); extra rows MOCK
    nutrition: { protein: 25, carbs: 3.6, bcaas: 5.51, eaas: 11.75, calories: 120, sugars: 1.4, fat: 1.2, sodium: 82, servingSize: '36 g', servingLabel: 'sachet', sourced: true },
    flavours: BIOZYME_FLAVOURS,
    sizes: [{ id: 'sachet-5x36', label: 'Sachet pack (5 × 36 g)', family: 'sachet', servings: 5 }],
    rating: 4.5,
    reviewCount: 2214,
    art: { shape: 'sachet', body: '#121214', label: 'BIOZYME', sub: 'TRIAL' },
    model3d: null,
    image: null,
    isClinicallyTested: true,
    frequentlyBoughtWith: ['shaker-bottle', 'biozyme-performance-whey'],
    addedAt: '2024-05-01',
  },
  {
    id: 'l-carnitine',
    slug: 'l-carnitine',
    name: 'MuscleBlaze L-Carnitine',
    shortName: 'L-Carnitine',
    category: 'wellness',
    oneLiner: 'L-Carnitine L-Tartrate capsules to support your cutting routine.', // MOCK
    whoItsFor: 'People on a calorie deficit who train regularly. Works alongside diet and exercise, not instead of them.', // MOCK
    proteinType: null,
    goals: ['fat-loss'],
    // MOCK
    nutrition: { protein: null, carbs: null, bcaas: null, eaas: null, calories: null, servingLabel: 'capsule', sourced: false },
    keySpecs: ['1,000 mg L-Carnitine L-Tartrate', '2 capsules a day', 'Veg capsules'],
    flavours: [UNFLAVOURED],
    sizes: [{ id: '60caps', label: '60 capsules', family: 'unit', servings: 30 }],
    rating: 4.2,
    reviewCount: 611,
    art: { shape: 'bottle', body: '#0d1f2b', label: 'L-CARNITINE' },
    model3d: null,
    image: null,
    addedAt: '2023-10-01',
  },
  {
    id: 'multivitamin',
    slug: 'multivitamin',
    name: 'MuscleBlaze Multivitamin',
    shortName: 'Multivitamin',
    category: 'wellness',
    oneLiner: 'A daily multivitamin built for active Indians.', // MOCK
    whoItsFor: 'Anyone training regularly who wants to cover everyday micronutrient gaps.', // MOCK
    proteinType: null,
    goals: ['general-fitness'],
    // MOCK
    nutrition: { protein: null, carbs: null, bcaas: null, eaas: null, calories: null, servingLabel: 'tablet', sourced: false },
    keySpecs: ['25 vitamins & minerals', '1 tablet a day', 'With antioxidants'],
    flavours: [UNFLAVOURED],
    sizes: [{ id: '60tabs', label: '60 tablets', family: 'unit', servings: 60 }],
    rating: 4.4,
    reviewCount: 2388,
    art: { shape: 'bottle', body: '#f2efe9', label: 'MULTI', sub: 'VITAMIN' },
    model3d: null,
    image: null,
    addedAt: '2023-08-01',
  },
  {
    id: 'fish-oil',
    slug: 'fish-oil',
    name: 'MuscleBlaze Fish Oil',
    shortName: 'Fish Oil',
    category: 'wellness',
    oneLiner: 'Omega-3 softgels for everyday heart and joint support.', // MOCK
    whoItsFor: 'Anyone who rarely eats oily fish.', // MOCK
    proteinType: null,
    goals: ['general-fitness'],
    // MOCK
    nutrition: { protein: null, carbs: null, bcaas: null, eaas: null, calories: null, servingLabel: 'softgel', sourced: false },
    keySpecs: ['1,000 mg Fish oil', '180 mg EPA · 120 mg DHA', 'Enteric coated'],
    flavours: [UNFLAVOURED],
    sizes: [{ id: '60softgels', label: '60 softgels', family: 'unit', servings: 60 }],
    rating: 4.4,
    reviewCount: 1945,
    art: { shape: 'bottle', body: '#d9a43a', label: 'FISH OIL' },
    model3d: null,
    image: null,
    addedAt: '2023-06-01',
  },
  {
    id: 'shaker-bottle',
    slug: 'shaker-bottle',
    name: 'MuscleBlaze Shaker Bottle',
    shortName: 'Shaker Bottle',
    category: 'accessories',
    oneLiner: 'Leak-proof 700 ml shaker with a mixing ball.', // MOCK
    proteinType: null,
    goals: ['general-fitness'],
    nutrition: { protein: null, carbs: null, bcaas: null, eaas: null, calories: null, sourced: false },
    keySpecs: ['700 ml', 'Leak-proof lid', 'BPA-free'], // MOCK
    flavours: [],
    sizes: [{ id: '700ml', label: '700 ml', family: 'unit', servings: null }],
    rating: 4.3,
    reviewCount: 1327,
    art: { shape: 'shaker', body: '#151517', label: 'MB' },
    model3d: null,
    image: null,
    addedAt: '2023-01-01',
  },
];

export const PRIMARY_PRODUCT_ID = 'biozyme-performance-whey';

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const getProductBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const productsInCategory = (category: string) => PRODUCTS.filter((p) => p.category === category);
