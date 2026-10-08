/**
 * PROTEIN BOX — PANEL ARTWORK
 * Each face of the carton is drawn to a 2D canvas. The same canvases are used
 * as 3D textures and as the flat fallback image, so both always match.
 * No three.js import here — this module stays in the light main bundle.
 *
 * Only figures from the content document are printed as values; every other
 * label row renders "[x]" until the live label is supplied.
 */

export type BoxFace = 'front' | 'right' | 'back' | 'left';
export const BOX_FACES: { id: BoxFace; label: string; short: string }[] = [
  { id: 'front', label: 'Front', short: 'Front' },
  { id: 'right', label: 'How to use', short: 'Side' },
  { id: 'back', label: 'Nutrition facts', short: 'Back' },
  { id: 'left', label: 'Authenticity', short: 'Side' },
];

/** Box proportions (width : height : depth) — the canvases match them */
export const BOX = { w: 2, h: 2.8, d: 1.1 };
const PX = 512; // canvas pixels per world unit → crisp at ~2× on retina
export const faceSize = (face: BoxFace) => ({
  w: Math.round((face === 'front' || face === 'back' ? BOX.w : BOX.d) * PX),
  h: Math.round(BOX.h * PX),
});

export type LabelRowId = 'energy' | 'protein' | 'eaas' | 'bcaas' | 'carbs' | 'sugars' | 'fat' | 'sodium';

export interface LabelRow {
  id: LabelRowId;
  label: string;
  value: string | null; // null → "[x]" placeholder
  unit: string;
  level: 0 | 1 | 2; // indentation ("of which")
  bold?: boolean;
}

export interface BoxData {
  label: string;
  sub?: string;
  body: string;
  band: string;
  flavourName: string;
  sizeLabel: string;
  rows: LabelRow[];
  servingSize: string | null;
  servingsPerPack: number | null;
  howTo: string[];
  usageNote: string;
  disclaimer: string;
}

export function labelRows(n: { protein: number | null; eaas: number | null; bcaas: number | null; calories: number | null; carbs: number | null }): LabelRow[] {
  const v = (x: number | null) => (x == null ? null : String(x));
  return [
    { id: 'energy', label: 'Energy', value: n.calories == null ? null : `~${n.calories}`, unit: 'kcal', level: 0, bold: true },
    { id: 'protein', label: 'Protein', value: v(n.protein), unit: 'g', level: 0, bold: true },
    { id: 'eaas', label: 'of which EAAs', value: v(n.eaas), unit: 'g', level: 1 },
    { id: 'bcaas', label: 'of which BCAAs', value: v(n.bcaas), unit: 'g', level: 2 },
    { id: 'carbs', label: 'Carbohydrate', value: v(n.carbs), unit: 'g', level: 0, bold: true },
    { id: 'sugars', label: 'of which Sugars', value: null, unit: 'g', level: 1 },
    { id: 'fat', label: 'Total Fat', value: null, unit: 'g', level: 0, bold: true },
    { id: 'sodium', label: 'Sodium', value: null, unit: 'mg', level: 0, bold: true },
  ];
}

const SANS = '"Archivo Variable", Archivo, system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > maxW && line) {
      g.fillText(line, x, y);
      y += lh;
      line = w;
    } else line = test;
  }
  if (line) g.fillText(line, x, y);
  return y + lh;
}

function brandStrip(g: CanvasRenderingContext2D, W: number, d: BoxData, y: number) {
  g.fillStyle = d.band;
  g.fillRect(0, y, W, 18);
}

function drawFront(g: CanvasRenderingContext2D, W: number, H: number, d: BoxData) {
  const dark = lum(d.body) < 0.5;
  const ink = dark ? '#f2efe9' : '#0a0a0b';
  g.fillStyle = d.body;
  g.fillRect(0, 0, W, H);
  // subtle vertical sheen
  const sheen = g.createLinearGradient(0, 0, W, 0);
  sheen.addColorStop(0, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.35, 'rgba(255,255,255,0.06)');
  sheen.addColorStop(1, 'rgba(0,0,0,0.18)');
  g.fillStyle = sheen;
  g.fillRect(0, 0, W, H);

  g.textAlign = 'center';
  g.fillStyle = dark ? 'rgba(242,239,233,.6)' : 'rgba(10,10,11,.6)';
  g.font = `700 34px ${SANS}`;
  g.letterSpacing = '12px';
  g.fillText('MUSCLEBLAZE', W / 2, 150);

  g.fillStyle = ink;
  g.letterSpacing = '-4px';
  g.font = `900 160px ${SANS}`;
  g.fillText(d.label, W / 2, 360);
  if (d.sub) {
    g.fillStyle = d.band;
    g.letterSpacing = '10px';
    g.font = `600 46px ${MONO}`;
    g.fillText(d.sub, W / 2, 440);
  }

  // Flavour band
  g.fillStyle = d.band;
  g.fillRect(0, 560, W, 420);
  const bandInk = lum(d.band) > 0.55 ? '#0a0a0b' : '#ffffff';
  g.fillStyle = bandInk;
  g.letterSpacing = '6px';
  g.font = `800 78px ${SANS}`;
  g.fillText('WHEY PROTEIN', W / 2, 720);
  g.letterSpacing = '2px';
  g.font = `600 44px ${MONO}`;
  g.fillText(d.flavourName.toUpperCase(), W / 2, 800);
  const protein = d.rows.find((r) => r.id === 'protein')?.value;
  if (protein) {
    g.font = `900 120px ${SANS}`;
    g.letterSpacing = '-2px';
    g.fillText(`${protein}g`, W / 2, 930);
  }

  g.fillStyle = ink;
  g.letterSpacing = '4px';
  g.font = `600 36px ${MONO}`;
  g.fillText(protein ? 'PROTEIN PER SCOOP' : '', W / 2, 1060);
  g.fillStyle = dark ? 'rgba(242,239,233,.55)' : 'rgba(10,10,11,.55)';
  g.font = `600 30px ${MONO}`;
  g.fillText('CLINICALLY TESTED · LAB VERIFIED', W / 2, 1260);
  g.fillText(`NET WT. ${d.sizeLabel.toUpperCase()}`, W / 2, 1320);
  g.textAlign = 'left';
}

