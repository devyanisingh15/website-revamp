import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CanvasShell } from '../CanvasShell';
import { RealStudio } from '../real/Studio';
import { TubModel } from '../real/models';
import { packSpec } from '../real/spec';
import { getProduct, PRIMARY_PRODUCT_ID } from '@/data/products';
import { BIOZYME_FLAVOURS } from '@/data/flavours';
import { useReducedMotion } from '@/hooks/useMedia';
import manifest from '@/data/flavour-elements.json';
import type { SceneProps } from '../Stage3D';

/**
 * FLAVOUR BURST — "Tastes Like a Reward"
 * The Biozyme tub stands in a splash of the selected flavour while its
 * ingredients (chocolate, hazelnuts, vanilla pods, saffron, mango…) hang in
 * the air around it at different depths.
 *
 * The ingredients are the supplied flavour artworks, split into their separate
 * elements by scripts/split-flavour-elements.py. Each element is a card placed
 * at its own depth and rescaled so that, from the resting camera, the layout
 * matches the original artwork exactly. Moving the camera (pointer + slow drift)
 * then gives true parallax. A per-pixel id map lets a card draw only its own
 * element, so nothing is duplicated when pieces fly.
 *
 * Changing flavour: the old ingredients burst outward and fade, the tub spins
 * once and comes round with the new label, and the new splash erupts from
 * behind it with its pieces flying out to their places.
 */
export interface FlavourBurstProps {
  flavourId: string;
}

type Manifest = Record<string, { width: number; height: number; elements: { x: number; y: number; w: number; h: number; area: number; kind: 'splash' | 'piece'; id: number }[] }>;
const MANIFEST = manifest as Manifest;

const CAM_Z = 6;
const IMG_W = 2.7; // artwork width at the tub's depth (world units) — ~84% of the view, leaving room for parallax and float
const TUB_SCALE = 0.44;
const IN_DUR = 1.25;
const OUT_DUR = 0.65;

const atlasUrl = (id: string) => `/assets/flavours/${id}.webp`;
const idsUrl = (id: string) => `/assets/flavours/${id}-ids.png`;

