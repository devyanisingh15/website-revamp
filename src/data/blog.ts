export interface Article {
  slug: string;
  title: string;
  topic: 'Basics' | 'Nutrition' | 'Myths' | 'Beginners' | 'Veg' | 'Authenticity' | 'Supplements' | 'Recovery';
  /** Body, author, date and read time come from the CMS — not supplied yet */
  excerpt: string | null;
  readMinutes: number | null;
  relatedProductIds: string[];
  /** Visual motif for the generated cover */
  motif: 'split' | 'grid' | 'cross' | 'stack' | 'leaf' | 'scan' | 'bolt' | 'clock';
}

/** Fit Hub launch articles — titles from the content document. */
export const ARTICLES: Article[] = [
  { slug: 'whey-concentrate-vs-isolate', title: 'Whey Concentrate vs Isolate: Which One Is Right for You?', topic: 'Basics', excerpt: null, readMinutes: null, relatedProductIds: ['biozyme-performance-whey', 'biozyme-iso-zero'], motif: 'split' },
  { slug: 'how-much-protein-do-indians-need', title: 'How Much Protein Do Indians Really Need?', topic: 'Nutrition', excerpt: null, readMinutes: null, relatedProductIds: ['biozyme-performance-whey'], motif: 'grid' },
  { slug: 'protein-myths-debunked', title: 'Protein Myths Debunked: Kidneys, Hair Fall and More', topic: 'Myths', excerpt: null, readMinutes: null, relatedProductIds: ['raw-whey'], motif: 'cross' },
  { slug: 'beginners-guide-first-supplement-stack', title: "The Beginner's Guide to Your First Supplement Stack", topic: 'Beginners', excerpt: null, readMinutes: null, relatedProductIds: ['raw-whey', 'biozyme-sachets', 'shaker-bottle'], motif: 'stack' },
  { slug: 'veg-diet-big-gains', title: 'Veg Diet, Big Gains: Hitting Protein Goals Without Meat', topic: 'Veg', excerpt: null, readMinutes: null, relatedProductIds: ['plant-protein', 'biozyme-performance-whey'], motif: 'leaf' },
  { slug: 'how-to-spot-fake-protein-powder', title: 'How to Spot a Fake Protein Powder', topic: 'Authenticity', excerpt: null, readMinutes: null, relatedProductIds: ['biozyme-performance-whey'], motif: 'scan' },
  { slug: 'creatine-101', title: 'Creatine 101: What It Does and How to Take It', topic: 'Supplements', excerpt: null, readMinutes: null, relatedProductIds: ['creatine-monohydrate'], motif: 'bolt' },
  { slug: 'post-workout-nutrition', title: 'Post-Workout Nutrition: What to Eat and When', topic: 'Recovery', excerpt: null, readMinutes: null, relatedProductIds: ['biozyme-performance-whey'], motif: 'clock' },
];

export const getArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug);
