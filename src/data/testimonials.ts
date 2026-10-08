/**
 * TESTIMONIALS — PLACEHOLDER SLOTS ONLY
 * The document requires "only real, consented reviews". None were supplied,
 * so these records are empty slots that render as clearly-labelled
 * placeholders. Replace with records from the reviews/consent system.
 */
export interface Testimonial {
  id: string;
  name: string | null;
  city: string | null;
  goal: string | null;
  quote: string | null;
  photo: string | null;
  verifiedBuyer: boolean;
  placeholder: true;
}

export const TESTIMONIALS: Testimonial[] = [1, 2, 3].map((n) => ({
  id: `slot-${n}`,
  name: null,
  city: null,
  goal: null,
  quote: null,
  photo: null,
  verifiedBuyer: false,
  placeholder: true,
}));
