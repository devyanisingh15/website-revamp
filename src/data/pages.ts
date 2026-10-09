/**
 * POLICY, CAREERS AND PRESS COPY — MOCK
 * Sample copy so these templates look complete in the concept build. It is
 * NOT legal text: the MuscleBlaze legal team must supply the real privacy
 * policy, terms and return policy, and the brand team the careers and press
 * content, before launch.
 */
import { SITE } from './site';

export interface CopySection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export interface CopyPage {
  title: string;
  intro: string;
  updated?: string;
  sections: CopySection[];
}

// MOCK — replace with real data
export const POLICY_PAGES: Record<string, CopyPage> = {
  privacy: {
    title: 'Privacy Policy',
    updated: '2026-07-01',
    intro: 'This policy explains what personal data we collect when you shop with us, why we collect it and the choices you have.',
    sections: [
      {
        heading: 'What we collect',
        list: ['Contact details: name, mobile number, email and delivery address', 'Order history and payment status (we never store full card numbers)', 'Authenticity codes and batch numbers you verify', 'Device and usage data to keep the site secure and fast'],
      },
      {
        heading: 'How we use it',
        paragraphs: ['To process and deliver orders, provide customer support, run the loyalty programme, prevent fraud and — only if you opt in — send offers and Fit Hub updates.'],
      },
      {
        heading: 'Sharing',
        paragraphs: ['We share data only with service providers who help us run the store (payments, logistics, messaging), and where required by law. We do not sell your personal data.'],
      },
      {
        heading: 'Your choices',
        paragraphs: [`You can update your details from your account, unsubscribe from marketing at any time, or ask us to delete your data by writing to ${SITE.supportEmail}.`],
      },
    ],
  },
  terms: {
    title: 'Terms',
    updated: '2026-07-01',
    intro: 'By using this website and placing an order you agree to these terms.',
    sections: [
      {
        heading: 'Orders and pricing',
        paragraphs: ['All prices are in Indian rupees and inclusive of taxes. We may cancel an order if a product is unavailable or a price was displayed in error; any amount paid will be refunded in full.'],
      },
      {
        heading: 'Product use',
        paragraphs: [`Our products are food supplements and are not intended to diagnose, treat, cure or prevent any disease. Follow the serving instructions on the label. ${SITE.usageNote.replace(/^Note: /, '')}`],
      },
      {
        heading: 'Genuine products',
        paragraphs: [`${SITE.fakeProductWarning} We cannot guarantee products bought from unauthorised sellers.`],
      },
      {
        heading: 'Governing law',
        paragraphs: ['These terms are governed by the laws of India, and disputes are subject to the courts of Gurugram, Haryana.'],
      },
    ],
  },
  returns: {
    title: 'Return Policy',
    updated: '2026-07-01',
    intro: 'Something not right with your order? Most issues can be sorted within a few days.',
    sections: [
      {
        heading: 'What you can return',
        list: ['Damaged, leaking or tampered packs — report within 48 hours of delivery with photos', 'Wrong product, flavour or size delivered', 'Products that fail authenticity verification'],
      },
      {
        heading: 'What we cannot accept',
        list: ['Opened packs with a broken inner seal, unless the product is faulty', 'Items returned more than 7 days after delivery', 'Products bought from unauthorised sellers'],
      },
      {
        heading: 'Refunds',
        paragraphs: ['Once the return is approved, refunds go back to the original payment method within 5–7 working days. Cash-on-delivery orders are refunded to your bank account or as store credit.'],
      },
      {
        heading: 'How to start a return',
        paragraphs: [`Email ${SITE.supportEmail} or call ${SITE.supportPhone} (${SITE.supportHours}) with your order number.`],
      },
    ],
  },
};

// MOCK — replace with real data
export const INFO_PAGES: Record<string, CopyPage> = {
  careers: {
    title: 'Careers',
    intro: 'We are a team of lifters, scientists, designers and engineers building India’s most trusted sports nutrition brand.',
    sections: [
      {
        heading: 'Open roles',
        list: ['Product Manager, Ecommerce — Gurugram', 'Senior Food Technologist, R&D — Gurugram', 'Performance Marketing Lead — Gurugram / Remote', 'Frontend Engineer (React) — Bengaluru / Remote', 'Quality Assurance Executive — Manufacturing'],
      },
      {
        heading: 'How to apply',
        paragraphs: ['Send your CV and a short note about why you want to join to careers@muscleblaze.com, with the role title in the subject line.'],
      },
    ],
  },
  press: {
    title: 'Press',
    intro: 'News, awards and media resources from MuscleBlaze.',
    sections: [
      {
        heading: 'Recent news',
        list: ['Aug 2026 — MuscleBlaze opens a new R&D lab for sports nutrition in Gurugram', 'Mar 2026 — Biozyme range expands with new Indian-classic flavours', 'Nov 2025 — MuscleBlaze publishes batch lab reports for every whey batch'],
      },
      {
        heading: 'Awards',
        paragraphs: ['Product of the Year in Sports Nutrition, NutraIngredients Awards 2021, Singapore.'],
      },
      {
        heading: 'Media enquiries',
        paragraphs: ['For interviews, product samples and brand assets, write to press@muscleblaze.com.'],
      },
    ],
  },
};
