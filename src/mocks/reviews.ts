/**
 * MOCK REVIEWS — sample data, not real customers.
 * ------------------------------------------------------------
 * A handful of reviews per main product so the reviews block, its rating
 * summary and filters can be demonstrated. Replace `getReviews` and
 * `getRatingBreakdown` with the reviews service before launch.
 */
import type { Product } from '@/data/types';

export type ReviewTag = 'Mixability' | 'Taste' | 'Results';

export interface Review {
  id: string;
  productId: string;
  name: string;
  city: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  /** Flavour id the reviewer bought */
  flavourId: string | null;
  tags: ReviewTag[];
  hasPhoto: boolean;
  /** ISO date */
  date: string;
  verified: boolean;
}

type Seed = Omit<Review, 'id' | 'productId' | 'verified'> & { verified?: boolean };

// MOCK — replace with real data
const SEEDS: Record<string, Seed[]> = {
  'biozyme-performance-whey': [
    { name: 'Aditya Rao', city: 'Hyderabad', rating: 5, title: 'No bloating at all', body: 'Switched from another brand that always left me bloated. Biozyme sits light even right after training. Mixes in a few shakes.', flavourId: 'rich-milk-chocolate', tags: ['Mixability', 'Results'], hasPhoto: true, date: '2026-09-21' },
    { name: 'Neha Gupta', city: 'Delhi', rating: 5, title: 'Kesar Pista Badam is a winner', body: 'Tastes like thandai without being too sweet. I have it with cold milk after evening workouts.', flavourId: 'kesar-pista-badam', tags: ['Taste'], hasPhoto: false, date: '2026-09-02' },
    { name: 'Vikram Patil', city: 'Mumbai', rating: 4, title: 'Good protein, lab report is a plus', body: 'Verified my tub and checked the batch report, which gave me confidence. Hazelnut is nice but slightly sweet for me.', flavourId: 'chocolate-hazelnut', tags: ['Taste'], hasPhoto: false, date: '2026-08-17' },
    { name: 'Sanjana Reddy', city: 'Chennai', rating: 5, title: 'Smooth in water', body: 'French Vanilla Creme mixes smoothly in plain water, no lumps. Recovery between sessions feels better.', flavourId: 'french-vanilla-creme', tags: ['Mixability', 'Results'], hasPhoto: true, date: '2026-07-30' },
    { name: 'Karan Malhotra', city: 'Chandigarh', rating: 4, title: 'Mango is refreshing', body: 'Different from the usual chocolate. Great in summer. Would love a bigger scoop though.', flavourId: 'mango', tags: ['Taste'], hasPhoto: false, date: '2026-06-11' },
    { name: 'Ishaan Bose', city: 'Kolkata', rating: 3, title: 'Decent, a bit pricey', body: 'Quality is good and digestion is fine, but I wait for sales to stock up.', flavourId: 'rich-milk-chocolate', tags: [], hasPhoto: false, date: '2026-05-04' },
  ],
  'biozyme-sachets': [
    { name: 'Meera Joshi', city: 'Ahmedabad', rating: 5, title: 'Perfect for trying flavours', body: 'Tried all the flavours before buying a tub. Ended up with Rich Milk Chocolate.', flavourId: 'rich-milk-chocolate', tags: ['Taste'], hasPhoto: false, date: '2026-09-12' },
    { name: 'Rahul Nair', city: 'Kochi', rating: 4, title: 'Great for travel', body: 'Easy to carry in a gym bag. Mixes well in a bottle with a quick shake.', flavourId: 'mango', tags: ['Mixability'], hasPhoto: true, date: '2026-08-08' },
    { name: 'Pooja Sinha', city: 'Patna', rating: 5, title: 'Kesar Pista is the one', body: 'Never thought whey could taste this good. Ordering the 1 kg tub next.', flavourId: 'kesar-pista-badam', tags: ['Taste'], hasPhoto: false, date: '2026-07-19' },
  ],
  'biozyme-gold-whey': [
    { name: 'Siddharth Kulkarni', city: 'Nagpur', rating: 5, title: 'Café Mocha is excellent', body: 'Like a cold coffee. Mixes well and keeps me full through the morning.', flavourId: 'cafe-mocha', tags: ['Taste', 'Mixability'], hasPhoto: true, date: '2026-09-15' },
    { name: 'Divya Menon', city: 'Thiruvananthapuram', rating: 4, title: 'Solid everyday whey', body: 'Good taste, easy on the stomach. Rich Chocolate is quite sweet.', flavourId: 'rich-chocolate', tags: ['Taste'], hasPhoto: false, date: '2026-08-03' },
    { name: 'Amit Choudhary', city: 'Jaipur', rating: 4, title: 'Seeing progress', body: 'Two months in, strength is up and recovery is better. Malai Kulfi is unique.', flavourId: 'malai-kulfi', tags: ['Results'], hasPhoto: false, date: '2026-06-26' },
    { name: 'Farhan Sheikh', city: 'Lucknow', rating: 5, title: 'Worth it', body: 'Premium feel, no lumps, no aftertaste.', flavourId: 'cafe-mocha', tags: ['Mixability'], hasPhoto: false, date: '2026-05-14' },
  ],
  'biozyme-iso-zero': [
    { name: 'Ananya Krishnan', city: 'Bengaluru', rating: 5, title: 'Great for my cut', body: 'Almost no carbs and I am lactose-sensitive — no issues at all. Ice Cream Chocolate tastes like dessert.', flavourId: 'ice-cream-chocolate', tags: ['Taste', 'Results'], hasPhoto: true, date: '2026-09-18' },
    { name: 'Tanvi Shah', city: 'Surat', rating: 4, title: 'Light and clean', body: 'Mixes thin in water, which I like. Strawberry is mild.', flavourId: 'strawberry', tags: ['Mixability'], hasPhoto: false, date: '2026-08-22' },
    { name: 'Arjun Pillai', city: 'Mysuru', rating: 5, title: 'Lean gains', body: 'Dropped 4 kg while keeping my lifts. Vanilla goes well with oats too.', flavourId: 'classic-vanilla', tags: ['Results'], hasPhoto: false, date: '2026-07-07' },
    { name: 'Rhea Dsouza', city: 'Goa', rating: 4, title: 'Easy on the stomach', body: 'Finally a whey that does not upset my stomach. A bit expensive.', flavourId: 'ice-cream-chocolate', tags: [], hasPhoto: false, date: '2026-05-29' },
  ],
  'raw-whey': [
    { name: 'Gaurav Mishra', city: 'Bhopal', rating: 5, title: 'Mix it with anything', body: 'I add it to my morning oats and besan chilla. No taste, just protein.', flavourId: 'unflavoured', tags: ['Mixability'], hasPhoto: true, date: '2026-09-09' },
    { name: 'Lakshmi Narayanan', city: 'Coimbatore', rating: 4, title: 'Good value', body: 'Clean protein at a good price. Tastes like milk powder in water, so I use milk.', flavourId: 'unflavoured', tags: ['Taste'], hasPhoto: false, date: '2026-07-25' },
    { name: 'Manish Yadav', city: 'Indore', rating: 4, title: 'Beginner friendly', body: 'My first protein. Easy to digest and helped me hit my daily target.', flavourId: 'unflavoured', tags: ['Results'], hasPhoto: false, date: '2026-06-02' },
  ],
  'mass-gainer-xxl': [
    { name: 'Harpreet Singh', city: 'Ludhiana', rating: 5, title: 'Finally gaining', body: 'Up 6 kg in three months with this and proper meals. Kesar Pista Badam is my favourite.', flavourId: 'kesar-pista-badam', tags: ['Results', 'Taste'], hasPhoto: true, date: '2026-09-11' },
    { name: 'Sahil Khan', city: 'Bhopal', rating: 4, title: 'Heavy but works', body: 'A full serving is filling, so I split it into two shakes. Chocolate is nice.', flavourId: 'chocolate', tags: ['Results'], hasPhoto: false, date: '2026-08-01' },
    { name: 'Ritesh Das', city: 'Guwahati', rating: 4, title: 'Mixes well with milk', body: 'Use a blender for best results. Banana flavour tastes natural.', flavourId: 'banana', tags: ['Mixability', 'Taste'], hasPhoto: false, date: '2026-06-19' },
    { name: 'Abhinav Tiwari', city: 'Varanasi', rating: 3, title: 'Too sweet for me', body: 'Does the job for calories but it is on the sweeter side.', flavourId: 'chocolate', tags: ['Taste'], hasPhoto: false, date: '2026-04-27' },
  ],
  'creatine-monohydrate': [
    { name: 'Rohan Verma', city: 'Pune', rating: 5, title: 'Strength up', body: '3 g every day in my shake. Noticed a few extra reps on squats after a month.', flavourId: 'unflavoured', tags: ['Results'], hasPhoto: false, date: '2026-09-05' },
    { name: 'Kavya Hegde', city: 'Mangaluru', rating: 5, title: 'Dissolves fully', body: 'Micronised powder dissolves in water, no grit at the bottom.', flavourId: 'unflavoured', tags: ['Mixability'], hasPhoto: true, date: '2026-07-21' },
    { name: 'Nikhil Saxena', city: 'Noida', rating: 4, title: 'Simple and effective', body: 'No flavour, no fuss. The 250 g tub lasts almost three months.', flavourId: 'unflavoured', tags: ['Results'], hasPhoto: false, date: '2026-06-08' },
  ],
};

