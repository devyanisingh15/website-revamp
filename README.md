# MuscleBlaze Redesign — Concept Build

A premium, interactive ecommerce redesign concept for MuscleBlaze built around one idea: **Proof in Every Scoop.**
Content comes from *MuscleBlaze Redesign — Website Content*. Where the document has no data, the site is filled with **plausible mock values** (prices, ratings, reviews, nutrition for most SKUs, contact details, article copy and so on) so the concept looks complete. Every mock value is marked `MOCK` in the source and listed below so it can be swapped for real data.

> **This is not production-ready.** Pricing, reviews, authenticity, delivery, payments, orders, auth and loyalty are all mocked (see below).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # sitemap + typecheck + production build → dist/
npm run preview    # serve dist/
npm run packshots  # with `npm run dev` running: re-render product images from the 3D models
```

QA switches:
- `?no3d`: forces every static fallback, as if WebGL were unavailable.
- Turn on the OS "reduce motion" setting to remove scroll-scrubbed scenes and autoplay.

Demo inputs:

| Flow | Input | Result |
|---|---|---|
| Authenticity | `MB-DEMO-0001` / `MB-DEMO-USED` / anything else | Genuine / already verified 3× / not found |
| Lab report | `B-DEMO-01` | Sample (mock) lab report |
| Pincode | `999999` | Not serviceable |
| Coupon | `DEMO10` | 10% off |
| Track order | `MBDEMO123` | Sample order, shipped |
| Checkout UPI | `fail@upi` | Payment failed state |
| Track order | `MBDEMO123` or any order placed in this browser | Timeline |

## Stack

React 19, TypeScript, Vite 6, Tailwind CSS v4, Three.js, React Three Fiber and drei, GSAP ScrollTrigger (loaded on demand), Lucide icons, React Router 7. Framer Motion was left out because CSS and GSAP cover every animation.

## Architecture

```
src/
  data/          content + catalogue (products, categories, goals, faqs, blog, navigation, seo, site)
  mocks/         DEMO-only data: pricing.ts, merchandising.ts (badges, ranks, stock)
  lib/           cart / compare / toast stores, catalogue filtering, quiz rules, a11y + webgl utils
  lib/api/       mock services: authenticity, delivery, orders/payment, coupons, newsletter
  components/
    3d/          Stage3D (fallback → lazy 3D wrapper), CanvasShell, models/, scenes/, loaders.ts
    navigation/  header, mega menus, mobile menu, search, footer
    product/     ProductArt (vector packshots), cards, selectors, shaker, reviews
    ecommerce/   compare tray + table, quantity, pincode, order summary, order timeline
    sections/    homepage sections, authenticity checker, fallbacks
    ui/ forms/ blog/
  pages/         one file per route
  layouts/       site layout + distraction-free checkout layout
