/**
 * PACKAGING ARTWORK — canvas recreations of MuscleBlaze pack designs
 * (reference: Biozyme Performance Whey 2 kg tub, MB FiT High Protein Oats pouch).
 *
 * Wrap labels are drawn so the FRONT panel sits at the canvas centre; the 3D
 * models offset the texture by half a turn so the centre faces the camera.
 * Claims printed on packs are limited to ones in the content document.
 * Replace with the print dielines when the brand team supplies them.
 */
import { labelRows, type LabelRow } from '@/components/product/box/boxPanels';
import { SITE } from '@/data/site';

// MOCK batch/date line for the concept build
const BATCH_LINE = `BATCH B-2611   MFD 09/2026   BEST BEFORE 08/2028   FSSAI LIC. ${SITE.fssaiLicence}`;

const SANS = '"Archivo Variable", Archivo, "Helvetica Neue", Arial, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

export const MB_YELLOW = '#f6b21b';
export const CHARCOAL = '#3a3b3f';

type G = CanvasRenderingContext2D;

/** Canvas drawn in logical units w×h, stored at `scale` resolution. */
export function makeCanvas(w: number, h: number, scale = 1) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * scale);
  c.height = Math.round(h * scale);
  const g = c.getContext('2d')!;
  g.scale(scale, scale);
  g.textBaseline = 'alphabetic';
  return { c, g };
}

function font(g: G, weight: number, px: number, family = SANS, stretch = 100) {
  g.font = `${weight} ${px}px ${family}`;
  // Archivo variable width axis for condensed / expanded display type
  (g as unknown as { fontStretch: string }).fontStretch = stretch < 95 ? 'condensed' : stretch > 105 ? 'expanded' : 'normal';
}

function spaced(g: G, s: string, x: number, y: number, spacing: number, align: 'left' | 'center' | 'right' = 'left') {
  g.letterSpacing = `${spacing}px`;
  g.textAlign = align;
  g.fillText(s, x, y);
  g.letterSpacing = '0px';
  g.textAlign = 'left';
}

function fitText(g: G, s: string, maxW: number, weight: number, start: number, family = SANS) {
  let px = start;
  font(g, weight, px, family);
  while (g.measureText(s).width > maxW && px > 10) {
    px -= 2;
    font(g, weight, px, family);
  }
  return px;
}

function wrapText(g: G, text: string, x: number, y: number, maxW: number, lh: number) {
  let line = '';
  for (const w of text.split(' ')) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > maxW && line) {
      g.fillText(line, x, y);
      y += lh;
      line = w;
    } else line = t;
  }
  if (line) g.fillText(line, x, y);
  return y + lh;
}

/** Printed-material noise so flat fills don't look CG-perfect. */
function grain(g: G, _x: number, _y: number, _w: number, _h: number, amt = 10) {
  // operates on device pixels (getImageData ignores the context transform)
  const img = g.getImageData(0, 0, g.canvas.width, g.canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amt;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
}

/** The MB monogram — white M, B with the yellow right bowl (as on pack). */
export function drawMB(g: G, x: number, y: number, size: number, bAccent = MB_YELLOW, ink = '#ffffff') {
  font(g, 900, size, SANS, 110);
  g.fillStyle = ink;
  g.letterSpacing = `${-size * 0.06}px`;
  g.fillText('M', x, y);
  const mW = g.measureText('M').width;
  const bx = x + mW - size * 0.02;
  g.fillText('B', bx, y);
  const bW = g.measureText('B').width;
  // Yellow bowls: clip the right half of the B
  g.save();
  g.beginPath();
  g.rect(bx + bW * 0.42, y - size * 0.8, bW, size * 0.9);
  g.clip();
  g.fillStyle = bAccent;
  g.fillText('B', bx, y);
  g.restore();
  g.letterSpacing = '0px';
  return mW + bW;
}

export function molecules(g: G, x0: number, y0: number, w: number, h: number, seed = 3) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts = Array.from({ length: 16 }, () => ({ x: x0 + rnd() * w, y: y0 + rnd() * h, r: 14 + rnd() * 30 }));
  g.strokeStyle = 'rgba(150,150,155,.55)';
  g.lineWidth = 6;
  pts.forEach((p, i) => {
    const q = pts[(i * 7 + 3) % pts.length];
    const r = pts[(i + 1) % pts.length];
    g.beginPath();
    g.moveTo(p.x, p.y);
    g.lineTo(q.x, q.y);
    g.moveTo(p.x, p.y);
    g.lineTo(r.x, r.y);
    g.stroke();
  });
  pts.forEach((p) => {
    const grad = g.createRadialGradient(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.1, p.x, p.y, p.r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.55, '#d6d6da');
    grad.addColorStop(1, '#8e8e94');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    g.fill();
  });
}

