import { Suspense, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CanvasShell } from '../CanvasShell';
import type { SceneProps } from '../Stage3D';

/**
 * THE SCIENCE — scoop → particles → breakdown → muscle fibre (scroll-driven)
 *
 *  0 Scoop        A clear measuring scoop heaped with whey (photo-textured powder).
 *  1 Particles    The powder lifts out and disperses into a cloud of real granules.
 *  2 Breakdown    Granules dissolve into glossy amino-acid chains (peptides); BCAAs
 *                 are tinted green, as in the legend beside the scene.
 *  3 Muscle fibre A striated, wet-looking muscle fibre bundle draws the amino acids
 *                 in; each absorbed bead glows and sinks into the fibre.
 *
 * `absorb` (0..1) is the share that reaches the fibre, so the "Regular whey vs
 * Biozyme" toggle shows the 50% higher absorption (Biozyme 1.0, regular 1/1.5);
 * the rest drift down and fade. Illustrative, not to scale.
 */
export interface AbsorptionProps {
  progress: React.RefObject<number>;
  absorb: number;
  /** Highlight BCAAs (60% higher BCAA absorption) in green */
  showBcaa?: boolean;
}

const CHAIN = 5; // beads per peptide chain
const FIBRES: [number, number][] = [
  [0, 0],
  [0.47, 0.02],
  [-0.47, -0.02],
  [0.24, 0.41],
  [-0.23, 0.42],
  [0.24, -0.41],
  [-0.24, -0.4],
];
const FIBRE_R = 0.215;
const FIBRE_L = 6.2;
/** Scoop rest height and its powder dome (radius, base height) — shared by <Scoop> and the granule layout */
const SCOOP_Y = -0.4;
const HEAP_R = 0.76;
const HEAP_Y = 0.82;

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function rand(i: number, s: number) {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = x - xi;
  const v = y - yi;
  const a = rand(xi, yi);
  const b = rand(xi + 1, yi);
  const c = rand(xi, yi + 1);
  const d = rand(xi + 1, yi + 1);
  const su = u * u * (3 - 2 * u);
  const sv = v * v * (3 - 2 * v);
  return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
}

/** Rounded, lumpy granule (reads as compacted powder rather than a faceted rock) */
function granuleGeometry() {
  const g = new THREE.IcosahedronGeometry(1, 1); // small on screen: 80 faces is plenty
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    v.multiplyScalar(1 + (vnoise(v.x * 2.3 + 3, v.y * 2.3 + v.z * 1.9) - 0.5) * 0.42);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** Sarcomere banding: dark A-bands, light I-bands, thin Z-lines — repeated along the fibre */
function striationTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 512, 0);
  const stops: [number, string][] = [
    [0, '#b33a3f'],
    [0.08, '#c95055'],
    [0.2, '#8a1f26'],
    [0.42, '#7a1820'],
    [0.5, '#9a2a31'],
    [0.58, '#7a1820'],
    [0.8, '#8a1f26'],
    [0.92, '#c95055'],
    [1, '#b33a3f'],
  ];
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 64);
  g.fillStyle = 'rgba(40,4,8,0.55)'; // Z-line
  g.fillRect(0, 0, 6, 64);
  // fine longitudinal myofilament grain
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,180,180' : '40,0,0'},${0.04 + Math.random() * 0.05})`;
    g.fillRect(Math.random() * 512, Math.random() * 64, 30 + Math.random() * 120, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

function fibreGeometry(seed: number) {
  const g = new THREE.CylinderGeometry(FIBRE_R, FIBRE_R, FIBRE_L, 32, 48, false);
  g.rotateZ(Math.PI / 2); // lie along X
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    // gentle wave along the fibre + slight swelling, so it isn't a perfect tube
    const wave = Math.sin(x * 0.9 + seed * 3) * 0.035;
    const swell = 1 + Math.sin(x * 2.1 + seed * 5) * 0.04;
    p.setY(i, p.getY(i) * swell + wave);
    p.setZ(i, p.getZ(i) * swell + Math.cos(x * 0.7 + seed) * 0.02);
  }
  g.computeVertexNormals();
  return g;
}

interface Layouts {
  n: number;
  p0: Float32Array; // heap in the scoop
  p1: Float32Array; // dispersed cloud
  p2: Float32Array; // peptide chains
  p3: Float32Array; // fibre surface
  waste: Float32Array;
  normal3: Float32Array; // outward normal on the fibre (for sinking in)
  seed: Float32Array;
  bcaa: Uint8Array;
}