```

### 3D system (`components/3d/Stage3D.tsx`)
1. A static render (`ProductArt` SVG or a diagram) paints first, so 3D never blocks LCP.
2. After first paint, the scene module and the `three` chunk load through `import()`, but only if the stage is near the viewport, WebGL exists, motion isn't reduced, and on mobile only when the stage allows it.
3. A canvas pauses (`frameloop="never"`) when off-screen. On mobile a canvas budget lets only the most visible stage render.
4. Any scene error falls back to the static render. Every stage has a text alternative, and the same information is always in the DOM.

**Realistic packaging (`components/3d/real/`).** Every pack is modelled from the reference photos rather than primitives:
- `models.tsx`: lathe-turned tub/jar with rounded shoulders, threaded neck, knurled screw cap with an embossed MB top, shrink-sleeve wrap label; stand-up pouch (pillowed panels, gusset); sachet; supplement bottle; flow-wrapped bar; matte shaker with flip cap; flat-bottomed scoop with a heaped powder mound; powder surface.
- `labelArt.ts`: canvas recreations of the pack artwork. The Biozyme wrap follows the 2 kg tub (charcoal panel, MB monogram with yellow B, molecule diagonal, clinically-tested badge, certification column, flavour/net-weight strip) with directions, authenticity sticker and a nutrition facts panel on the back. The pouch follows the MB FiT High Protein Oats pack. Only claims from the content document are printed; values the 3D code cannot get from the data still print as `[x]` (see Mock data below).
- `Studio.tsx`: photographic lighting modelled on the reference reel (warm window softbox, cool rim, bounce), a polished marble counter (dark or light) that fades into the page, and contact shadows. No HDRI download.
- `spec.ts`: maps each catalogue product (+ flavour + size) to a pack type, proportions and artwork.

**Scenes.** Hero (scroll-scrubbed like the reel's opening: 3/4 shot → top-down → cap unscrews → into the powder → heaped scoop rises), PDP viewer (any pack; drag/pinch/zoom; hotspots placed in label-art pixels on the clinical badge, nutrition panel, authenticity code and batch QR), **How to Use ritual** on product pages (the reel's second half: scoop tips powder into the shaker and it swirls in → cap on and shake → tub + shaker hero shot on marble; auto-plays, step list controls it), category ring (realistic packs), absorption story, flavour swirl, goal figure, nutrition scoop, and the **Read the Label box** (drag or panel buttons to turn; snaps to panels; levels and eases in on the Nutrition Facts back; *Zoom to read* pans to the hovered row).

**Packshots.** `npm run packshots` renders every product (and each Biozyme flavour) from these models through the dev-only `packshot.html` page into `public/packshots/*.webp` (~35 KB each) and `src/data/packshots.json`. `ProductArt` uses them everywhere (cards, menus, cart, compare, fallbacks), with vector art only as a last resort. Re-run after changing artwork or models. `TubViewerScene` will load `product.model3d` (Draco GLB at `/draco/`) instead when the 3D team supplies one.

## Product animation (home hero)

A scroll-driven 3D commercial in `src/components/ProductAnimation/`. Scroll is the playhead: 900vh of scroll (700vh on mobile) is pinned to one sticky stage.

| Progress | Beat |
|---|---|
| 0–10% | Brand intro: logo in the dark |
| 10–25% | Product reveal: dolly in on the jar, label turns to camera |
| 25–40% | Interaction: one hand steadies the jar, the other twists the cap off in three re-grips and sets it on the counter |
| 40–55% | Macro powder: top-down macro, shallow depth of field, scoop digs in |
| 55–70% | Scoop and pour: scoop lifts, tilts, granules fall into the shaker |
| 70–82% | Shaker: water fills, cap screws on, shake, powder dissolves |
| 82–95% | Hero: orbit, light sweep, macro push-in on the label |
| 95–100% | Brand outro |

```
ProductAnimation/
  ProductAnimation.tsx          section, scroll smoothing, captions, chapter rail, poster/static fallbacks
  ProductAnimationCanvas.tsx    lazy chunk: Canvas, adaptive quality, all scenes
  config/assets.ts              every file path + measured model dimensions (single place to swap assets)
  config/timeline.ts            beat ranges and easing helpers
  scenes/                       one file per beat (DOM overlays are three-free so they stay in the main bundle)
  components/                   ProductModel, ShakerModel, PowderBed, Scoop, PowderParticles, CinematicCamera, ProductLighting, Effects
  styles/product-animation.css
```

**Asset findings (from inspecting the supplied GLBs):**
- `protein_supplement_jar.glb`: separate body and cap meshes with usable UVs. The label is a fitted cylindrical sleeve sized from the measured body radius (`LABEL_SLEEVE`), so the artwork never stretches.
- `shaker_bottle.glb`: separate `cup` / `cap` / `lid` nodes with 4K PBR textures. These are resized to 1024 (desktop) and 512 (mobile) WebP. The green cap is recoloured to brand black.
- `protein_powder.glb`: no usable powder surface (its upper meshes are thread rings). The powder is a displaced bed and a deterministic ballistic particle stream that scrubs both ways with scroll.

**Reference photos and video** (`assets-src/reference/`, processed by `npm run reference-assets`, then `npm run assets`):
- **Hands** (`hands-opening-tub.jpg`): the two hands are keyed off the black ground and green-screen spill, the cream jar and lid are cut away, and the cut edges fade into shadow. They are composited as camera-facing cards registered to the photo (`HAND_PHOTO`): the fingertips and thumb sit on the 3D cap's rims and the lower hand wraps the jar. This holds up because the camera stays near the photo's angle during that beat. It is a 2.5D composite, not a rigged 3D hand, so it would break under large camera orbits.
- **Powder** (`powder-scoop.jpg`): a tileable albedo plus height map cut from the photo is used on the powder bed, the soft rounded clumps and the heaped scoop. The powder colour is sampled from it. The scoop is now clear plastic like the photo.
- **Lighting** (studio video): a black-walled room with a warm square LED panel, cool slanted overhead tubes and a polished concrete floor. It is rebuilt with Lightformers, matching direct lights (warm key, cool top, warm and cool rims) and defocused practicals behind the set that catch a little bloom. Soft grounding shadows follow the jar, the shaker and the resting cap.

**Pipeline:**
- Put the source GLBs in `assets-src/` as `protein-container.source.glb` and `shaker-bottle.source.glb`. These are gitignored.
- `npm run assets` writes Draco-compressed desktop and mobile GLBs to `public/assets/` (about 120/70 KB and 320/130 KB) and the WebP label encodes.
- `npm run label-assets` (with `npm run dev` running) redraws `product-label.png`, `cap-label.png` and `cap-top.png`.
- To use official artwork, replace those PNGs with files of the same aspect ratio and run `npm run assets`.
- The Draco decoder is self-hosted in `public/draco/`.

**Swappable slots** (`config/assets.ts`):
- `environment`: `null` (the Lightformer room). Set it to `/assets/environment.hdr` (CC0 *studio_small_03*) for a brighter photographic studio.
- `logo`: placeholder wordmark.
- `poster`: rendered from the hero frame. It is shown while the 3D loads and used for reduced motion and no-WebGL.
- `fallbackVideo`: `null`. If set, it replaces the poster on low-end devices.
- `hands`: photo cut-outs (above). `handFootage`: `null`. Transparent WebM/HEVC footage set here scrubs in sync with the cap motion and can replace the cards for full finger motion.

**Quality tiers:**
- Desktop: ambient occlusion (N8AO), depth of field, bloom, film grain, transmissive scoop, 1400 granules and 70 clumps.
- Mobile / low-memory: simplified GLBs, half-resolution depth of field, no AO, bloom or grain, see-through (non-transmissive) scoop, about 20–30% of the particles, calmer camera. Portrait screens re-centre every shot on the product.
- `PerformanceMonitor` steps down DPR, then effects, then falls back to the poster after sustained low fps. `?pa-nofallback` disables that final step for QA.
- `prefers-reduced-motion` and no-WebGL get the static poster hero.

## Flavour scene ("Tastes Like a Reward")

`src/components/3d/scenes/FlavourBurstScene.tsx` puts the Biozyme tub in a splash of the selected flavour, with that flavour's ingredients in the air around it.
- **Source artwork:** one transparent artwork per flavour in `assets-src/reference/flavours/<flavour-id>.webp`.
- **Splitting:** `npm run flavour-assets` separates each artwork into its elements (splashes, nuts, chunks, leaves, drops). It writes a texture atlas plus a per-pixel element-id map to `public/assets/flavours/`, and a manifest to `src/data/flavour-elements.json`.
- **Depth:** each element becomes a card at its own depth, scaled so the resting view matches the artwork exactly. Pointer movement and a slow camera drift give real parallax.
- **No duplicates:** the id map ensures each card draws only its own element.
- **Changing flavour:** the old ingredients burst outward, the tub spins once and comes round with the new flavour's label, and the new splash erupts from behind it.
- **Fallbacks:** reduced motion and no-WebGL show the flavour artwork behind the pack image.
- **Mobile layout:** the stage sits between the heading and the flavour list, so a tap visibly changes the scene.
- **New or changed flavour:** add `<flavour-id>.webp` (transparent background, about 1536×1024) to `assets-src/reference/flavours/`, using an id from `src/data/flavours.ts`, then run `npm run flavour-assets`.

## Mock data (all must be replaced)

Everything below is **mock data** chosen to be plausible for an Indian sports-nutrition brand. It is not real and must be replaced before launch. Search the code for `MOCK` to find each block.

**Sourced from the content document — do not change without a new source:** product names and categories; Biozyme Performance (and its sachets) at 25 g protein, 11.75 g EAAs, 5.51 g BCAAs and ~120 kcal per scoop; "50% higher protein absorption"; the five Biozyme flavour names; High Protein Oats at 22 g protein per 100 g; the 2021 NutraIngredients award; the ₹999 free-delivery threshold.

| What | Where | Notes |
|---|---|---|
| Prices and MRPs | `src/mocks/pricing.ts` | Realistic INR selling price + MRP per pack size. `PRICE_MODE = 'demo'` shows them (each tagged "Demo price"); `'placeholder'` renders `₹[price]` tokens instead. |
| Nutrition for other SKUs, plus carbs/sugars/fat/sodium/serving size for Biozyme | `src/data/products.ts` (`nutrition`, `keySpecs`) | `nutrition.sourced` is `true` only for the Biozyme figures above. Non-protein products (creatine, pre-workout, capsules) show `keySpecs` chips instead. |
| Flavour ranges for non-Biozyme SKUs | `src/data/flavours.ts` (`MOCK_FLAVOURS`) | |
| Pack sizes and servings per pack | `src/data/products.ts` (`sizes`) | |
| One-liners / "Who it's for" not in the document | `src/data/products.ts` | Marked `// MOCK` inline. |
| Ratings and review counts | `src/data/products.ts` (`rating`, `reviewCount`) | 4.2–4.5 with hundreds to thousands of reviews. The 4★ shop filter now works. |
| Reviews and the star breakdown | `src/mocks/reviews.ts` | 3–6 sample reviews per main product, generic ones for the rest. The flavour, tag and photo filters work on these. Tagged "Sample reviews". |
| Testimonials | `src/data/testimonials.ts` | Three sample customers, tagged "Sample". Replace with real, consented reviews. |
| Badges, recommended/bestselling order, stock | `src/mocks/merchandising.ts` | Only Iso Zero → Low Carb is grounded in the document. Mango is marked sold out to demo that path. |
| FSSAI licence no., support email/phone/hours, loyalty balance | `src/data/site.ts` | The FSSAI number is invented. Loyalty name `HK Cash` is treated as confirmed. |
| Nutritionist name and credential, bundle saving %, goal routines | `src/data/goals.ts` | Routine is tagged "Sample routine". It needs nutritionist review. |
| About timeline years (other than 2021) | `src/pages/AboutPage.tsx` | |
| Fit Hub excerpts, authors, dates, read times and article bodies | `src/data/blog.ts` | Needs editorial and nutritionist review. |
| Privacy, terms, returns, careers and press copy | `src/data/pages.ts` | Sample copy, **not legal text**. Tagged "Sample copy". |
| Lab report values for `B-DEMO` batches | `src/lib/api/authenticity.ts` | Tagged "Sample report". |
| Demo tracking order `MBDEMO123` | `src/lib/api/orders.ts` | |
| Carton batch/MFD/best-before line | `src/components/product/box/boxPanels.ts` (`MOCK_BATCH`) | |

**Mocked services:** authenticity/lab report (`lib/api/authenticity.ts`, no QR scanning), payments and orders (`lib/api/orders.ts`, no gateway, orders in localStorage), delivery/pincode (`lib/api/delivery.ts`, always 3 days out), coupons, newsletter, and OTP login (a local flag only).

**Still showing placeholders:** the 3D pack labels (`src/components/3d/real/`) were left alone in this pass. They still print nutrition only for sourced SKUs, `Servings: [x]`, and "Flavour TBC" on the protein bar wrapper.

The `Ph` placeholder component and `PRICE_MODE = 'placeholder'` are still available if you need to switch back to visible tokens.

## Assets still required
Print-ready dielines to replace the recreated pack artwork (the 3D labels are close recreations from photos, not the official files). Official logo SVG (the wordmark is a typographic placeholder), product photography, label images per flavour, transparent hand footage for the animation's opening beat, consented testimonial photos, Fit Hub imagery and an OG share image.

## Backend integrations still required
Product information and pricing, inventory, reviews, search, authenticity and lab reports, pincode/serviceability, cart/checkout plus payment gateway (UPI, cards, net banking, wallets, COD), orders/logistics tracking, identity/OTP, loyalty, newsletter ESP, support ticketing and CMS (Fit Hub, policies).

## SEO
Per-route title, description, canonical, OG and robots through `useSeo`. Doc-supplied metadata is used verbatim where given (`data/seo.ts`). `public/sitemap.xml` is generated from the data (`npm run sitemap`), and there is a `robots.txt`. Product JSON-LD includes only known facts. Mock prices and ratings are deliberately left out so fake data is not published to search engines. **Note:** this is a client-rendered SPA, so add prerendering or SSR at deploy time for crawlers that don't run JS.

## Assumptions
- Home section order follows the document's seven beats (product → science → proof → range → goal → people → offer), so Authenticity comes right after the Biozyme story.
- Quiz rules use reasons stated in the document. "Vegetarian-friendly" maps to Plant Protein; the nutrition team should confirm this.
- A few structural headings ("Verify Your Tub", "The Road So Far", "What We Stand For", "Your Day", "Keep Reading") and the Wellness/Accessories category intros were written for layout. They make no claims and should be reviewed by the brand team.
- Mock values (see above) are plausible for MuscleBlaze in India: whey at roughly ₹1,800–3,300 per kg, 33–36 g scoops with 24–27 g protein, 3 g creatine per serve, ratings of 4.2–4.5, and dates in 2025–2026. Claims stay modest, with no medical or clinical claims beyond the document.
- Delivery fee is not specified, so the cart shows "Free" above ₹999 and "Calculated at checkout" below.