// Back-panel layout (canvas px) — shared with the 3D camera so it can pan to a row
const BACK = { px: 64, py: 70, rowsTop: 70 + 110 + 26 + 58 + 52 + 30 + 62 + 22, rowH: 82 };

/** World-space Y (box-local, centre = 0) of a nutrition row on the back panel. */
export function rowWorldY(rowIndex: number) {
  const canvasY = BACK.rowsTop + rowIndex * BACK.rowH + BACK.rowH / 2;
  return BOX.h / 2 - canvasY / PX;
}

function drawBack(g: CanvasRenderingContext2D, W: number, H: number, d: BoxData, highlight: LabelRowId | null) {
  g.fillStyle = d.body;
  g.fillRect(0, 0, W, H);
  brandStrip(g, W, d, 0);

  // White label panel — high contrast for legibility
  const { px, py } = BACK;
  const pw = W - px * 2;
  g.fillStyle = '#ffffff';
  g.fillRect(px, py, pw, H - py - 150);
  g.strokeStyle = '#0a0a0b';
  g.lineWidth = 6;
  g.strokeRect(px, py, pw, H - py - 150);

  const x = px + 36;
  const r = px + pw - 36;
  let y = py + 110;
  g.fillStyle = '#0a0a0b';
  g.letterSpacing = '-2px';
  g.font = `900 92px ${SANS}`;
  g.fillText('Nutrition Facts', x, y);
  y += 26;
  g.fillRect(x, y, r - x, 4);
  y += 58;

  g.letterSpacing = '0px';
  g.font = `500 38px ${SANS}`;
  g.fillText(`Serving size: 1 scoop (${d.servingSize ?? '[x] g'})`, x, y);
  y += 52;
  g.fillText(`Servings per pack: ${d.servingsPerPack ?? '[x]'}`, x, y);
  y += 30;
  g.fillRect(x, y, r - x, 18);
  y += 62;

  g.font = `700 32px ${SANS}`;
  g.fillText('Amount per serving (approx.)', x, y);
  y += 22;
  g.fillRect(x, y, r - x, 3);

  const rowH = BACK.rowH;
  y = BACK.rowsTop;
  d.rows.forEach((row) => {
    const top = y;
    y += rowH;
    if (row.id === highlight) {
      g.fillStyle = 'rgba(232,32,42,0.14)';
      g.fillRect(x - 16, top + 6, r - x + 32, rowH - 6);
      g.fillStyle = '#e8202a';
      g.fillRect(x - 16, top + 6, 8, rowH - 6);
    }
    const indent = row.level * 44;
    g.fillStyle = '#0a0a0b';
    g.textAlign = 'left';
    g.font = `${row.bold ? 800 : 500} ${row.id === 'energy' ? 52 : 44}px ${SANS}`;
    g.fillText(row.label, x + indent, y - 22);
    g.textAlign = 'right';
    if (row.value == null) {
      g.fillStyle = '#9a6a10';
      g.font = `600 40px ${MONO}`;
      g.fillText(`[x] ${row.unit} †`, r, y - 22);
    } else {
      g.font = `${row.bold ? 800 : 600} ${row.id === 'energy' ? 52 : 44}px ${MONO}`;
      g.fillText(`${row.value} ${row.unit}`, r, y - 22);
    }
    g.fillStyle = '#0a0a0b';
    g.fillRect(x + (row.level ? indent : 0), y, r - x - (row.level ? indent : 0), row.id === 'energy' ? 10 : 2);
  });
  g.textAlign = 'left';
  y += 56;
  g.fillStyle = '#3a3a40';
  g.font = `500 28px ${SANS}`;
  y = wrap(g, '† Not yet supplied — to be confirmed against the current label. Other figures from public listings.', x, y, r - x, 38);

  // Below the panel: batch + disclaimer in the carton colour
  const dark = lum(d.body) < 0.5;
  g.fillStyle = dark ? 'rgba(242,239,233,.7)' : 'rgba(10,10,11,.7)';
  g.font = `600 26px ${MONO}`;
  g.fillText('BATCH [B-XXXX]   ·   MFD [date]   ·   BEST BEFORE [date]', px, H - 90);
}

