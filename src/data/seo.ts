/**
 * SEO metadata. Entries marked `doc` are verbatim from the content document;
 * the rest are plain descriptive titles written to the same limits
 * (title < 60 chars, description < 155 chars) and make no new claims.
 */
export interface SeoEntry {
  title: string;
  description: string;
  doc?: boolean;
}

export const SEO: Record<string, SeoEntry> = {
  home: {
    title: 'MuscleBlaze: Clinically Tested Whey Protein in India',
    description: "Shop India's first clinically tested whey. Lab-verified protein, authenticity codes on every tub and fast delivery.",
    doc: true,
  },
  biozymePerformance: {
    title: 'Biozyme Performance Whey, 25 g Protein, MuscleBlaze',
    description: 'Clinically tested for 50% higher protein absorption. 25 g protein per scoop. Check lab reports online.',
    doc: true,
  },
  science: {
    title: 'Biozyme Science: Enhanced Absorption, MuscleBlaze',
    description: "How Biozyme's Enhanced Absorption Formula helps your body take in more protein, backed by clinical testing.",
    doc: true,
  },
  authenticity: {
    title: 'Check MuscleBlaze Product Authenticity & Lab Report',
    description: 'Verify your tub with its authenticity code and read the third-party lab report for your batch.',
    doc: true,
  },
  about: {
    title: "About MuscleBlaze, India's Sports Nutrition Brand",
    description: 'Our story, mission and the science behind clean, transparent nutrition built for Indian bodies.',
    doc: true,
  },
  shop: { title: 'Shop All Supplements, MuscleBlaze', description: 'Whey, gainers, plant protein, pre-workout, creatine and more. Filter by goal and compare up to 3 side by side.' },
  goals: { title: 'Shop by Goal, MuscleBlaze', description: 'Muscle gain, fat loss, weight gain, beginners or plant-powered: pick your goal and get a 3-product stack.' },
  fitHub: { title: 'Fit Hub: Train Smarter, MuscleBlaze', description: 'Protein basics, myths and training nutrition, written for Indian lifters.' },
  cart: { title: 'Your Cart, MuscleBlaze', description: 'Review your MuscleBlaze cart.' },
  checkout: { title: 'Checkout, MuscleBlaze', description: 'Secure checkout.' },
  account: { title: 'Your Account, MuscleBlaze', description: 'Orders, rewards and saved details.' },
  track: { title: 'Track Your Order, MuscleBlaze', description: 'Track your MuscleBlaze order from packed to delivered.' },
  help: { title: 'Help Centre, MuscleBlaze', description: 'Answers on authenticity, lab reports, orders and returns.' },
  contact: { title: 'Contact Us, MuscleBlaze', description: 'Get in touch with the MuscleBlaze support team.' },
  notFound: { title: 'Page Not Found, MuscleBlaze', description: "This page doesn't exist, but your gains still do." },
};
