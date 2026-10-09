/**
 * TESTIMONIALS — MOCK
 * The document requires "only real, consented reviews". These are sample
 * records so the section looks complete in the concept build; they are not
 * real customers. Replace with records from the reviews/consent system
 * before launch.
 */
export interface Testimonial {
  id: string;
  name: string;
  city: string;
  goal: string;
  quote: string;
  /** Photo URL once consented photography is supplied; initials avatar until then */
  photo: string | null;
  verifiedBuyer: boolean;
  mock: true;
}

// MOCK — replace with real data
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'mock-1',
    name: 'Rohan Verma',
    city: 'Pune',
    goal: 'Muscle gain',
    quote: 'Finally a whey that sits easy on my stomach. Six months in and my bench is up 15 kg.',
    photo: null,
    verifiedBuyer: true,
    mock: true,
  },
  {
    id: 'mock-2',
    name: 'Ananya Krishnan',
    city: 'Bengaluru',
    goal: 'Lean & fat loss',
    quote: 'Iso Zero keeps me full through a cut, and I love that I can check the lab report for my batch.',
    photo: null,
    verifiedBuyer: true,
    mock: true,
  },
  {
    id: 'mock-3',
    name: 'Harpreet Singh',
    city: 'Ludhiana',
    goal: 'Weight gain',
    quote: 'Went from skipping meals to adding 6 kg in a few months. Kesar Pista Badam tastes like home.',
    photo: null,
    verifiedBuyer: true,
    mock: true,
  },
];