function drawRight(g: CanvasRenderingContext2D, W: number, H: number, d: BoxData) {
  const dark = lum(d.body) < 0.5;
  const ink = dark ? '#f2efe9' : '#0a0a0b';
  g.fillStyle = d.body;
  g.fillRect(0, 0, W, H);
  brandStrip(g, W, d, 0);
  const x = 48;
  const maxW = W - 96;
  let y = 150;
  g.fillStyle = ink;
  g.letterSpacing = '-1px';
  g.font = `900 64px ${SANS}`;
  g.fillText('HOW TO', x, y);
  y += 70;
  g.fillStyle = d.band;
  g.fillText('USE', x, y);
  y += 90;
  g.letterSpacing = '0px';
  d.howTo.forEach((step, i) => {
    g.fillStyle = d.band;
    g.font = `900 84px ${SANS}`;
    g.fillText(String(i + 1), x, y + 40);
    g.fillStyle = ink;
    g.font = `500 34px ${SANS}`;
    y = wrap(g, step, x, y + 100, maxW, 44) + 50;
  });
  g.fillStyle = dark ? 'rgba(242,239,233,.65)' : 'rgba(10,10,11,.65)';
  g.font = `500 25px ${SANS}`;
  wrap(g, d.usageNote, x, Math.max(y + 20, H - 300), maxW, 34);
}

function drawLeft(g: CanvasRenderingContext2D, W: number, H: number, d: BoxData) {
  const dark = lum(d.body) < 0.5;
  const ink = dark ? '#f2efe9' : '#0a0a0b';
  g.fillStyle = d.body;
  g.fillRect(0, 0, W, H);
  brandStrip(g, W, d, 0);
  const x = 48;
  const maxW = W - 96;
  let y = 150;
  g.fillStyle = ink;
  g.font = `900 58px ${SANS}`;
  g.fillText('CHECK US.', x, y);
  y += 60;
  g.fillStyle = 'rgba(128,128,128,.9)';
  g.font = `500 30px ${SANS}`;
  y = wrap(g, 'Scratch, scan, and know it’s genuine.', x, y + 10, maxW, 40) + 30;
  // scratch sticker
  g.fillStyle = '#efeae0';
  g.fillRect(x, y, maxW, 210);
  g.fillStyle = '#0a0a0b';
  g.font = `600 24px ${MONO}`;
  g.fillText('AUTHENTICITY CODE', x + 24, y + 50);
  const foil = g.createLinearGradient(x, 0, x + maxW, 0);
  foil.addColorStop(0, '#9b958a');
  foil.addColorStop(0.5, '#cfc9bd');
  foil.addColorStop(1, '#8a8478');
  g.fillStyle = foil;
  g.fillRect(x + 24, y + 80, maxW - 48, 90);
  y += 270;
  // QR-ish block
  const q = Math.min(maxW, 300);
  g.fillStyle = '#f2efe9';
  g.fillRect(x, y, q, q);
  g.fillStyle = '#0a0a0b';
  let s = 11;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const cell = (q - 40) / 13;
  for (let i = 0; i < 13; i++) for (let j = 0; j < 13; j++) if (rnd() > 0.5) g.fillRect(x + 20 + i * cell, y + 20 + j * cell, cell, cell);
  y += q + 60;
  g.fillStyle = ink;
  g.font = `800 34px ${SANS}`;
  y = wrap(g, 'Lab report for every batch', x, y, maxW, 44);
  g.fillStyle = 'rgba(128,128,128,.95)';
  g.font = `500 26px ${SANS}`;
  y = wrap(g, 'Enter your batch number at muscleblaze.com/authenticity', x, y + 4, maxW, 36);
  g.font = `500 22px ${SANS}`;
  wrap(g, d.disclaimer, x, Math.max(y + 30, H - 230), maxW, 30);
  g.fillText('FSSAI Lic. No. [x]', x, H - 50);
}

/** Draws one face into `canvas` (created if omitted) and returns it. */
export function drawBoxFace(face: BoxFace, d: BoxData, highlight: LabelRowId | null = null, canvas?: HTMLCanvasElement) {
  const { w, h } = faceSize(face);
  const c = canvas ?? document.createElement('canvas');
  if (c.width !== w) c.width = w;
  if (c.height !== h) c.height = h;
  const g = c.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.letterSpacing = '0px';
  g.textBaseline = 'alphabetic';
  if (face === 'front') drawFront(g, w, h, d);
  else if (face === 'back') drawBack(g, w, h, d, highlight);
  else if (face === 'right') drawRight(g, w, h, d);
  else drawLeft(g, w, h, d);
  return c;
}