function buildLayouts(n: number): Layouts {
  const L: Layouts = {
    n,
    p0: new Float32Array(n * 3),
    p1: new Float32Array(n * 3),
    p2: new Float32Array(n * 3),
    p3: new Float32Array(n * 3),
    waste: new Float32Array(n * 3),
    normal3: new Float32Array(n * 3),
    seed: new Float32Array(n),
    bcaa: new Uint8Array(n),
  };
  const v = new THREE.Vector3();
  const c = new THREE.Vector3();
  const d = new THREE.Vector3();
  const perp = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    // 0 — granules seated on the heaped powder dome in the scoop (same offsets as <Scoop>)
    const r = Math.sqrt(rand(i, 1)) * 0.72;
    const a = rand(i, 2) * Math.PI * 2;
    const dome = HEAP_Y + 0.55 * Math.sqrt(Math.max(0, HEAP_R * HEAP_R - r * r));
    L.p0.set([Math.cos(a) * r, SCOOP_Y + dome - 0.02 * rand(i, 3), Math.sin(a) * r], i * 3);
    // 1 — a loose cloud drifting up and out
    v.set(rand(i, 4) - 0.5, rand(i, 5) - 0.5, rand(i, 6) - 0.5).normalize().multiplyScalar(0.5 + Math.cbrt(rand(i, 7)) * 1.7);
    L.p1.set([v.x * 1.55, v.y * 0.95 + 0.45, v.z * 0.8], i * 3);
    // 2 — peptide chains of CHAIN beads with a slight zigzag
    const ci = Math.floor(i / CHAIN);
    const k = i % CHAIN;
    c.set((rand(ci, 8) - 0.5) * 5.0, (rand(ci, 9) - 0.5) * 2.3 + 0.2, (rand(ci, 10) - 0.5) * 1.6);
    d.set(rand(ci, 11) - 0.5, rand(ci, 12) - 0.5, rand(ci, 13) - 0.5).normalize();
    perp.set(-d.y, d.x, 0.3).normalize();
    const zig = (k % 2 ? 1 : -1) * 0.035;
    L.p2.set([c.x + d.x * k * 0.115 + perp.x * zig, c.y + d.y * k * 0.115 + perp.y * zig, c.z + d.z * k * 0.115 + perp.z * zig], i * 3);
    // 3 — on the fibre surface (front-facing half, so absorption reads)
    const [fy, fz] = FIBRES[i % FIBRES.length];
    const ang = (rand(i, 14) - 0.5) * Math.PI * 1.1 + Math.PI / 2; // around +Z (toward camera)
    const nx = 0;
    const ny = Math.cos(ang);
    const nz = Math.sin(ang);
    const x = (rand(i, 15) - 0.5) * (FIBRE_L - 0.6);
    L.p3.set([x, fy + ny * (FIBRE_R + 0.03), fz + nz * (FIBRE_R + 0.03)], i * 3);
    L.normal3.set([nx, ny, nz], i * 3);
    // waste — passes by and falls away out of focus
    L.waste.set([(rand(i, 16) - 0.5) * 6, -2.4 - rand(i, 17) * 1.4, (rand(i, 18) - 0.2) * 2.2], i * 3);
    L.seed[i] = rand(i, 19);
    L.bcaa[i] = rand(ci, 20) < 0.24 ? 1 : 0; // whole chains flagged as BCAA-rich
  }
  return L;
}

