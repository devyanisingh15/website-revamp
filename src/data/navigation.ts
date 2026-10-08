import { CATEGORIES } from './categories';
import { GOALS } from './goals';

export const ANNOUNCEMENT = 'Free delivery above ₹999 · Every batch lab-tested · 2-hour delivery in select cities';

export const TAGLINES = {
  primary: 'Proof in Every Scoop.',
  builtDifferent: 'Built Different. Tested Harder.',
  absorb: 'Absorb More. Build More.',
  indianBodies: 'Fuel Made for Indian Bodies.',
};

export interface NavLink {
  label: string;
  to: string;
  description?: string;
}

export const SHOP_LINKS: NavLink[] = CATEGORIES.filter((c) => c.inShopNav).map((c) => ({
  label: c.name,
  to: `/shop/${c.id}`,
  description: c.intro,
}));

export const WHEY_LINKS: NavLink[] = [
  { label: 'Biozyme Performance', to: '/product/biozyme-performance-whey-protein' },
  { label: 'Biozyme Gold', to: '/product/biozyme-gold-100-whey' },
  { label: 'Biozyme Iso Zero', to: '/product/biozyme-iso-zero' },
  { label: 'Raw Whey', to: '/product/raw-whey-protein' },
];

export const GOAL_LINKS: NavLink[] = GOALS.map((g) => ({ label: g.name, to: `/goals/${g.id}`, description: g.headline }));

export const PRIMARY_NAV = [
  { label: 'Shop', to: '/shop', menu: 'shop' as const },
  { label: 'Shop by Goal', to: '/goals', menu: 'goals' as const },
  { label: 'Science', to: '/science' },
  { label: 'Authenticity', to: '/authenticity' },
  { label: 'Fit Hub', to: '/fit-hub' },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  { title: 'Shop', links: SHOP_LINKS.map(({ label, to }) => ({ label, to })) },
  { title: 'Goals', links: GOAL_LINKS.map(({ label, to }) => ({ label, to })) },
  {
    title: 'Science',
    links: [
      { label: 'Science of Biozyme', to: '/science' },
      { label: 'Check Authenticity', to: '/authenticity' },
      { label: 'Lab Reports', to: '/authenticity#lab-report' },
      { label: 'Fit Hub', to: '/fit-hub' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Track Order', to: '/track-order' },
      { label: 'Returns', to: '/policies/returns' },
      { label: 'FAQs', to: '/help' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Press', to: '/press' },
    ],
  },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: 'Privacy Policy', to: '/policies/privacy' },
  { label: 'Terms', to: '/policies/terms' },
  { label: 'Return Policy', to: '/policies/returns' },
];
