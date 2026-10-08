import * as THREE from 'three';

/** Canvas textures generated once and cached — zero network, ~tens of ms each. */
const cache = new Map<string, THREE.Texture>();

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number, oct = 5) {
  let v = 0;
  let a = 0.5;
  for (let i = 0; i < oct; i++) {
    v += a * noise(x, y);
    x *= 2.03;
    y *= 2.03;
    a *= 0.5;
  }
  return v;
}

/** Carrara-style marble (light) or Nero-style (dark) for the counter. */
export function marbleTexture(dark = false, size = 512) {
  const key = `marble-${dark}-${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const img = g.createImageData(size, size);
  const d = img.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      const t = fbm(nx * 4, ny * 4, 6);
      const vein = Math.abs(Math.sin((nx * 3 + ny * 1.4 + t * 2.6) * Math.PI));
      const fine = Math.abs(Math.sin((nx * 9 - ny * 5 + fbm(nx * 10, ny * 10, 4) * 4) * Math.PI));
      const v = Math.pow(vein, 0.18) * 0.75 + Math.pow(fine, 0.35) * 0.25;
      const cloud = fbm(nx * 2 + 7, ny * 2 + 3, 4);
      let r: number, gg: number, b: number;
      if (dark) {
        const base = 13 + cloud * 12;
        const veinC = Math.pow(1 - v, 1.6) * 48;
        r = base + veinC;
        gg = base + veinC * 0.98;
        b = base + veinC * 0.95 + 3;
      } else {
        const base = 228 + cloud * 18;
        const veinC = Math.pow(1 - v, 1.4) * 70;
        r = base - veinC;
        gg = base - veinC * 0.98;
        b = base - veinC * 0.93;
      }
      const i = (y * size + x) * 4;
      d[i] = r;
      d[i + 1] = gg;
      d[i + 2] = b;
      d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

/** Bumpy normal-ish height map for powder (used as bumpMap — cheap and convincing). */
export function powderBump(size = 512) {
  const key = `powder-${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const img = g.createImageData(size, size);
  const d = img.data;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const v = fbm(x / 18, y / 18, 4) * 0.6 + hash(x, y) * 0.4;
      const i = (y * size + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = v * 255;
      d[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  cache.set(key, tex);
  return tex;
}

/** Fine plastic grain for roughness variation on the tub body. */
export function plasticRoughness(size = 256) {
  const key = `plastic-${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const img = g.createImageData(size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = 150 + hash(i, i * 0.37) * 60;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  cache.set(key, tex);
  return tex;
}

export function canvasToTexture(c: HTMLCanvasElement, wrap = true, offsetHalf = true) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 12;
  if (wrap) {
    tex.wrapS = THREE.RepeatWrapping;
    if (offsetHalf) tex.offset.x = 0.5;
  }
  return tex;
}

/** Embossed MB monogram for cap tops (used as colour + bump map). */
export function capEmboss(cap: string, size = 512) {
  const key = `cap-${cap}-${size}`;
  if (cache.has(key)) return cache.get(key)!;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size * 0.4, size * 0.35, 10, size / 2, size / 2, size * 0.7);
  grad.addColorStop(0, '#bdbdbd');
  grad.addColorStop(1, '#8e8e8e');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  // concentric moulding rings
  g.strokeStyle = 'rgba(0,0,0,0.12)';
  for (let r = size * 0.44; r > size * 0.4; r -= 4) {
    g.beginPath();
    g.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    g.stroke();
  }
  g.font = `900 ${size * 0.34}px "Archivo Variable", Archivo, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.fillText('MB', size / 2 + 3, size / 2 + 3);
  g.fillStyle = 'rgba(0,0,0,0.28)';
  g.fillText('MB', size / 2, size / 2);
  g.font = `700 ${size * 0.045}px "Archivo Variable", Archivo, sans-serif`;
  g.fillStyle = 'rgba(0,0,0,0.3)';
  g.fillText('MUSCLEBLAZE', size / 2, size * 0.72);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  // Cap disc UVs face away from the label side; turn the art to read upright from the front
  tex.center.set(0.5, 0.5);
  tex.rotation = Math.PI;
  cache.set(key, tex);
  return tex;
}
