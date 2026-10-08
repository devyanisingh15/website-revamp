/**
 * Renders photo-real product packshots from the 3D pack models.
 *
 *   1. npm run dev            (in another terminal)
 *   2. npm run packshots      → public/packshots/*.webp + src/data/packshots.json
 *
 * Needs a Chromium build: set CHROMIUM_PATH (defaults to /opt/pw-browsers/chromium).
 * Re-run whenever pack artwork, flavours or models change.
 */
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const BASE = process.env.PACKSHOT_BASE ?? 'http://127.0.0.1:5173';
const OUT = new URL('../public/packshots/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// Product ids + flavour ids, read from the data file to stay dependency-free
const src = readFileSync(new URL('../src/data/products.ts', import.meta.url), 'utf8');
const ids = [...src.matchAll(/^\s{4}id: '([^']+)',\n\s{4}slug:/gm)].map((m) => m[1]);
const BIOZYME_FLAVOURS = ['rich-milk-chocolate', 'chocolate-hazelnut', 'french-vanilla-creme', 'mango', 'kesar-pista-badam'];
const jobs = ids.flatMap((id) =>
  ['biozyme-performance-whey', 'biozyme-sachets'].includes(id) ? BIOZYME_FLAVOURS.map((f) => ({ id, flavour: f })) : [{ id, flavour: null }],
);

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const manifest = {};
const W = 800;
const H = 1040;
let done = 0;
const queue = [...jobs];
await Promise.all(
  Array.from({ length: 3 }, async () => {
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    while (queue.length) {
      const job = queue.shift();
      const q = new URLSearchParams({ product: job.id, angle: '-0.32', floor: 'none' });
      if (job.flavour) q.set('flavour', job.flavour);
      // Software WebGL can be slow on busy machines — retry a job once before failing
      for (let attempt = 1; ; attempt++) {
        try {
          await page.goto(`${BASE}/packshot.html?${q}`, { waitUntil: 'networkidle', timeout: 180000 });
          await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
          break;
        } catch (e) {
          if (attempt >= 2) throw e;
          console.warn(`retrying ${job.id} ${job.flavour ?? ''}`);
        }
      }
      const png = await page.screenshot({ omitBackground: true });
      // Encode WebP in the browser (no native image deps)
      const webp = await page.evaluate(async (b64) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        c.getContext('2d').drawImage(img, 0, 0);
        return c.toDataURL('image/webp', 0.86).split(',')[1];
      }, png.toString('base64'));
      const name = `${job.id}${job.flavour ? `--${job.flavour}` : ''}.webp`;
      writeFileSync(new URL(name, OUT), Buffer.from(webp, 'base64'));
      (manifest[job.id] ??= {})[job.flavour ?? 'default'] = `/packshots/${name}`;
      console.log(`[${++done}/${jobs.length}] ${name}`);
    }
    await page.close();
  }),
);
await browser.close();
writeFileSync(new URL('../src/data/packshots.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n');
console.log('manifest → src/data/packshots.json');