function hash(n: number, s: number) {
  const x = Math.sin(n * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOutBack = (x: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const frag = /* glsl */ `
  uniform sampler2D map;
  uniform sampler2D idMap;
  uniform float uId;
  uniform float uOpacity;
  uniform vec3 uTint;
  varying vec2 vUv;
  void main() {
    float id = floor(texture2D(idMap, vUv).r * 255.0 + 0.5);
    if (abs(id - uId) > 0.5) discard;
    vec4 c = texture2D(map, vUv);
    c.a *= uOpacity;
    if (c.a < 0.01) discard;
    gl_FragColor = vec4(c.rgb * uTint, c.a);
    #include <colorspace_fragment>
  }
`;

interface Card {
  mesh: THREE.Mesh;
  mat: THREE.ShaderMaterial;
  kind: 'splash' | 'piece';
  target: THREE.Vector3;
  dir: THREE.Vector3;
  delay: number;
  spin: number;
  phase: number;
  depth: number; // -1 (far) … 1 (near)
  base: THREE.Vector2; // resting card size
}

/** One flavour's set of ingredient cards. Plays its own entrance / exit. */
function FlavourLayer({ id, leaving, reduced }: { id: string; leaving: boolean; reduced: boolean }) {
  const [atlas, ids] = useTexture([atlasUrl(id), idsUrl(id)]);
  const born = useRef<number | null>(null);
  const left = useRef<number | null>(null);

  const cards = useMemo<Card[]>(() => {
    atlas.colorSpace = THREE.SRGBColorSpace;
    atlas.anisotropy = 4;
    ids.colorSpace = THREE.NoColorSpace;
    ids.magFilter = ids.minFilter = THREE.NearestFilter;
    ids.generateMipmaps = false;
    ids.needsUpdate = true;
    const m = MANIFEST[id];
    if (!m) return [];
    const k = IMG_W / m.width;
    const imgH = m.height * k;
    return m.elements.map((e, i) => {
      // depth: splashes sit behind the tub; pieces split front / back
      const front = hash(i, 1.3) < 0.58;
      const z = e.kind === 'splash' ? -0.95 - (i % 3) * 0.12 : front ? 0.75 + hash(i, 2.7) * 1.1 : -0.35 - hash(i, 4.1) * 1.3;
      const f = (CAM_Z - z) / CAM_Z; // keeps the resting composition identical to the artwork
      const cx = ((e.x + e.w / 2) / m.width - 0.5) * IMG_W;
      const cy = -((e.y + e.h / 2) / m.height - 0.5) * imgH;
      const geo = new THREE.PlaneGeometry(1, 1);
      const u0 = e.x / m.width;
      const u1 = (e.x + e.w) / m.width;
      const v1 = 1 - e.y / m.height;
      const v0 = 1 - (e.y + e.h) / m.height;
      const uv = geo.attributes.uv as THREE.BufferAttribute;
      for (let j = 0; j < uv.count; j++) uv.setXY(j, u0 + uv.getX(j) * (u1 - u0), v0 + uv.getY(j) * (v1 - v0));
      const mat = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: { map: { value: atlas }, idMap: { value: ids }, uId: { value: e.id }, uOpacity: { value: 0 }, uTint: { value: new THREE.Color(1, 1, 1) } },
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      // distant pieces sit a little deeper in shadow, like the reference set
      const shade = z < 0 ? 0.82 + 0.18 * (1 + z / 2) : 1;
      (mat.uniforms.uTint.value as THREE.Color).setScalar(Math.min(1, shade));
      const target = new THREE.Vector3(cx * f, cy * f, z);
      const dir = new THREE.Vector3(cx, cy, 0).normalize();
      if (!Number.isFinite(dir.x)) dir.set(1, 0, 0);
      return {
        mesh,
        mat,
        kind: e.kind,
        target,
        dir,
        delay: e.kind === 'splash' ? 0.05 : 0.12 + hash(i, 5.5) * 0.3,
        spin: (hash(i, 6.6) - 0.5) * 5,
        phase: hash(i, 7.7) * Math.PI * 2,
        depth: THREE.MathUtils.clamp(z / 1.8, -1, 1),
        base: new THREE.Vector2(e.w * k * f, e.h * k * f),
      };
    });
  }, [atlas, ids, id]);

  useEffect(() => () => cards.forEach((c) => (c.mesh.geometry.dispose(), c.mat.dispose())), [cards]);

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (born.current === null) born.current = now;
    if (leaving && left.current === null) left.current = now;
    const tIn = reduced ? 99 : now - born.current;
    const tOut = left.current === null ? -1 : reduced ? 99 : now - left.current;
    for (const c of cards) {
      const m = c.mesh;
      const idle = reduced ? 0 : 1;
      const bob = Math.sin(now * (0.6 + c.depth * 0.15) + c.phase) * (c.kind === 'splash' ? 0.01 : 0.03 + Math.abs(c.depth) * 0.02) * idle;
      const sway = Math.sin(now * 0.5 + c.phase) * (c.kind === 'splash' ? 0.008 : 0.06) * idle;
      // entrance
      const u = clamp01((tIn - c.delay) / (IN_DUR - c.delay));
      const e = easeOutBack(u);
      let x: number, y: number, z: number, s: number, rot: number, op: number;
      if (c.kind === 'splash') {
        x = c.target.x;
        y = c.target.y + bob;
        z = c.target.z;
        s = 0.35 + 0.65 * e;
        rot = sway;
        op = clamp01(u * 2.5);
      } else {
        // pieces fly out from behind the tub to their places
        x = THREE.MathUtils.lerp(0, c.target.x, e);
        y = THREE.MathUtils.lerp(0.1, c.target.y, e) + bob;
        z = THREE.MathUtils.lerp(-0.6, c.target.z, e);
        s = 0.2 + 0.8 * Math.min(1, e);
        rot = c.spin * (1 - u) * (1 - u) + sway;
        op = clamp01(u * 4);
      }
      // exit: burst outward and fade
      if (tOut >= 0) {
        const o = clamp01(tOut / OUT_DUR);
        const o2 = o * o;
        if (c.kind === 'splash') {
          s *= 1 + o * 0.18;
        } else {
          x += c.dir.x * o2 * 2.4;
          y += c.dir.y * o2 * 2.4;
          z += (c.depth > 0 ? 1.2 : -0.6) * o2;
          rot += c.spin * 0.6 * o;
        }
        op *= 1 - o;
      }
      m.position.set(x, y, z);
      m.rotation.z = rot;
      m.scale.set(c.base.x * s, c.base.y * s, 1);
      c.mat.uniforms.uOpacity.value = op;
      m.visible = op > 0.003;
    }
  });

  return (
    <group>
      {cards.map((c, i) => (
        <primitive key={i} object={c.mesh} />
      ))}
    </group>
  );
}

function Burst({ flavourId }: FlavourBurstProps) {
  const reduced = useReducedMotion();
  const product = getProduct(PRIMARY_PRODUCT_ID)!;
  const { camera, pointer } = useThree();

  // Layers: the current flavour plus any still playing their exit
  const [layers, setLayers] = useState<{ id: string; leaving: boolean; key: number }[]>([{ id: flavourId, leaving: false, key: 0 }]);
  const keyRef = useRef(1);
  useEffect(() => {
    setLayers((ls) => {
      if (ls.some((l) => l.id === flavourId && !l.leaving)) return ls;
      return [...ls.map((l) => ({ ...l, leaving: true })), { id: flavourId, leaving: false, key: keyRef.current++ }];
    });
    const t = setTimeout(() => setLayers((ls) => ls.filter((l) => !l.leaving)), (OUT_DUR + 0.2) * 1000);
    return () => clearTimeout(t);
  }, [flavourId]);

  // The label swaps while the tub's back is turned (half-way through its spin)
  const [labelId, setLabelId] = useState(flavourId);
  const spinStart = useRef<number | null>(null);
  const pendingSpin = useRef(false);
  useEffect(() => {
    if (flavourId === labelId) return;
    if (reduced) {
      setLabelId(flavourId);
      return;
    }
    pendingSpin.current = true;
    const t = setTimeout(() => setLabelId(flavourId), 520);
    return () => clearTimeout(t);
  }, [flavourId]); // eslint-disable-line react-hooks/exhaustive-deps

  const flavour = BIOZYME_FLAVOURS.find((f) => f.id === labelId);
  const spec = useMemo(() => packSpec(product, flavour), [product, flavour]);

  // Warm the other flavours once the first one is up
  useEffect(() => {
    const t = setTimeout(() => BIOZYME_FLAVOURS.forEach((f) => useTexture.preload([atlasUrl(f.id), idsUrl(f.id)])), 1800);
    return () => clearTimeout(t);
  }, []);

  const tub = useRef<THREE.Group>(null);
  const look = useMemo(() => new THREE.Vector3(0, 0.05, 0), []);
  useFrame((state, dt) => {
    const now = state.clock.elapsedTime;
    if (pendingSpin.current) {
      pendingSpin.current = false;
      spinStart.current = now;
    }
    if (tub.current) {
      let spin = 0;
      if (spinStart.current !== null) {
        const u = clamp01((now - spinStart.current) / 1.1);
        spin = easeInOut(u) * Math.PI * 2;
        if (u >= 1) spinStart.current = null;
      }
      const idle = reduced ? 0 : Math.sin(now * 0.45) * 0.28;
      tub.current.rotation.y = idle + spin;
      tub.current.position.y = reduced ? 0 : Math.sin(now * 0.8) * 0.025;
    }
    // Camera: slow drift + pointer parallax (the cards' depths do the rest)
    const k = reduced ? 1 : 1 - Math.exp(-3 * dt);
    const tx = reduced ? 0 : pointer.x * 0.35 + Math.sin(now * 0.23) * 0.12;
    const ty = reduced ? 0.1 : 0.1 + pointer.y * 0.2 + Math.sin(now * 0.31) * 0.05;
    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (ty - camera.position.y) * k;
    camera.position.z = CAM_Z;
    camera.lookAt(look);
  });

  return (
    <>
      <group ref={tub} scale={TUB_SCALE}>
        <TubModel spec={spec} />
      </group>
      {layers.map((l) => (
        <Suspense key={l.key} fallback={null}>
          <FlavourLayer id={l.id} leaving={l.leaving} reduced={reduced} />
        </Suspense>
      ))}
    </>
  );
}

export default function FlavourBurstScene({ active, onReady, ...rest }: FlavourBurstProps & SceneProps) {
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: [0, 0.1, CAM_Z], fov: 30 }}>
      <RealStudio floor="none" warmth={0.8} />
      <Suspense fallback={null}>
        <Burst {...rest} />
      </Suspense>
    </CanvasShell>
  );
}
