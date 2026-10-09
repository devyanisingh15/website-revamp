/**
 * Writes the packaging textures used by the product animation.
 *   npm run dev   (other terminal)  →  npm run label-assets
 * Replace public/assets/product-label.png / cap-label.png / cap-top.png with
 * print-ready artwork whenever it's available (keep the same aspect ratios).
 */
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';

const BASE = process.env.PACKSHOT_BASE ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
await page.goto(`${BASE}/asset-gen.html`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => !!window.__assets, null, { timeout: 60000 });
const assets = await page.evaluate(() => window.__assets);
for (const [name, url] of Object.entries(assets)) {
  writeFileSync(new URL(`../public/assets/${name}`, import.meta.url), Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote public/assets/' + name);
}
await browser.close();