function Scoop({ opacity }: { opacity: React.RefObject<number> }) {
  const [albedo, height] = useTexture(['/assets/powder-albedo.webp', '/assets/powder-height.webp']);
  const tex = useMemo(() => {
    const out = [albedo.clone(), height.clone()];
    out.forEach((t, i) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1.4, 1.4);
      t.colorSpace = i === 0 ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.needsUpdate = true;
    });
    return out;
  }, [albedo, height]);
  const cup = useMemo(() => {
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
    for (let i = 0; i <= 6; i++) {
      const t = (i / 6) * (Math.PI / 2);
      pts.push(new THREE.Vector2(0.62 + Math.sin(t) * 0.1, 0.1 - Math.cos(t) * 0.1));
    }
    pts.push(new THREE.Vector2(0.8, 0.86));
    pts.push(new THREE.Vector2(0.82, 0.88), new THREE.Vector2(0.78, 0.89), new THREE.Vector2(0.76, 0.86));
    pts.push(new THREE.Vector2(0.6, 0.13), new THREE.Vector2(0, 0.05));
    return new THREE.LatheGeometry(pts, 72);
  }, []);
  const heap = useMemo(() => {
    const g = new THREE.CircleGeometry(0.76, 64, 0, Math.PI * 2);
    const sub = new THREE.SphereGeometry(HEAP_R, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const p = sub.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const y = p.getY(i) * 0.55 + (vnoise(x * 7 + 2, z * 7) - 0.5) * 0.06;
      p.setY(i, y);
    }
    sub.computeVertexNormals();
    g.dispose();
    return sub;
  }, []);
  const plastic = useRef<THREE.MeshPhysicalMaterial>(null);
  const handleMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const powder = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    const o = opacity.current ?? 1;
    if (plastic.current) plastic.current.opacity = 0.5 * o;
    if (handleMat.current) handleMat.current.opacity = 0.55 * o;
    if (powder.current) powder.current.opacity = o;
  });
  return (
    <group>
      <mesh geometry={heap} position={[0, HEAP_Y, 0]}>
        <meshStandardMaterial ref={powder} color="#efe3cc" bumpMap={tex[1]} bumpScale={1.6} roughness={1} transparent />
      </mesh>
      <mesh geometry={cup} renderOrder={2}>
        <meshPhysicalMaterial ref={plastic} color="#f4f7f8" roughness={0.15} clearcoat={1} clearcoatRoughness={0.15} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} envMapIntensity={2.2} />
      </mesh>
      <mesh position={[1.25, 0.72, 0]} rotation-z={0.28} renderOrder={2}>
        <boxGeometry args={[1.05, 0.06, 0.2]} />
        <meshPhysicalMaterial ref={handleMat} color="#eef2f4" roughness={0.2} clearcoat={0.8} transparent opacity={0.55} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Story({ progress, absorb, showBcaa = true }: AbsorptionProps) {
  const { size, camera } = useThree();
  const narrow = size.width < 640;
  const n = (narrow ? 70 : 150) * CHAIN;
  const L = useMemo(() => buildLayouts(n), [n]);

  const granuleGeo = useMemo(granuleGeometry, []);
  const beadGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 2), []); // 320 faces, smooth at bead size
  const bondGeo = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 8, 1, true), []);
  const stripes = useMemo(striationTexture, []);
  const fibreGeos = useMemo(() => FIBRES.map((_, i) => fibreGeometry(i)), []);

  const granules = useRef<THREE.InstancedMesh>(null);
  const beads = useRef<THREE.InstancedMesh>(null);
  const bonds = useRef<THREE.InstancedMesh>(null);
  const fibre = useRef<THREE.Group>(null);
  const fibreMats = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const sheath = useRef<THREE.MeshPhysicalMaterial>(null);
  const scoop = useRef<THREE.Group>(null);
  const scoopOpacity = useRef(1);
  const absorbNow = useRef(absorb);

  const t = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      e: new THREE.Euler(),
      s: new THREE.Vector3(),
      p: new THREE.Vector3(),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      col: new THREE.Color(),
      cream: new THREE.Color('#f2e7d3'),
      green: new THREE.Color('#3ddc84'),
      red: new THREE.Color('#ff5a5f'),
      grey: new THREE.Color('#6d6a66'),
      pos: new Float32Array(n * 3),
      look: new THREE.Vector3(0, 0.3, 0),
      camTarget: new THREE.Vector3(),
    }),
    [n],
  );

  useFrame((state, dt) => {
    const p = progress.current ?? 0;
    const time = state.clock.elapsedTime;
    absorbNow.current = THREE.MathUtils.damp(absorbNow.current, absorb, 4, dt);
    const s1 = ss(0.12, 0.34, p);
    const s2 = ss(0.38, 0.6, p);
    const s3 = ss(0.64, 0.9, p);
    const sink = ss(0.88, 1.0, p); // absorbed beads sink into the fibre at the end

    // ---- positions: blend the four layouts, plus a little life
    for (let i = 0; i < n; i++) {
      const o = i * 3;
      const wasted = L.seed[i] > absorbNow.current ? 1 : 0;
      for (let k = 0; k < 3; k++) {
        const t3 = wasted ? L.waste[o + k] : L.p3[o + k] - L.normal3[o + k] * sink * 0.07;
        let v = L.p0[o + k];
        v += (L.p1[o + k] - v) * s1;
        v += (L.p2[o + k] - v) * s2;
        v += (t3 - v) * s3;
        t.pos[o + k] = v;
      }
      const w = time * 0.5 + L.seed[i] * 40;
      const drift = (s1 - s3 * 0.9) * 0.06 + 0.004;
      t.pos[o] += Math.sin(w) * drift;
      t.pos[o + 1] += Math.cos(w * 1.3) * drift;
      t.pos[o + 2] += Math.sin(w * 0.7) * drift;
    }

    // ---- granules (stages 0–1), shrinking away as they dissolve in stage 2
    const gScale = 1 - ss(0.38, 0.52, p);
    const gi = granules.current;
    if (gi) {
      gi.visible = gScale > 0.01;
      for (let i = 0; i < n; i++) {
        const sz = (0.032 + L.seed[i] * 0.03) * gScale * (1 + s1 * 0.2);
        t.e.set(L.seed[i] * 6 + time * 0.3 * s1, L.seed[i] * 9, time * 0.2 * s1);
        t.q.setFromEuler(t.e);
        t.m.compose(t.p.fromArray(t.pos, i * 3), t.q, t.s.set(sz, sz * 0.8, sz));
        gi.setMatrixAt(i, t.m);
      }
      if (!gi.userData.tinted) {
        // natural powder variation, set once
        for (let i = 0; i < n; i++) gi.setColorAt(i, t.col.setRGB(0.9 + L.seed[i] * 0.1, 0.86 + L.seed[i] * 0.1, 0.78 + L.seed[i] * 0.12));
        gi.userData.tinted = true;
        if (gi.instanceColor) gi.instanceColor.needsUpdate = true;
      }
      gi.instanceMatrix.needsUpdate = true;
    }

    // ---- amino-acid beads (stage 2 on): glossy spheres; BCAAs green; absorbed ones glow red
    const bScale = ss(0.42, 0.58, p);
    const bi = beads.current;
    if (bi) {
      bi.visible = bScale > 0.01;
      for (let i = 0; i < n; i++) {
        const wasted = L.seed[i] > absorbNow.current ? 1 : 0;
        const isB = showBcaa && L.bcaa[i] ? 1 : 0;
        const r = (isB ? 0.05 : 0.042) * bScale * (1 - sink * 0.6 * (1 - wasted)) * (1 - wasted * s3 * 0.3);
        t.m.compose(t.p.fromArray(t.pos, i * 3), t.q.identity(), t.s.setScalar(r));
        bi.setMatrixAt(i, t.m);
        t.col.copy(t.cream);
        if (isB) t.col.lerp(t.green, 0.9);
        if (!wasted) t.col.lerp(t.red, s3 * 0.75);
        else t.col.lerp(t.grey, s3 * 0.8);
        bi.setColorAt(i, t.col);
      }
      bi.instanceMatrix.needsUpdate = true;
      if (bi.instanceColor) bi.instanceColor.needsUpdate = true;
    }

    // ---- peptide bonds between neighbouring beads in a chain (stage 2 only)
    const bondVis = ss(0.52, 0.6, p) * (1 - ss(0.66, 0.76, p));
    const bo = bonds.current;
    if (bo) {
      bo.visible = bondVis > 0.01;
      let j = 0;
      for (let i = 0; i < n; i++) {
        if (i % CHAIN === CHAIN - 1) continue;
        t.a.fromArray(t.pos, i * 3);
        t.b.fromArray(t.pos, (i + 1) * 3);
        const len = t.a.distanceTo(t.b);
        t.p.addVectors(t.a, t.b).multiplyScalar(0.5);
        t.q.setFromUnitVectors(t.up, t.b.sub(t.a).normalize());
        // only draw links between beads that are actually neighbours (not mid-flight)
        const rr = len < 0.2 ? 0.012 * bondVis : 0;
        t.m.compose(t.p, t.q, t.s.set(rr, len, rr));
        bo.setMatrixAt(j++, t.m);
      }
      bo.count = j; // one bond per neighbouring pair; unused slots must not draw
      bo.instanceMatrix.needsUpdate = true;
    }

    // ---- scoop fades as the powder lifts out
    scoopOpacity.current = 1 - ss(0.1, 0.3, p);
    if (scoop.current) {
      scoop.current.visible = scoopOpacity.current > 0.01;
      scoop.current.position.y = SCOOP_Y - s1 * 0.6;
      scoop.current.rotation.y = -0.5 + Math.sin(time * 0.3) * 0.15;
    }

    // ---- muscle fibre bundle slides in, then pulses as protein arrives
    const fIn = ss(0.6, 0.86, p);
    if (fibre.current) {
      fibre.current.visible = fIn > 0.01;
      fibre.current.position.x = (1 - fIn) * 2.2;
      fibre.current.rotation.x = 0.12 + Math.sin(time * 0.25) * 0.04;
      const pulse = 0.08 + sink * (0.25 + Math.max(0, Math.sin(time * 2.2)) * 0.15) * absorbNow.current;
      fibreMats.current.forEach((m) => {
        m.opacity = fIn;
        m.transparent = fIn < 0.99;
        m.depthWrite = fIn >= 0.99;
        m.emissiveIntensity = pulse;
        if (m.map) m.map.offset.x = time * 0.004;
      });
      if (sheath.current) sheath.current.opacity = fIn * 0.12;
    }

    // ---- camera: close on the scoop → wide for the cloud → macro on chains → wide fibre
    const camZ = THREE.MathUtils.lerp(THREE.MathUtils.lerp(THREE.MathUtils.lerp(5.4, 7.4, s1), 5.8, s2), 7.0, s3) * (narrow ? 1.35 : 1);
    const camY = THREE.MathUtils.lerp(THREE.MathUtils.lerp(1.45, 0.9, s1), 0.5, s3);
    t.camTarget.set(Math.sin(time * 0.15) * 0.25 + (narrow ? 0 : -0.15), camY, camZ);
    camera.position.lerp(t.camTarget, 1 - Math.exp(-3 * dt));
    t.look.set(0, THREE.MathUtils.lerp(0.32, 0.25, s1), 0);
    camera.lookAt(t.look);
  });

  return (
    <group>
      <group ref={scoop}>
        <Scoop opacity={scoopOpacity} />
      </group>
      <instancedMesh ref={granules} args={[granuleGeo, undefined, n]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.95} color="#efe3cc" />
      </instancedMesh>
      <instancedMesh ref={beads} args={[beadGeo, undefined, n]} frustumCulled={false}>
        <meshPhysicalMaterial roughness={0.18} clearcoat={1} clearcoatRoughness={0.12} metalness={0} envMapIntensity={1.3} />
      </instancedMesh>
      <instancedMesh ref={bonds} args={[bondGeo, undefined, n]} frustumCulled={false}>
        <meshStandardMaterial color="#e9dcc6" roughness={0.4} transparent opacity={0.7} />
      </instancedMesh>
      <group ref={fibre}>
        {fibreGeos.map((g, i) => {
          const map = stripes.clone();
          map.repeat.set(16, 1);
          map.offset.set(rand(i, 3), 0);
          map.needsUpdate = true;
          return (
            <mesh key={i} geometry={g} position={[0, FIBRES[i][0], FIBRES[i][1]]}>
              <meshPhysicalMaterial
                ref={(m) => {
                  if (m) fibreMats.current[i] = m;
                }}
                map={map}
                bumpMap={map}
                bumpScale={2}
                color="#ffffff"
                roughness={0.42}
                clearcoat={0.7}
                clearcoatRoughness={0.28}
                sheen={0.6}
                sheenColor="#ff8080"
                emissive="#d0202a"
                emissiveIntensity={0.08}
                transparent
                opacity={0}
              />
            </mesh>
          );
        })}
        {/* perimysium: thin translucent sheath around the bundle */}
        <mesh rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.78, 0.78, FIBRE_L * 0.98, 64, 1, true]} />
          <meshPhysicalMaterial ref={sheath} color="#ffd6d6" roughness={0.2} clearcoat={1} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

export default function AbsorptionScene({ active, onReady, ...rest }: AbsorptionProps & SceneProps) {
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: [0, 1.9, 5.4], fov: 34 }}>
      <ambientLight intensity={0.15} />
      <directionalLight position={[-3, 5, 4]} intensity={1.8} color="#fff1e0" />
      <directionalLight position={[4, 1, -3]} intensity={1.1} color="#cfe0ff" />
      <pointLight position={[2.5, -1.2, 2.5]} intensity={7} color="#e8202a" distance={9} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#fff1e0" position={[-4, 3, 3]} rotation-y={Math.PI / 3} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#dfe8ff" position={[4, 2, -2]} rotation-y={-Math.PI / 3} scale={[1, 6, 1]} />
        <Lightformer form="rect" intensity={1} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[6, 4, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <Story {...rest} />
      </Suspense>
    </CanvasShell>
  );
}
