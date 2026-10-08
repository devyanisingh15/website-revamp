# MuscleBlaze Redesign — Concept Build

A premium, interactive ecommerce redesign concept for MuscleBlaze built around one idea: **Proof in Every Scoop.**
Content comes from *MuscleBlaze Redesign — Website Content*. Every number, lab or claim on the site is taken from that document. Missing data is shown as a visible placeholder like `[price]`, `[N]` or `[x]`, never guessed.

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
| Lab report | `B-DEMO-01` | Placeholder report |
| Pincode | `999999` | Not serviceable |
| Coupon | `DEMO10` | 10% off |
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
- `labelArt.ts`: canvas recreations of the pack artwork. The Biozyme wrap follows the 2 kg tub (charcoal panel, MB monogram with yellow B, molecule diagonal, clinically-tested badge, certification column, flavour/net-weight strip) with directions, authenticity sticker and a nutrition facts panel on the back. The pouch follows the MB FiT High Protein Oats pack. Only claims from the content document are printed; unknown values print as `[x]`.
- `Studio.tsx`: photographic lighting modelled on the reference reel (warm window softbox, cool rim, bounce), a polished marble counter (dark or light) that fades into the page, and contact shadows. No HDRI download.
- `spec.ts`: maps each catalogue product (+ flavour + size) to a pack type, proportions and artwork.

**Scenes.** Hero (scroll-scrubbed like the reel's opening: 3/4 shot → top-down → cap unscrews → into the powder → heaped scoop rises), PDP viewer (any pack; drag/pinch/zoom; hotspots placed in label-art pixels on the clinical badge, nutrition panel, authenticity code and batch QR), **How to Use ritual** on product pages (the reel's second half: scoop tips powder into the shaker and it swirls in → cap on and shake → tub + shaker hero shot on marble; auto-plays, step list controls it), category ring (realistic packs), absorption story, flavour swirl, goal figure, nutrition scoop, and the **Read the Label box** (drag or panel buttons to turn; snaps to panels; levels and eases in on the Nutrition Facts back; *Zoom to read* pans to the hovered row).

**Packshots.** `npm run packshots` renders every product (and each Biozyme flavour) from these models through the dev-only `packshot.html` page into `public/packshots/*.webp` (~35 KB each) and `src/data/packshots.json`. `ProductArt` uses them everywhere (cards, menus, cart, compare, fallbacks), with vector art only as a last resort. Re-run after changing artwork or models. `TubViewerScene` will load `product.model3d` (Draco GLB at `/draco/`) instead when the 3D team supplies one.

## Mock data and placeholders (all must be replaced)

- **Prices:** `src/mocks/pricing.ts` holds round demo numbers so cart maths works. Every price shows a "Demo price" tag. Set `PRICE_MODE = 'placeholder'` to render `₹[price]` instead.
- **Ratings and reviews:** all `null`, rendered as `★ 4.x · [N] verified reviews`. The 4★ filter is disabled. The reviews list shows the empty state.
- **Testimonials:** three clearly labelled placeholder slots. No reviews have been invented.
- **Product data:** only Biozyme Performance (and its sachets) carry figures from the document (25 g protein, 11.75 g EAAs, 5.51 g BCAAs, ~120 kcal). Other SKUs show `[x]`, and their flavour lists say "Flavours to be confirmed". Pack sizes for non-whey SKUs are TBC. All figures must be checked against the live label.
- **Badges, recommended and bestselling order, stock:** `src/mocks/merchandising.ts`. Only Iso Zero → Low Carb is grounded in the document. Mango is marked sold out to demo that path.
- **Authenticity and lab-report API:** `lib/api/authenticity.ts`. QR scanning isn't implemented.
- **Payments and orders:** `lib/api/orders.ts`. No gateway is connected and no money is taken. Orders live in localStorage.
- **Delivery/pincode:** `lib/api/delivery.ts` returns a date 3 days out.
- **Auth:** the OTP login is a local flag only.
- **Loyalty:** the name `HK Cash` is configurable in `data/site.ts` and flagged "name to confirm". The balance is `[x]`.
- **Missing values:** FSSAI licence no., support email and phone, nutritionist name and credential, timeline years, bundle saving %, article bodies, authors and dates, and policy/careers/press copy.
- **Goal routines:** a draft slot mapping, labelled "pending nutritionist review".

## Assets still required
Print-ready dielines to replace the recreated pack artwork (the 3D labels are close recreations from photos, not the official files). Official logo SVG (the wordmark is a typographic placeholder), product photography, Draco GLB tub models under 2 MB (plus decoder files in `public/draco/`), label images per flavour, consented testimonial photos, Fit Hub imagery and an OG share image.

## Backend integrations still required
Product information and pricing, inventory, reviews, search, authenticity and lab reports, pincode/serviceability, cart/checkout plus payment gateway (UPI, cards, net banking, wallets, COD), orders/logistics tracking, identity/OTP, loyalty, newsletter ESP, support ticketing and CMS (Fit Hub, policies).

## SEO
Per-route title, description, canonical, OG and robots through `useSeo`. Doc-supplied metadata is used verbatim where given (`data/seo.ts`). `public/sitemap.xml` is generated from the data (`npm run sitemap`), and there is a `robots.txt`. Product JSON-LD includes only known facts, with no price or rating. **Note:** this is a client-rendered SPA, so add prerendering or SSR at deploy time for crawlers that don't run JS.

## Assumptions
- Home section order follows the document's seven beats (product → science → proof → range → goal → people → offer), so Authenticity comes right after the Biozyme story.
- Quiz rules use reasons stated in the document. "Vegetarian-friendly" maps to Plant Protein; the nutrition team should confirm this.
- A few structural headings ("Verify Your Tub", "The Road So Far", "What We Stand For", "Your Day", "Keep Reading") and the Wellness/Accessories category intros were written for layout. They make no claims and should be reviewed by the brand team.
- Delivery fee is not specified, so the cart shows "Free" above ₹999 and "Calculated at checkout" below.
