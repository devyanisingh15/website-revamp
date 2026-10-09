export interface ArticleBlock {
  heading?: string;
  paragraphs: string[];
}

export interface Article {
  slug: string;
  title: string;
  topic: 'Basics' | 'Nutrition' | 'Myths' | 'Beginners' | 'Veg' | 'Authenticity' | 'Supplements' | 'Recovery';
  /** MOCK — excerpt, author, date, read time and body come from the CMS once connected */
  excerpt: string;
  author: string;
  /** ISO date */
  publishedAt: string;
  readMinutes: number;
  body: ArticleBlock[];
  relatedProductIds: string[];
  /** Visual motif for the generated cover */
  motif: 'split' | 'grid' | 'cross' | 'stack' | 'leaf' | 'scan' | 'bolt' | 'clock';
}

/**
 * Fit Hub launch articles — titles from the content document.
 * MOCK — excerpts, authors, dates, read times and bodies are sample copy so
 * the templates look complete. Replace with the Fit Hub CMS; all health copy
 * needs editorial and nutritionist review before launch.
 */
export const ARTICLES: Article[] = [
  {
    slug: 'whey-concentrate-vs-isolate',
    title: 'Whey Concentrate vs Isolate: Which One Is Right for You?',
    topic: 'Basics',
    excerpt: 'Both come from milk, both build muscle. The difference is in the filtering — and what that means for carbs, lactose and price.',
    author: 'Ritika Sharma',
    publishedAt: '2026-02-10',
    readMinutes: 5,
    body: [
      {
        paragraphs: [
          'Whey concentrate and whey isolate start life the same way: as the liquid left over when milk is turned into cheese. What separates them is how much further that liquid is filtered.',
          'Concentrate keeps a little more of the natural milk fat and lactose. Isolate is filtered further, so a scoop carries slightly more protein and noticeably fewer carbs.',
        ],
      },
      {
        heading: 'Choose concentrate if…',
        paragraphs: ['You digest dairy without trouble, you want the best value per gram of protein, and you like a creamier shake. For most lifters, concentrate does the job.'],
      },
      {
        heading: 'Choose isolate if…',
        paragraphs: ['You are counting carbs during a cut, or regular whey leaves you bloated. Isolate is lower in lactose, which many lactose-sensitive people find easier to handle.'],
      },
      {
        heading: 'The bottom line',
        paragraphs: ['Your total daily protein matters far more than the type of whey. Pick the one that suits your stomach and budget, and use it consistently.'],
      },
    ],
    relatedProductIds: ['biozyme-performance-whey', 'biozyme-iso-zero'],
    motif: 'split',
  },
  {
    slug: 'how-much-protein-do-indians-need',
    title: 'How Much Protein Do Indians Really Need?',
    topic: 'Nutrition',
    excerpt: 'The 0.8 g per kg guideline is a minimum, not a target. Here is how to work out a sensible number if you train.',
    author: 'Sneha Iyer',
    publishedAt: '2026-01-22',
    readMinutes: 6,
    body: [
      {
        paragraphs: [
          'The commonly quoted figure of 0.8 g of protein per kg of body weight is the amount needed to avoid deficiency in a sedentary adult. If you train regularly, your needs are higher.',
          'Most sports nutrition guidance suggests 1.6–2.2 g per kg for people lifting to build muscle. A 70 kg lifter would aim for roughly 110–150 g a day.',
        ],
      },
      {
        heading: 'Where Indian diets fall short',
        paragraphs: ['Typical vegetarian meals built around rice, roti and a small bowl of dal often land well below that range. Adding paneer, curd, eggs, soya, chana or a protein shake helps close the gap.'],
      },
      {
        heading: 'Spread it out',
        paragraphs: ['Rather than one huge serving, aim for 20–40 g of protein across three or four meals. A shake after training is an easy way to hit one of those.'],
      },
    ],
    relatedProductIds: ['biozyme-performance-whey'],
    motif: 'grid',
  },
  {
    slug: 'protein-myths-debunked',
    title: 'Protein Myths Debunked: Kidneys, Hair Fall and More',
    topic: 'Myths',
    excerpt: 'Whey is a food, not a drug. We look at the most common worries and what the evidence actually says.',
    author: 'Ritika Sharma',
    publishedAt: '2025-11-18',
    readMinutes: 7,
    body: [
      {
        heading: '“Protein damages your kidneys”',
        paragraphs: ['In healthy adults, higher-protein diets within sports nutrition ranges have not been shown to harm kidney function. If you have an existing kidney condition, talk to your doctor before changing your diet.'],
      },
      {
        heading: '“Whey causes hair fall”',
        paragraphs: ['Hair fall has many causes, from genetics and stress to low iron. There is no good evidence that a genuine whey protein causes it. Poor-quality or fake products are a different story — buy from authorised sellers.'],
      },
      {
        heading: '“Supplements are steroids”',
        paragraphs: ['Whey is protein from milk. A tested, genuine whey contains no hormones or anabolic agents, which is why batch lab reports matter.'],
      },
    ],
    relatedProductIds: ['raw-whey'],
    motif: 'cross',
  },
  {
    slug: 'beginners-guide-first-supplement-stack',
    title: "The Beginner's Guide to Your First Supplement Stack",
    topic: 'Beginners',
    excerpt: 'You do not need ten tubs. Start with food, add one protein, and build habits before you add anything else.',
    author: 'Arjun Mehta',
    publishedAt: '2026-03-05',
    readMinutes: 5,
    body: [
      {
        paragraphs: [
          'Supplements fill gaps in a diet; they do not replace one. Before buying anything, get your meals, sleep and training routine in order.',
          'Once those are steady, a simple protein powder is the most useful first purchase. It makes hitting your daily protein target much easier.',
        ],
      },
      {
        heading: 'A sensible first stack',
        paragraphs: ['One protein (a whey or a plant protein), a shaker, and — if your diet lacks variety — a daily multivitamin. Add creatine later once you are training consistently.'],
      },
      {
        heading: 'Not sure about a flavour?',
        paragraphs: ['Try sachets before committing to a full tub. It is the cheapest way to find a flavour you will actually enjoy drinking every day.'],
      },
    ],
    relatedProductIds: ['raw-whey', 'biozyme-sachets', 'shaker-bottle'],
    motif: 'stack',
  },
  {
    slug: 'veg-diet-big-gains',
    title: 'Veg Diet, Big Gains: Hitting Protein Goals Without Meat',
    topic: 'Veg',
    excerpt: 'Paneer, dal, soya and curd can take you most of the way. Here is how to plan a vegetarian day that adds up.',
    author: 'Sneha Iyer',
    publishedAt: '2025-12-09',
    readMinutes: 6,
    body: [
      {
        paragraphs: ['Plenty of strong athletes are vegetarian. The challenge is not quality but quantity — vegetarian protein sources tend to come with more carbs, so you need to plan.'],
      },
      {
        heading: 'Good vegetarian sources',
        paragraphs: ['Paneer, Greek-style curd, soya chunks, tofu, rajma, chana, moong and milk. Pairing a grain with a pulse (rice and dal, roti and rajma) improves the overall amino acid profile.'],
      },
      {
        heading: 'Where a shake helps',
        paragraphs: ['A scoop of whey — or plant protein if you avoid dairy — adds 20–25 g of protein with very little extra carbohydrate or fat, which is hard to match with whole foods alone.'],
      },
    ],
    relatedProductIds: ['plant-protein', 'biozyme-performance-whey'],
    motif: 'leaf',
  },
  {
    slug: 'how-to-spot-fake-protein-powder',
    title: 'How to Spot a Fake Protein Powder',
    topic: 'Authenticity',
    excerpt: 'Too-good-to-be-true prices, missing seals and odd textures are red flags. Here is a five-step check.',
    author: 'Arjun Mehta',
    publishedAt: '2026-04-14',
    readMinutes: 4,
    body: [
      {
        paragraphs: ['Counterfeit supplements are a real problem in India. They may contain less protein than the label says, or ingredients that should not be there at all.'],
      },
      {
        heading: 'Five checks before you scoop',
        paragraphs: [
          '1. Buy from the brand website or an authorised seller. 2. Check the seal under the lid is intact. 3. Scratch the authenticity label and verify the code. 4. Look up the batch lab report. 5. Be suspicious of prices far below MRP.',
          'If the powder clumps oddly, smells off or does not mix the way it usually does, stop using it and contact support.',
        ],
      },
    ],
    relatedProductIds: ['biozyme-performance-whey'],
    motif: 'scan',
  },
  {
    slug: 'creatine-101',
    title: 'Creatine 101: What It Does and How to Take It',
    topic: 'Supplements',
    excerpt: 'Three grams a day, every day. No loading needed, no cycling needed. The basics of the most researched supplement.',
    author: 'Arjun Mehta',
    publishedAt: '2026-05-20',
    readMinutes: 5,
    body: [
      {
        paragraphs: ['Creatine helps your muscles regenerate energy during short, intense efforts like heavy sets and sprints. Over weeks of training, that can mean a few more reps and better strength gains.'],
      },
      {
        heading: 'How to take it',
        paragraphs: ['Take 3–5 g of creatine monohydrate daily, mixed into water, juice or your protein shake. Timing matters far less than consistency — take it on rest days too.'],
      },
      {
        heading: 'What to expect',
        paragraphs: ['Some people see a small increase in scale weight in the first weeks as muscles store more water. Drink enough fluids through the day.'],
      },
    ],
    relatedProductIds: ['creatine-monohydrate'],
    motif: 'bolt',
  },
  {
    slug: 'post-workout-nutrition',
    title: 'Post-Workout Nutrition: What to Eat and When',
    topic: 'Recovery',
    excerpt: 'Protein plus some carbs within a couple of hours of training. The “anabolic window” is wider than you think.',
    author: 'Ritika Sharma',
    publishedAt: '2026-06-03',
    readMinutes: 4,
    body: [
      {
        paragraphs: ['After training, your body needs protein to repair muscle and carbohydrate to refill energy stores. You do not need to sprint to the shaker — a meal within a couple of hours is fine.'],
      },
      {
        heading: 'Easy post-workout options',
        paragraphs: ['A whey shake with a banana. Curd rice with a side of paneer. Two eggs and toast. Poha with sprouts and a glass of milk. Aim for roughly 20–40 g of protein.'],
      },
    ],
    relatedProductIds: ['biozyme-performance-whey'],
    motif: 'clock',
  },
];

export const getArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug);
