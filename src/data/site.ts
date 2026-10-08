/**
 * Site-wide configuration. Values marked TBC must be supplied by the brand,
 * legal or loyalty teams before launch.
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
  /** TBC — legal team */
  fssaiLicence: null as string | null,
  /** TBC — the document says "confirm current loyalty programme name" */
  loyaltyProgrammeName: 'HK Cash',
  loyaltyNameConfirmed: false,
  /** TBC — support contact details */
  supportEmail: null as string | null,
  supportPhone: null as string | null,
  trustLine: 'Secure payment · 100% genuine products · Easy returns',
};

export const CERTIFIERS = ['Labdoor USA', 'Informed Choice UK', 'Trustified'];

export const AWARD = {
  title: 'Product of the Year in Sports Nutrition',
  event: 'NutraIngredients Awards 2021, Singapore',
};
