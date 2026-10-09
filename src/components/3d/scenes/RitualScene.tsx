import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasShell } from '../CanvasShell';
import { RealStudio } from '../real/Studio';
import { ScoopModel, ShakerModel, SHAKER, TubModel, tubMetrics } from '../real/models';
import { packSpec } from '../real/spec';
import { getProduct } from '@/data/products';
import type { SceneProps } from '../Stage3D';

/**
 * HOW TO USE — the second half of the reference reel, in three beats:
 *  0 · Add 1 scoop: top-down over the open shaker, scoop tips, powder streams
 *      in and swirls into the liquid.
 *  1 · Shake 20 s: cap drops on, shaker lifts and shakes.
 *  2 · Drink: hero shot of tub + shaker on the counter.
 * `step` is driven by the DOM step list; each beat plays from its start.
 */
export interface RitualProps {
  productId: string;
  flavourId: string | null;
  powder: string;
  step: number;
  reduced: boolean;
}

const k = (a: number, b: number, t: number) => {
  const x = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

const SHAKER_X = 0.75;
const FLOOR = -(SHAKER.h + SHAKER.capH) / 2;
const MOUTH_Y = FLOOR + SHAKER.h;

// Camera per beat [position, target]
const SHOTS: [[number, number, number], [number, number, number]][] = [
  [[SHAKER_X + 0.35, MOUTH_Y + 4.6, 2.1], [SHAKER_X, MOUTH_Y - 0.4, 0]],
  [[SHAKER_X + 0.4, 0.9, 7.2], [SHAKER_X, 0.2, 0]],
  [[-0.3, 0.9, 9.6], [-0.35, 0.05, 0]],
];

const STREAM = 420;
const SWIRL = 700;

function Ritual({ productId, flavourId, powder, step, reduced }: RitualProps) {
  const product = getProduct(productId)!;
  const flavour = product.flavours.find((f) => f.id === flavourId);
  const spec = useMemo(() => packSpec(product, flavour), [product, flavour]);
  const tm = tubMetrics(spec.dims!);

  const t0 = useRef(0);
  const lastStep = useRef(-1);
  const scoop = useRef<THREE.Group>(null);
  const mound = useRef<THREE.Mesh>(null);
  const shaker = useRef<THREE.Group>(null);
  const cap = useRef<THREE.Group>(null);
  const liquid = useRef<THREE.Mesh>(null);
  const liquidMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const stream = useRef<THREE.Points>(null);
  const swirl = useRef<THREE.Points>(null);
  const look = useMemo(() => new THREE.Vector3(...SHOTS[0][1]), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const water = useMemo(() => new THREE.Color('#c9d3d6'), []);
  const powderC = useMemo(() => new THREE.Color(powder), [powder]);
  const mix = useMemo(() => new THREE.Color(), []);

  const streamGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(STREAM * 3), 3));
    return g;
  }, []);
  const streamSeed = useMemo(() => Array.from({ length: STREAM }, () => [Math.random(), Math.random(), Math.random()]), []);
  const swirlGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SWIRL * 3), 3));
    return g;
  }, []);
  const swirlSeed = useMemo(() => Array.from({ length: SWIRL }, () => [Math.random(), Math.random()]), []);

  useFrame((state, dt) => {
    const now = state.clock.elapsedTime;
    if (step !== lastStep.current) {
      lastStep.current = step;
      t0.current = now;
    }
    const t = reduced ? 10 : now - t0.current; // reduced motion → jump to each beat's end state

    // ---------- Beat 0: scoop + pour + swirl ----------
    const approach = step === 0 ? k(0.1, 1.0, t) : 1;
    const tip = step === 0 ? k(1.0, 1.8, t) : 1;
    const pour = step === 0 ? k(1.2, 2.6, t) : 1;
    if (scoop.current) {
      scoop.current.visible = step === 0;
      scoop.current.position.set(SHAKER_X + 1.9 - approach * 1.35, MOUTH_Y + 0.9 - approach * 0.2, 0.15);
      scoop.current.rotation.set(0, 0, tip * 2.0);
    }
    // mound empties as it pours
    if (mound.current) mound.current.scale.y = Math.max(0.02, 1 - pour);
    // Powder stream
    const sp = streamGeo.attributes.position as THREE.BufferAttribute;
    const lipX = SHAKER_X + 0.38;
    const lipY = MOUTH_Y + 0.82;
    const streaming = step === 0 && t > 1.25 && t < 2.9;
    for (let i = 0; i < STREAM; i++) {
      const [a, b, c] = streamSeed[i];
      const life = ((t * 1.6 + a) % 1) * (streaming ? 1 : 0);
      const fall = life * life;
      sp.setXYZ(i, lipX - life * 0.32 + (b - 0.5) * 0.12, lipY - fall * 1.1, (c - 0.5) * 0.14);
      if (!streaming) sp.setXYZ(i, 0, -50, 0);
    }
    sp.needsUpdate = true;
    // Liquid tint + swirl on the surface (top-down shot)
    const tint = step === 0 ? k(1.6, 3.4, t) : 1;
    mix.copy(water).lerp(powderC, tint * 0.95);
    liquidMat.current?.color.copy(mix);
    if (liquid.current) liquid.current.visible = step === 0;
    const sw = swirlGeo.attributes.position as THREE.BufferAttribute;
    const surfY = FLOOR + 0.06 + SHAKER.h * 0.62;
    const swirlOn = step === 0 ? k(1.4, 2.2, t) * (1 - k(3.6, 4.4, t)) : 0;
    for (let i = 0; i < SWIRL; i++) {
      const [a, b] = swirlSeed[i];
      const r = Math.sqrt(a) * 0.38 * (0.4 + swirlOn * 0.6);
      const ang = b * Math.PI * 2 + now * (2.2 - r * 3) + r * 9;
      sw.setXYZ(i, SHAKER_X + Math.cos(ang) * r, surfY + 0.012, Math.sin(ang) * r);
    }
    sw.needsUpdate = true;
    if (swirl.current) {
      swirl.current.visible = swirlOn > 0.01;
      (swirl.current.material as THREE.PointsMaterial).opacity = swirlOn;
    }

    // ---------- Beat 1: cap on + shake ----------
    if (cap.current) {
      const capOn = step === 0 ? 0 : step === 1 ? k(0.0, 0.7, t) : 1;
      cap.current.position.y = (1 - capOn) * 1.4;
      cap.current.rotation.y = (1 - capOn) * -3;
      cap.current.visible = step !== 0;
    }
    if (shaker.current) {
      const shaking = step === 1 ? k(0.8, 1.1, t) * (1 - k(3.4, 3.8, t)) : 0;
      const lift = step === 1 ? k(0.7, 1.0, t) * (1 - k(3.5, 4.0, t)) : 0;
      const ph = now * 24;
      shaker.current.position.set(SHAKER_X + Math.sin(ph) * 0.05 * shaking, lift * 0.7 + Math.abs(Math.sin(ph)) * 0.18 * shaking, 0);
      shaker.current.rotation.set(Math.sin(ph * 0.5) * 0.08 * shaking, 0.35, Math.sin(ph) * 0.32 * shaking + lift * -0.1);
    }

    // ---------- Camera ----------
    const [p, tg] = SHOTS[Math.min(step, 2)];
    camPos.set(...p);
    if (step === 2 && !reduced) camPos.z -= k(0, 6, t) * 0.8; // slow push like the reel's final shot
    const s = reduced ? 1 : 1 - Math.exp(-2.6 * dt);
    state.camera.position.lerp(camPos, s);
    look.lerp(new THREE.Vector3(...tg), s);
    state.camera.lookAt(look);
  });

  return (
    <group>
      {/* Tub: behind-left during prep, co-star in the hero shot */}
      <group position={[-1.45, FLOOR - tm.yOffset, -0.6]} rotation-y={0.25}>
        <TubModel spec={spec} />
      </group>
      <group ref={shaker} position={[SHAKER_X, 0, 0]} rotation-y={0.35}>
        <ShakerModel capRef={cap} />
      </group>
      {/* Liquid surface visible from above (the shaker body is opaque) */}
      <mesh ref={liquid} position={[SHAKER_X, FLOOR + 0.06 + SHAKER.h * 0.62, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[SHAKER.r * 0.9, 64]} />
        <meshPhysicalMaterial ref={liquidMat} color="#c9d3d6" roughness={0.08} clearcoat={1} />
      </mesh>
      <points ref={swirl} geometry={swirlGeo} frustumCulled={false}>
        <pointsMaterial color={powder} size={0.045} transparent opacity={0} depthWrite={false} />
      </points>
      <points ref={stream} geometry={streamGeo} frustumCulled={false}>
        <pointsMaterial color={powder} size={0.055} transparent opacity={0.95} depthWrite={false} />
      </points>
      <group ref={scoop}>
        <group scale={0.95}>
          <ScoopModel powder={powder} moundRef={mound} />
        </group>
      </group>
    </group>
  );
}

export default function RitualScene({ active, onReady, ...rest }: RitualProps & SceneProps) {
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: SHOTS[0][0], fov: 28 }}>
      <RealStudio floor="light" floorY={FLOOR} shadow={0.55} floorSize={11} warmth={1} />
      <Ritual {...rest} />
    </CanvasShell>
  );
}
