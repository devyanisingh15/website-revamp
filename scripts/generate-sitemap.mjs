// Generates public/sitemap.xml from the route data. Run: node scripts/generate-sitemap.mjs
// Kept dependency-free: reads ids/slugs from the TS data files with simple regexes.
import { readFileSync, writeFileSync } from 'node:fs';

const ORIGIN = 'https://www.muscleblaze.com';
const read = (p) => readFileSync(new URL(`../src/data/${p}`, import.meta.url), 'utf8');
const products = [...read('products.ts').matchAll(/slug: '([^']+)'/g)].map((m) => `/product/${m[1]}`);
const categories = [...read('categories.ts').matchAll(/\{\s*id: '([^']+)'[\s\S]*?inShopNav: (true|false)/g)].filter((m) => m[2] === 'true').map((m) => `/shop/${m[1]}`);
const goals = [...read('goals.ts').matchAll(/^\s{4}id: '([^']+)'/gm)].map((m) => `/goals/${m[1]}`);
const articles = [...read('blog.ts').matchAll(/slug: '([^']+)'/g)].map((m) => `/fit-hub/${m[1]}`);
const pages = ['/', '/shop', '/goals', '/science', '/authenticity', '/about', '/fit-hub', '/track-order', '/help', '/contact', '/policies/privacy', '/policies/terms', '/policies/returns', '/careers', '/press'];

const urls = [...pages, ...categories, ...products, ...goals, ...articles];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${ORIGIN}${u}</loc></url>`).join('\n')}
</urlset>
`;
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml: ${urls.length} URLs`);
