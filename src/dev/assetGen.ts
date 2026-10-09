/**
 * DEV-ONLY: draws the replaceable packaging textures for the product animation.
 * scripts/generate-label-assets.mjs saves them to public/assets/*.png.
 * Swap those PNGs for the brand's print files at any time — the animation
 * only reads the files listed in components/ProductAnimation/config/assets.ts.
 */
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import { drawWrapLabel, drawMB, makeCanvas, MB_YELLOW } from '@/components/3d/real/labelArt';
import { packSpec } from '@/components/3d/real/spec';
import { getProduct } from '@/data/products';
import { LABEL_SLEEVE } from '@/components/ProductAnimation/config/assets';

const SANS = '"Archivo Variable", Archivo, sans-serif';

function productLabel() {
  const p = getProduct('biozyme-performance-whey')!;
  const spec = packSpec(p, p.flavours[0], '1 kg');
  const W = 4096;
  const H = Math.round(W / LABEL_SLEEVE.aspect);
  return drawWrapLabel({ ...spec.wrap!, base: '#2c2d31' }, 1, W, H, false);
}

/** Red foil shrink-wrap around the cap side: repeating MB marks + seal (transparent ground). */
function capSide() {
  const W = 4096;
  const H = 256;
  const { c, g } = makeCanvas(W, H);
  for (let i = 0; i < 18; i++) {
    const x = i * (W / 18) + 40;
    g.save();
    g.translate(x, H * 0.66);
    g.rotate(-0.18);
    g.globalAlpha = 0.9;
    drawMB(g, 0, 0, 120, 'rgba(255,255,255,0.95)', 'rgba(255,255,255,0.95)');
    g.restore();
  }
  // Seal at the front
  const sx = W / 2;
  g.fillStyle = 'rgba(255,255,255,0.92)';
  g.fillRect(sx - 150, 30, 300, 196);
  g.strokeStyle = '#a8101a';
  g.lineWidth = 6;
  g.strokeRect(sx - 140, 40, 280, 176);
  g.fillStyle = '#a8101a';
  g.textAlign = 'center';
  g.font = `900 46px ${SANS}`;
  g.fillText('LAB', sx, 108);
  g.fillText('TESTED', sx, 160);
  g.font = `700 22px ${SANS}`;
  g.fillText('EVERY BATCH', sx, 196);
  return c;
}

/** Cap top: red foil disc with a large MB mark. */
function capTop() {
  const S = 1024;
  const { c, g } = makeCanvas(S, S);
  const grad = g.createRadialGradient(S * 0.38, S * 0.32, 20, S / 2, S / 2, S * 0.72);
  grad.addColorStop(0, '#d8222c');
  grad.addColorStop(1, '#8a0c13');
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  g.strokeStyle = 'rgba(255,255,255,0.35)';
  g.lineWidth = 6;
  g.beginPath();
  g.arc(S / 2, S / 2, S * 0.43, 0, Math.PI * 2);
  g.stroke();
  drawMB(g, S * 0.22, S * 0.62, 330, MB_YELLOW, '#ffffff');
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.font = `800 52px ${SANS}`;
  g.fillText('MUSCLEBLAZE', S / 2, S * 0.78);
  return c;
}

document.fonts.ready.then(() => {
  (window as unknown as { __assets: Record<string, string> }).__assets = {
    'product-label.png': productLabel().toDataURL('image/png'),
    'cap-label.png': capSide().toDataURL('image/png'),
    'cap-top.png': capTop().toDataURL('image/png'),
  };
});