function laurelBadge(g: G, cx: number, cy: number, r: number, fill: string, title: string, sub: string) {
  // laurel leaves
  g.fillStyle = '#cfc9bc';
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 7; i++) {
      const a = Math.PI / 2 + side * (0.5 + i * 0.32);
      const lx = cx + Math.cos(a) * (r + 16);
      const ly = cy + Math.sin(a) * (r + 16);
      g.save();
      g.translate(lx, ly);
      g.rotate(a + side * 0.6);
      g.beginPath();
      g.ellipse(0, 0, 11, 5, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
  }
  g.fillStyle = fill;
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#fff';
  g.lineWidth = 4;
  g.stroke();
  g.fillStyle = '#fff';
  font(g, 800, r * 0.38, SANS);
  g.textAlign = 'center';
  g.fillText(title, cx, cy + r * 0.14);
  g.fillStyle = '#d9d4ca';
  font(g, 600, 17, SANS);
  const words = sub.split('\n');
  words.forEach((w, i) => g.fillText(w, cx, cy + r + 46 + i * 21));
  g.textAlign = 'left';
}

function vegMark(g: G, x: number, y: number, s = 44) {
  g.fillStyle = '#fff';
  g.fillRect(x, y, s, s);
  g.strokeStyle = '#1a8c3a';
  g.lineWidth = 4;
  g.strokeRect(x + 4, y + 4, s - 8, s - 8);
  g.fillStyle = '#1a8c3a';
  g.beginPath();
  g.arc(x + s / 2, y + s / 2, s * 0.2, 0, Math.PI * 2);
  g.fill();
}

function nutritionPanel(g: G, x: number, y: number, w: number, rows: LabelRow[], servings: number | null) {
  g.fillStyle = '#ffffff';
  const h = 120 + rows.length * 52 + 120;
  g.fillRect(x, y, w, h);
  g.strokeStyle = '#111';
  g.lineWidth = 4;
  g.strokeRect(x, y, w, h);
  const l = x + 22;
  const r = x + w - 22;
  let yy = y + 62;
  g.fillStyle = '#0a0a0b';
  font(g, 900, 52, SANS);
  g.fillText('Nutrition Facts', l, yy);
  yy += 16;
  g.fillRect(l, yy, r - l, 3);
  yy += 38;
  font(g, 500, 24, SANS);
  g.fillText(servings ? `Serving: 1 scoop · Servings: ${servings}` : 'Serving: 1 scoop', l, yy);
  yy += 14;
  g.fillRect(l, yy, r - l, 10);
  rows.forEach((row) => {
    yy += 52;
    const ind = row.level * 26;
    font(g, row.bold ? 800 : 500, row.id === 'energy' ? 32 : 28, SANS);
    g.fillStyle = '#0a0a0b';
    g.fillText(row.label, l + ind, yy - 14);
    g.textAlign = 'right';
    if (row.value == null) {
      g.fillStyle = '#8a5a00';
      font(g, 600, 26, MONO);
      g.fillText('—', r, yy - 14);
    } else {
      font(g, row.bold ? 800 : 600, row.id === 'energy' ? 32 : 28, MONO);
      g.fillText(`${row.value} ${row.unit}`, r, yy - 14);
    }
    g.textAlign = 'left';
    g.fillStyle = '#0a0a0b';
    g.fillRect(l + ind, yy, r - l - ind, row.id === 'energy' ? 6 : 1.5);
  });
  yy += 40;
  g.fillStyle = '#444';
  font(g, 500, 18, SANS);
  wrapText(g, 'Values per serving. Concept build: figures not from the source document are mock values.', l, yy, r - l, 22);
}