/** Generic sample reviews for SKUs without their own seeds. */
const GENERIC: Seed[] = [
  { name: 'Priya Agarwal', city: 'Kanpur', rating: 5, title: 'Happy with it', body: 'Genuine product, delivered quickly and well packed. Will reorder.', flavourId: null, tags: ['Results'], hasPhoto: false, date: '2026-09-03' },
  { name: 'Deepak Rawat', city: 'Dehradun', rating: 4, title: 'Good quality', body: 'Does what it says. Verified the authenticity code without any issues.', flavourId: null, tags: [], hasPhoto: true, date: '2026-07-16' },
  { name: 'Shreya Banerjee', city: 'Kolkata', rating: 4, title: 'Nice taste', body: 'Better than I expected. Fits easily into my daily routine.', flavourId: null, tags: ['Taste'], hasPhoto: false, date: '2026-05-30' },
];

export function getReviews(product: Product): Review[] {
  const seeds = SEEDS[product.id] ?? GENERIC.map((s) => ({ ...s, flavourId: product.flavours[0]?.id ?? null }));
  return seeds.map((s, i) => ({ ...s, id: `${product.id}-r${i + 1}`, productId: product.id, verified: s.verified ?? true }));
}

/**
 * Star distribution (5 → 1) as shares of the product's total review count.
 * MOCK — derived from the mock average so the summary bars match it.
 */
export function getRatingBreakdown(product: Product): { stars: 5 | 4 | 3 | 2 | 1; count: number }[] {
  // Fixed 3★/2★/1★ tail (7% / 3% / 2%); 5★ vs 4★ split so the mean equals product.rating
  const p5 = Math.min(0.88, Math.max(0, product.rating - 3.81));
  const shares = [p5, 0.88 - p5, 0.07, 0.03, 0.02];
  const counts = shares.map((x) => Math.round(x * product.reviewCount));
  return ([5, 4, 3, 2, 1] as const).map((stars, i) => ({ stars, count: counts[i] }));
}
