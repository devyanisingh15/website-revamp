/**
 * Optimises the supplied source models for the web.
 *
 *   assets-src/*.source.glb  →  public/assets/*.glb (+ *-mobile.glb)
 *   npm run assets
 *
 * - Keeps cap / lid / cup as separate nodes so they can be animated.
 * - Resizes the shaker's 4096² PNGs to 1024 (desktop) / 512 (mobile) WebP.
 * - The supplied powder model has no usable powder geometry (its top meshes are
 *   thread rings), so powder is procedural — see components/ProductAnimation/components/PowderBed.tsx.
 * - Encodes the packaging PNGs to WebP (4096 desktop / 2048 mobile).
 * - Draco-compresses all geometry (decoder self-hosted in /draco/).
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, draco, prune, simplify, textureCompress, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = new URL('../assets-src/', import.meta.url);
const OUT = new URL('../public/assets/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.encoder': await draco3d.createEncoderModule(), 'draco3d.decoder': await draco3d.createDecoderModule() });
await MeshoptSimplifier.ready;

const kb = (u) => `${Math.round(statSync(u).size / 1024)} KB`;

async function build(srcName, outName, steps) {
  const doc = await io.read(fileURLToPath(new URL(srcName, SRC)));
  await doc.transform(...steps);
  const out = new URL(outName, OUT);
  await io.write(fileURLToPath(out), doc);
  console.log(`${outName.padEnd(34)} ${kb(out)}`);
}

const compressGeo = () => draco({ method: 'edgebreaker', quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 });

/** Drop camera / light helper nodes exported from the DCC tool. */
function dropHelpers() {
  return (doc) => {
    for (const node of doc.getRoot().listNodes()) {
      if (node.getCamera() || /^(Camera|Area|Object_1[4-7])$/.test(node.getName())) node.dispose();
    }
  };
}

/** Keep only meshes whose node name matches `keep` (used to extract powder surfaces). */
function keepMeshes(keep) {
  return (doc) => {
    for (const node of doc.getRoot().listNodes()) {
      const mesh = node.getMesh();
      if (mesh && !keep(node, mesh)) node.setMesh(null);
    }
  };
}

// --- Protein container (jar body + separate cap) ---------------------------
await build('protein-container.source.glb', 'protein-container.glb', [dedup(), weld(), prune({ keepAttributes: true }), compressGeo()]);
await build('protein-container.source.glb', 'protein-container-mobile.glb', [
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.35, error: 0.0008 }),
  prune({ keepAttributes: true }),
  compressGeo(),
]);

// --- Shaker bottle (cup / cap / lid) ----------------------------------------
await build('shaker-bottle.source.glb', 'shaker-bottle.glb', [
  dedup(),
  weld(),
  prune({ keepAttributes: true }),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 88 }),
  compressGeo(),
]);
await build('shaker-bottle.source.glb', 'shaker-bottle-mobile.glb', [
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.5, error: 0.001 }),
  prune({ keepAttributes: true }),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512], quality: 82 }),
  compressGeo(),
]);

// --- Packaging textures -------------------------------------------------------
// The PNGs in public/assets are the replaceable sources; the animation loads these WebP encodes.
const IMG = (n) => fileURLToPath(new URL(n, OUT));
for (const [src, out, width, quality] of [
  ['product-label.png', 'product-label.webp', 4096, 90],
  ['product-label.png', 'product-label-mobile.webp', 2048, 86],
  ['cap-label.png', 'cap-label.webp', 2048, 90],
  ['cap-top.png', 'cap-top.webp', 1024, 88],
  ['powder-albedo.png', 'powder-albedo.webp', 512, 86],
  ['powder-height.png', 'powder-height.webp', 512, 90],
  ['hand-top.png', 'hand-top.webp', 716, 88],
  ['hand-bottom.png', 'hand-bottom.webp', 1457, 88],
]) {
  await sharp(IMG(src)).resize({ width }).webp({ quality, alphaQuality: 90 }).toFile(IMG(out));
  console.log(`${out.padEnd(34)} ${kb(new URL(out, OUT))}`);
}