export interface WrapLabelSpec {
  /** Big product line, e.g. ["BIOZYME", "PERFORMANCE"] */
  lines: string[];
  /** Hero word under the lines, e.g. "WHEY" */
  hero: string;
  accent: string; // the B / highlight colour
  base: string; // label ground
  flavourName: string;
  flavourColor: string;
  netWeight: string;
  badgeTop?: string;
  badgeBig?: string;
  badgeSub?: string;
  features: string[];
  certified?: boolean;
  nutrition?: { protein: number | null; eaas: number | null; bcaas: number | null; calories: number | null; carbs: number | null } | null;
  servings?: number | null;
  category?: string;
}

/**
 * Tub wrap label (aspect ≈ circumference : label height).
 * Layout: [back-left: directions + authenticity] [FRONT] [back-right: nutrition facts]
 */
export function drawWrapLabel(spec: WrapLabelSpec, scale = 1, W = 4096, H = 1000, withGrain = true) {
  const { c, g } = makeCanvas(W, H, scale);
  // Ground with brushed-metal print feel
  const ground = g.createLinearGradient(0, 0, 0, H);
  ground.addColorStop(0, spec.base);
  ground.addColorStop(1, shade(spec.base, -0.25));
  g.fillStyle = ground;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,0.025)';
  for (let x = -H; x < W; x += 9) {
    g.beginPath();
    g.moveTo(x, H);
    g.lineTo(x + H, 0);
    g.stroke();
  }

  const F0 = W / 2 - 660; // front panel left
  const F1 = W / 2 + 700; // front panel right (cert column starts)
  const stripY = H - 92;

  // Diagonal light panel with molecules (top right of front)
  g.save();
  g.beginPath();
  g.moveTo(W / 2 - 40, 0);
  g.lineTo(F1, 0);
  g.lineTo(F1, stripY);
  g.lineTo(W / 2 + 520, stripY);
  g.closePath();
  const light = g.createLinearGradient(W / 2, 0, F1, H);
  light.addColorStop(0, '#f4f4f5');
  light.addColorStop(1, '#c9c9cd');
  g.fillStyle = light;
  g.fill();
  g.clip();
  molecules(g, W / 2 - 40, 0, F1 - W / 2 + 40, stripY, 7);
  g.restore();
  // Diagonal edge highlight
  g.strokeStyle = 'rgba(255,255,255,.7)';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(W / 2 - 40, 0);
  g.lineTo(W / 2 + 520, stripY);
  g.stroke();

  // Brand + monogram
  const x = F0 + 90;
  g.fillStyle = '#fff';
  font(g, 800, 46, SANS, 110);
  spaced(g, 'MUSCLEBLAZE®', x, 112, 1);
  drawMB(g, x - 6, 330, 235, spec.accent);

  // Product lines
  g.fillStyle = '#fff';
  let ly = 425;
  spec.lines.forEach((ln) => {
    const px = fitText(g, ln, 600, 800, 90);
    g.fillText(ln, x, ly);
    ly += px * 1.0;
  });
  const hpx = fitText(g, spec.hero, 640, 900, spec.lines.length > 1 ? 185 : 210);
  g.fillText(spec.hero, x - 6, ly + hpx * 0.74);

  // Feature lockups
  font(g, 700, 22, SANS);
  spec.features.slice(0, 2).forEach((f, i) => {
    const fx = x + i * 330;
    const fy = stripY - 70;
    g.strokeStyle = 'rgba(255,255,255,.75)';
    g.lineWidth = 2.5;
    g.beginPath();
    g.arc(fx + 24, fy - 6, 22, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#fff';
    font(g, 800, 22, SANS);
    g.fillText(i === 0 ? '✓' : '+', fx + 16, fy + 2);
    font(g, 700, 19, SANS);
    wrapText(g, f.toUpperCase(), fx + 58, fy - 12, 250, 22);
  });

  // Clinically badge
  if (spec.badgeBig) {
    const bx = W / 2 + 330;
    const by = 560;
    const br = 132;
    g.fillStyle = '#3d3e42';
    g.beginPath();
    g.arc(bx, by, br, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#e9e9ec';
    g.lineWidth = 8;
    g.stroke();
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(bx, by - 78, 20, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#3d3e42';
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(bx - 9, by - 78);
    g.lineTo(bx - 2, by - 70);
    g.lineTo(bx + 10, by - 86);
    g.stroke();
    g.fillStyle = '#fff';
    g.textAlign = 'center';
    font(g, 800, 30, SANS);
    g.fillText(spec.badgeTop ?? '', bx, by - 22);
    font(g, 600, 17, SANS);
    (spec.badgeSub ?? '').split('\n').forEach((s, i) => g.fillText(s, bx, by + 12 + i * 21));
    font(g, 900, 62, SANS);
    g.fillText(spec.badgeBig, bx, by + 104);
    g.textAlign = 'left';
  }

  // Certification column
  if (spec.certified) {
    g.fillStyle = '#2e2f33';
    g.fillRect(F1, 0, 230, stripY);
    g.fillStyle = '#d9d4ca';
    font(g, 800, 20, SANS);
    g.textAlign = 'center';
    g.fillText('GLOBALLY TESTED', F1 + 115, 48);
    g.textAlign = 'left';
    laurelBadge(g, F1 + 115, 140, 44, '#1d7a3e', 'IC', 'INFORMED CHOICE\nUK');
    laurelBadge(g, F1 + 115, 340, 44, '#1d6fb3', 'LD', 'LABDOOR\nUSA');
    laurelBadge(g, F1 + 115, 540, 44, '#6a3fa0', 'T', 'TRUSTIFIED');
    laurelBadge(g, F1 + 115, 735, 44, '#b97a12', 'NI', 'NUTRAINGREDIENTS\nAWARDS 2021');
  }

  // Bottom strip: flavour + net weight
  g.fillStyle = '#0d0d0e';
  g.fillRect(F0 - 120, stripY, F1 - F0 + 350, H - stripY);
  g.fillStyle = spec.flavourColor;
  g.fillRect(x, stripY + 24, 54, 42);
  g.fillStyle = 'rgba(255,255,255,.25)';
  g.fillRect(x + 4, stripY + 28, 22, 16);
  g.fillStyle = '#e8e4dc';
  font(g, 700, 26, SANS);
  spaced(g, `${spec.flavourName.toUpperCase()} FLAVOUR`, x + 74, stripY + 56, 1);
  g.fillStyle = '#fff';
  font(g, 800, 34, SANS);
  g.textAlign = 'right';
  g.fillText(`Net Weight:  ${spec.netWeight}`, F1 + 180, stripY + 60);
  g.textAlign = 'left';
  vegMark(g, F1 - 110, stripY - 72);
  g.fillStyle = 'rgba(255,255,255,.75)';
  font(g, 800, 26, SANS);
  g.fillText(spec.category ?? 'NUTRACEUTICAL', x, stripY - 120);

  // ---- Back-right: nutrition facts ----
  const nx = F1 + 300;
  if (spec.nutrition) nutritionPanel(g, nx, 70, 640, labelRows(spec.nutrition), spec.servings ?? null);
  else {
    g.fillStyle = 'rgba(255,255,255,.8)';
    font(g, 800, 40, SANS);
    g.fillText('Nutrition information', nx, 140);
    font(g, 500, 26, SANS);
    g.fillText('Values per serving on the pack.', nx, 190);
  }

  // ---- Back-left: directions + authenticity ----
  const dx = 120;
  g.fillStyle = '#fff';
  font(g, 900, 46, SANS);
  g.fillText('DIRECTIONS FOR USE', dx, 120);
  font(g, 500, 27, SANS);
  let dy = 175;
  ['Add 1 scoop to 180–200 ml cold water or milk.', 'Shake for 20 seconds.', 'Drink within 30 minutes of your workout, or anytime you need a protein boost.'].forEach(
    (s, i) => {
      g.fillStyle = spec.accent;
      font(g, 900, 34, SANS);
      g.fillText(String(i + 1), dx, dy + 6);
      g.fillStyle = '#e8e4dc';
      font(g, 500, 26, SANS);
      dy = wrapText(g, s, dx + 44, dy, 600, 32) + 12;
    },
  );
  // Authenticity scratch sticker
  g.fillStyle = '#efeae0';
  g.fillRect(dx, 480, 560, 170);
  g.fillStyle = '#0a0a0b';
  font(g, 800, 22, MONO);
  g.fillText('AUTHENTICITY CODE · SCRATCH & VERIFY', dx + 22, 520);
  const foil = g.createLinearGradient(dx, 0, dx + 560, 0);
  foil.addColorStop(0, '#9b958a');
  foil.addColorStop(0.5, '#d4cec2');
  foil.addColorStop(1, '#8a8478');
  g.fillStyle = foil;
  g.fillRect(dx + 22, 545, 516, 80);
  // QR
  g.fillStyle = '#fff';
  g.fillRect(dx + 600, 480, 170, 170);
  g.fillStyle = '#000';
  let s = 5;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) if (rnd() > 0.5) g.fillRect(dx + 613 + i * 12, 493 + j * 12, 12, 12);
  g.fillStyle = 'rgba(255,255,255,.7)';
  font(g, 500, 21, SANS);
  wrapText(g, 'These products are not intended to diagnose, treat, cure or prevent any disease. Consult a healthcare professional before use.', dx, 720, 760, 26);
  font(g, 600, 21, MONO);
  g.fillText(BATCH_LINE, dx, 830);

  if (withGrain) grain(g, 0, 0, W, H, 6);
  return c;
}

export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt))));
  const r = f((n >> 16) & 255);
  const gg = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((r << 16) | (gg << 8) | b).toString(16).padStart(6, '0')}`;
}

/* ------------------------------------------------------------------ */
/* Stand-up pouch (reference: MB FiT High Protein Oats)                */
/* ------------------------------------------------------------------ */
export interface PouchSpec {
  brand: 'MB FIT' | 'MB';
  lines: string[];
  accent: string; // diagonal colour (brown on oats)
  flavourName: string;
  netWeight: string;
  stripLeft: string;
  stripRight: string;
  descriptor: string;
  illustration: 'oats' | 'powder' | 'none';
}

export function drawPouchFront(spec: PouchSpec, scale = 1, W = 1400, H = 1900) {
  const { c, g } = makeCanvas(W, H, scale);
  // White ground with fine pinstripes
  g.fillStyle = '#f3f2f0';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(0,0,0,0.045)';
  g.lineWidth = 3;
  for (let x = -H; x < W + H; x += 26) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + H * 0.75, H);
    g.stroke();
  }
  // Diagonal colour field
  g.save();
  g.beginPath();
  g.moveTo(W, 0);
  g.lineTo(W, H);
  g.lineTo(0, H);
  g.lineTo(0, H * 0.78);
  g.lineTo(W * 0.92, 0);
  g.closePath();
  g.fillStyle = spec.accent;
  g.fill();
  g.clip();
  g.strokeStyle = 'rgba(0,0,0,0.08)';
  for (let x = -H; x < W + H; x += 26) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + H * 0.75, H);
    g.stroke();
  }
  g.restore();

  // top seal zone
  g.fillStyle = 'rgba(0,0,0,0.04)';
  g.fillRect(0, 0, W, 90);
  g.fillStyle = spec.accent;
  g.fillRect(90, 150, 40, 220);
  g.save();
  g.translate(118, 330);
  g.rotate(-Math.PI / 2);
  g.fillStyle = '#fff';
  font(g, 600, 20, SANS);
  g.fillText('blife', 0, 0);
  g.restore();
  // tear notch text
  g.fillStyle = 'rgba(255,255,255,.75)';
  font(g, 600, 18, SANS);
  g.textAlign = 'right';
  g.fillText('RIP. POUR. PROTEIN UP ✂ ┄┄┄', W - 40, 150);
  g.textAlign = 'left';

  // Brand lockup
  g.fillStyle = '#121212';
  font(g, 800, 30, SANS);
  g.fillText('MUSCLEBLAZE®', 210, 330);
  drawMB(g, 205, 500, 200, spec.accent, '#161616');
  if (spec.brand === 'MB FIT') {
    g.fillStyle = '#161616';
    font(g, 900, 190, SANS, 110);
    g.fillText('FIT', 205, 680);
  }

  // Illustration
  if (spec.illustration === 'oats') {
    const bx = 470;
    const by = 1000;
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(bx, by, 250, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#e9e5df';
    g.beginPath();
    g.arc(bx, by, 220, 0, Math.PI * 2);
    g.fill();
    const oat = g.createRadialGradient(bx - 40, by - 40, 20, bx, by, 200);
    oat.addColorStop(0, '#8a5a3c');
    oat.addColorStop(1, '#5a3420');
    g.fillStyle = oat;
    g.beginPath();
    g.arc(bx, by, 200, 0, Math.PI * 2);
    g.fill();
    let s = 9;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 260; i++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * 190;
      g.fillStyle = rnd() > 0.5 ? 'rgba(160,110,70,.7)' : 'rgba(60,35,20,.6)';
      g.beginPath();
      g.ellipse(bx + Math.cos(a) * r, by + Math.sin(a) * r, 9, 5, rnd() * 3, 0, Math.PI * 2);
      g.fill();
    }
    // banana slices
    for (let i = 0; i < 5; i++) {
      const sx = bx - 90 + i * 22;
      const sy = by - 30 + i * 34;
      g.fillStyle = '#f6edc8';
      g.beginPath();
      g.ellipse(sx, sy, 48, 40, 0.3, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#e2d39a';
      g.lineWidth = 4;
      g.stroke();
    }
    // choc chips
    for (let i = 0; i < 9; i++) {
      g.fillStyle = '#2a170e';
      g.beginPath();
      g.arc(bx + 40 + (i % 3) * 40, by - 110 + Math.floor(i / 3) * 36, 12, 0, Math.PI * 2);
      g.fill();
    }
    // mint leaf
    g.fillStyle = '#3f8f3a';
    g.beginPath();
    g.ellipse(bx + 70, by - 40, 30, 14, -0.6, 0, Math.PI * 2);
    g.fill();
    // floating choc chips + peanuts
    for (let i = 0; i < 7; i++) {
      g.fillStyle = '#2b1a12';
      g.beginPath();
      g.arc(800 + (i % 4) * 70, 560 + Math.floor(i / 4) * 70, 26, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,.18)';
      g.beginPath();
      g.arc(792 + (i % 4) * 70, 552 + Math.floor(i / 4) * 70, 8, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 14; i++) {
      g.fillStyle = '#e8cf9a';
      g.beginPath();
      g.ellipse(700 + (i % 5) * 44, 780 + Math.floor(i / 5) * 40, 18, 12, i, 0, Math.PI * 2);
      g.fill();
    }
  } else if (spec.illustration === 'powder') {
    const bx = 470;
    const by = 1020;
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(bx, by, 230, 0, Math.PI * 2);
    g.fill();
    const p = g.createRadialGradient(bx - 50, by - 60, 10, bx, by, 200);
    p.addColorStop(0, '#fffdf6');
    p.addColorStop(1, '#e6dcc6');
    g.fillStyle = p;
    g.beginPath();
    g.arc(bx, by, 195, 0, Math.PI * 2);
    g.fill();
  }

  // Hero type, right-aligned on the colour field
  g.fillStyle = '#ffffff';
  g.textAlign = 'right';
  let ty = 960;
  spec.lines.forEach((ln) => {
    const px = fitText(g, ln, 560, 900, 150, SANS);
    g.fillText(ln, W - 110, ty);
    ty += px * 1.0;
  });
  g.textAlign = 'left';

  // Dark claim strip + white flavour strip
  const sy = 1320;
  g.fillStyle = '#3b2216';
  g.fillRect(150, sy, W - 270, 96);
  g.fillStyle = '#fff';
  font(g, 700, 36, SANS);
  g.fillText(spec.stripLeft, 230, sy + 62);
  g.textAlign = 'right';
  g.fillText(spec.stripRight, W - 170, sy + 62);
  g.textAlign = 'left';
  g.fillStyle = 'rgba(255,255,255,.4)';
  g.fillRect(W / 2 + 60, sy + 20, 3, 56);
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.moveTo(150, sy + 110);
  g.lineTo(W - 120, sy + 110);
  g.lineTo(W - 150, sy + 200);
  g.lineTo(150, sy + 200);
  g.fill();
  g.fillStyle = '#3b2216';
  font(g, 800, 48, SANS);
  g.textAlign = 'right';
  g.fillText(spec.flavourName, W - 190, sy + 172);
  g.textAlign = 'left';

  // descriptor + net weight
  g.fillStyle = '#fff';
  font(g, 600, 32, SANS);
  wrapText(g, spec.descriptor, 150, 1660, 520, 40);
  font(g, 800, 52, SANS);
  g.textAlign = 'right';
  g.fillText(spec.netWeight, W - 170, 1700);
  g.textAlign = 'left';
  vegMark(g, W - 300, 560, 56);

  grain(g, 0, 0, W, H, 7);
  return c;
}

/** Pouch back: nutrition facts + directions on the colour ground. */
export function drawPouchBack(spec: PouchSpec, nutrition: WrapLabelSpec['nutrition'], scale = 1, W = 1400, H = 1900) {
  const { c, g } = makeCanvas(W, H, scale);
  g.fillStyle = spec.accent;
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#fff';
  font(g, 900, 64, SANS);
  g.fillText(spec.lines.join(' '), 120, 220);
  if (nutrition) nutritionPanel(g, 120, 300, W - 240, labelRows(nutrition), null);
  else {
    g.fillStyle = '#fff';
    g.fillRect(120, 300, W - 240, 700);
    g.fillStyle = '#0a0a0b';
    font(g, 900, 64, SANS);
    g.fillText('Nutrition Facts', 160, 390);
    font(g, 500, 34, SANS);
    g.fillText('Values per 100 g on the pack.', 160, 460);
  }
  g.fillStyle = 'rgba(255,255,255,.85)';
  font(g, 500, 28, SANS);
  wrapText(g, 'These products are not intended to diagnose, treat, cure or prevent any disease. Consult a healthcare professional before use.', 120, 1500, W - 240, 36);
  font(g, 600, 26, MONO);
  g.fillText(BATCH_LINE.replace(/   /g, '   ·   '), 120, 1700);
  grain(g, 0, 0, W, H, 6);
  return c;
}

/* ------------------------------------------------------------------ */
/* Small wraps: bottle, bar, shaker                                    */
/* ------------------------------------------------------------------ */
export function drawBottleLabel(name: string, sub: string, accent: string, base = CHARCOAL, W = 2048, H = 700) {
  const { c, g } = makeCanvas(W, H);
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);
  g.fillStyle = accent;
  g.fillRect(0, H - 120, W, 120);
  const x = W / 2 - 330;
  g.fillStyle = '#fff';
  font(g, 800, 34, SANS);
  spaced(g, 'MUSCLEBLAZE®', x, 90, 1);
  drawMB(g, x - 4, 260, 150, accent);
  g.fillStyle = '#fff';
  const px = fitText(g, name, 660, 900, 96);
  g.fillText(name, x, 260 + px + 20);
  g.fillStyle = 'rgba(255,255,255,.8)';
  font(g, 700, 34, SANS);
  g.fillText(sub, x, 470);
  g.fillStyle = '#0a0a0b';
  font(g, 800, 38, SANS);
  g.fillText('NUTRACEUTICAL · [count] CAPSULES', x, H - 46);
  grain(g, 0, 0, W, H, 6);
  return c;
}

export function drawBarWrapper(name: string, accent: string, flavourName: string, W = 2048, H = 600) {
  const { c, g } = makeCanvas(W, H);
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, shade(accent, 0.15));
  grad.addColorStop(1, shade(accent, -0.3));
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#f3f2f0';
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(W * 0.38, 0);
  g.lineTo(W * 0.28, H);
  g.lineTo(0, H);
  g.fill();
  g.fillStyle = '#121212';
  font(g, 800, 30, SANS);
  g.fillText('MUSCLEBLAZE®', 120, 150);
  drawMB(g, 115, 330, 170, accent, '#161616');
  g.fillStyle = '#fff';
  g.textAlign = 'right';
  const px = fitText(g, name.toUpperCase(), 1000, 900, 150);
  g.fillText(name.toUpperCase(), W - 140, 290);
  font(g, 700, 52, SANS);
  g.fillText(flavourName.toUpperCase(), W - 140, 290 + px * 0.7);
  g.textAlign = 'left';
  grain(g, 0, 0, W, H, 8);
  return c;
}

export function drawShakerWrap(W = 2048, H = 1024) {
  const { c, g } = makeCanvas(W, H);
  g.fillStyle = '#121214';
  g.fillRect(0, 0, W, H);
  // Vertical lockup, like the reel's shaker
  g.save();
  g.translate(W / 2 + 60, H - 140);
  g.rotate(-Math.PI / 2);
  g.fillStyle = '#e9e7e2';
  drawMB(g, 0, 0, 150, '#e9e7e2', '#e9e7e2');
  font(g, 800, 56, SANS, 110);
  g.fillText('MUSCLEBLAZE', 235, -62);
  font(g, 600, 30, SANS);
  g.fillText('BUILT DIFFERENT. TESTED HARDER.', 237, -12);
  g.restore();
  grain(g, 0, 0, W, H, 5);
  return c;
}
