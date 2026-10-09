/**
 * PRODUCT ANIMATION — ASSET CONFIGURATION
 * ------------------------------------------------------------------
 * Every file the animation loads is listed here. Replace a file in
 * /public/assets with the same name (or point these paths elsewhere) and the
 * animation picks it up — no scene code changes needed.
 *
 * Source models were inspected before building (see README → Product animation):
 *  - protein-container: Sketchfab jar, Y-up after export, 0.84 m tall incl. cap,
 *    body + SEPARATE cap mesh, UVs present, no textures (label is a fitted sleeve).
 *  - shaker-bottle: cup / cap / lid as separate nodes, PBR textures (resized
 *    from 4096² to 1024² WebP; 512² on mobile).
 * Run `npm run assets` to re-optimise from assets-src/*.source.glb.
 */
export const productAssets = {
  container: '/assets/protein-container.glb',
  containerMobile: '/assets/protein-container-mobile.glb',
  shaker: '/assets/shaker-bottle.glb',
  shakerMobile: '/assets/shaker-bottle-mobile.glb',
  /** Loaded at runtime (encoded from product-label.png by `npm run assets`) */
  label: '/assets/product-label.webp',
  labelMobile: '/assets/product-label-mobile.webp',
  capLabel: '/assets/cap-label.webp',
  capTop: '/assets/cap-top.webp',
  /** Replaceable print sources — drop in new PNGs with the same names, then run `npm run assets` */
  labelSource: '/assets/product-label.png',
  capLabelSource: '/assets/cap-label.png',
  capTopSource: '/assets/cap-top.png',
  logo: '/assets/logo.svg',
  environment: '/assets/environment.hdr',
  /** Draco decoder (self-hosted) */
  draco: '/draco/',
  /** Static composition shown before 3D loads, for reduced motion, and as the low-performance fallback */
  poster: '/assets/product-animation-poster.webp',
  /**
   * OPTIONAL pre-rendered fallback video (e.g. 1080p H.264 of the full sequence).
   * When set, it replaces the poster on devices where WebGL performs poorly and is
   * scrubbed by scroll. null = use the poster image.
   */
  fallbackVideo: null as string | null,
  /**
   * OPTIONAL hand footage for the interaction beat (transparent video).
   * Provide both for cross-browser alpha: WebM (VP9 alpha) and HEVC-with-alpha .mov (Safari).
   * The layer is scrubbed by scroll across the interaction window. null = no hand layer.
   */
  handFootage: { webm: null as string | null, mov: null as string | null },
};

/**
 * Geometry facts measured from protein-container.glb (metres, model space,
 * after centring). Used to fit the label sleeve, cap wrap and powder bed.
 */
export const CONTAINER = {
  /** Model is offset ~2 cm from the origin in the source file — we re-centre it */
  centre: { x: 0.0198, z: -0.0031 },
  height: 0.7791,
  bodyRadius: 0.2522,
  /** Straight wall where the label sleeve sits */
  wallBottom: 0.12,
  wallTop: 0.57,
  neckRadius: 0.19,
  cap: { radius: 0.2008, bottom: 0.7623, top: 0.8378 },
  /** Powder surface height inside the jar (just below the neck) */
  powderY: 0.68,
};

export const LABEL_SLEEVE = {
  radius: CONTAINER.bodyRadius + 0.0016,
  bottom: CONTAINER.wallBottom,
  top: CONTAINER.wallTop,
  /** circumference : height — the label PNG must keep this aspect (≈3.54 : 1) */
  get aspect() {
    return (2 * Math.PI * this.radius) / (this.top - this.bottom);
  },
};

/** Shaker model is in centimetres-ish; scale it to sit beside the jar like the reel's hero shot */
export const SHAKER = {
  scale: 0.00172,
  /** Inner cup radius at bottom/top and usable height, after scaling (metres) */
  innerBottom: 0.125,
  innerTop: 0.152,
  cupHeight: 333.7 * 0.00172,
  position: [0.62, 0, 0.08] as [number, number, number],
};
