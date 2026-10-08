export interface Faq {
  q: string;
  a: string;
  link?: { label: string; to: string };
}

/** Product FAQs — copy verbatim from the content document. */
export const PRODUCT_FAQS: Faq[] = [
  {
    q: 'How do I know my tub is genuine?',
    a: 'Scratch the authenticity label and enter the code on our Verify page.',
    link: { label: 'Verify my tub', to: '/authenticity' },
  },
  {
    q: 'Where can I see the lab report?',
    a: 'Enter your batch number on the Lab Reports page to see its third-party test results.',
    link: { label: 'Find my lab report', to: '/authenticity#lab-report' },
  },
  {
    q: 'Concentrate or isolate, which should I buy?',
    a: 'Concentrate suits most lifters. Choose Iso Zero if you want lower carbs or are lactose-sensitive.',
  },
  {
    q: 'How much protein do I need a day?',
    a: 'Most active adults aim for 1.6–2.2 g per kg of body weight, from food and supplements combined.',
  },
  {
    q: 'Can women take whey?',
    a: 'Yes. Whey is food-grade protein and works the same way for everyone.',
  },
  {
    q: 'Will it cause bloating?',
    a: "Biozyme's formula is designed for easier digestion. Start with half a scoop if you are new to whey.",
  },
];
