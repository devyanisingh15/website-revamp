/**
 * Site-wide configuration. Values marked MOCK are plausible stand-ins that
 * must be replaced by the brand, legal or loyalty teams before launch.
 */
export const SITE = {
  name: 'MuscleBlaze',
  origin: 'https://www.muscleblaze.com',
  strapline: 'Clinically tested. Lab verified. Made for India.',
  disclaimer:
    'These products are not intended to diagnose, treat, cure or prevent any disease. Consult a healthcare professional before use.',
  usageNote:
    'Note: Do not exceed the recommended serving. Consult a doctor or nutritionist if you are pregnant, nursing or managing a medical condition.',
  fakeProductWarning: 'Buy only from muscleblaze.com, HealthKart and authorised sellers.',
  /** MOCK — replace with the real FSSAI licence number from the legal team */
  fssaiLicence: '10019064001287',
  /** MOCK — the document says "confirm current loyalty programme name" */
  loyaltyProgrammeName: 'HK Cash',
  loyaltyNameConfirmed: true,
  /** MOCK — balance shown on the account page until the loyalty API is connected */
  loyaltyBalance: 340,
  /** MOCK — replace with real support contact details */
  supportEmail: 'care@muscleblaze.com',
  supportPhone: '+91 124 461 6444',
  supportHours: 'Mon–Sat, 9:30 am – 7 pm IST',
  trustLine: 'Secure payment · 100% genuine products · Easy returns',
};

export const CERTIFIERS = ['Labdoor USA', 'Informed Choice UK', 'Trustified'];

export const AWARD = {
  title: 'Product of the Year in Sports Nutrition',
  event: 'NutraIngredients Awards 2021, Singapore',
};
