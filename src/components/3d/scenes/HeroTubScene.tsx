import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasShell } from '../CanvasShell';
import { RealStudio } from '../real/Studio';
import { TubModel, ScoopModel, tubMetrics } from '../real/models';
import { packSpec } from '../real/spec';
import { PowderBurst } from '../models/PowderBurst';
import { getProduct } from '@/data/products';
import type { SceneProps } from '../Stage3D';

/**
 * HERO — modelled on the reference reel's opening:
 *   3/4 product shot → camera rises to top-down → cap unscrews and lifts away
 *   → push into the powder → a heaped scoop rises out with a puff of powder.
 * Scroll scrubs the whole sequence; drag rotates the tub at any point.
 */
export interface HeroTubProps {
  productId: string;
  flavourId: string;
  sizeLabel: string;
  powder: string;
  powderAccent?: string;
  /** 0→1 scroll progress through the pinned hero (written by ScrollTrigger) */
  progress: React.RefObject<number>;
  /** Keyboard / button rotation impulses (radians), consumed each frame */
  impulse: React.RefObject<number>;
}

const k = (a: number, b: number, t: number) => {
  const x = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

// Camera keyframes [progress, position, target]
type Key = [number, [number, number, number], [number, number, number]];
const CAM: Key[] = [
  [0.0, [0.4, 1.3, 10.6], [0, 0.15, 0]],
  [0.22, [0.2, 4.6, 7.6], [0, 0.2, 0]],
  [0.42, [0.05, 8.2, 2.4], [0, 0.6, 0]], // near top-down, like the unscrew shot
  [0.68, [0.02, 4.4, 1.5], [0, 1.1, 0]], // into the powder
  [1.0, [0.6, 3.6, 3.9], [0.15, 1.75, 0]], // scoop rising toward camera
];

function camAt(p: number, pos: THREE.Vector3, tgt: THREE.Vector3) {
  let i = 0;
  while (i < CAM.length - 2 && p > CAM[i + 1][0]) i++;
  const [p0, a0, t0] = CAM[i];
  const [p1, a1, t1] = CAM[i + 1];
  const f = k(p0, p1, p);
  pos.set(...a0).lerp(new THREE.Vector3(...a1), f);
  tgt.set(...t0).lerp(new THREE.Vector3(...t1), f);
}

function Rig({ productId, flavourId, sizeLabel, powder, powderAccent, progress, impulse }: HeroTubProps) {
  const product = getProduct(productId)!;
  const flavour = product.flavours.find((f) => f.id === flavourId);
  const spec = useMemo(() => packSpec(product, flavour, sizeLabel), [product, flavour, sizeLabel]);
  const m = tubMetrics(spec.dims!);

  const tubSpin = useRef<THREE.Group>(null);
  const cap = useRef<THREE.Group>(null);
  const scoop = useRef<THREE.Group>(null);
  const puff = useRef(0);
  const { gl, camera, size } = useThree();
  const spin = useRef({ angle: -0.45, vel: 0, dragging: false, lastX: 0, idle: 0 });
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(0, 0.15, 0), []);

  useEffect(() => {
    const el = gl.domElement;
    const s = spin.current;
    const down = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = e.clientX;
      s.idle = 0;
      el.style.cursor = 'grabbing';
    };
    const move = (e: PointerEvent) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      s.lastX = e.clientX;
      s.vel = dx * 0.01;
      s.angle += dx * 0.01;
    };
    const up = () => {
      s.dragging = false;
      el.style.cursor = 'grab';
    };
    el.style.cursor = 'grab';
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [gl]);

  const narrow = size.width < 640;
  const neckTop = m.yOffset + spec.dims!.height + 0.14;

  useFrame((state, dt) => {
    const p = progress.current ?? 0;
    const s = spin.current;
    if (impulse.current) {
      s.vel += impulse.current * 0.1;
      impulse.current = 0;
      s.idle = 0;
    }
    if (!s.dragging) {
      s.angle += s.vel;
      s.vel *= 0.93;
      s.idle += dt;
      // Slow turntable before the sequence starts; settles label-forward as we scroll
      if (s.idle > 1.5) s.angle += dt * 0.22 * (1 - k(0.02, 0.2, p));
      const settle = k(0.05, 0.25, p);
      if (settle > 0 && !s.dragging) s.angle = THREE.MathUtils.damp(s.angle, Math.round(s.angle / (Math.PI * 2)) * Math.PI * 2 - 0.25, 3 * settle, dt);
    }
    if (tubSpin.current) tubSpin.current.rotation.y = s.angle;

    // Cap: 2½ counter-clockwise turns while rising, then lifts away to the side
    const unscrew = k(0.26, 0.46, p);
    const away = k(0.44, 0.6, p);
    if (cap.current) {
      cap.current.rotation.y = unscrew * Math.PI * 5;
      cap.current.position.set(away * -2.6, unscrew * 0.16 + away * 1.4, away * 0.9);
      cap.current.rotation.z = away * 0.5;
      cap.current.visible = away < 0.995;
    }

    // Scoop rises out of the powder (beats 2–3 of the reel)
    const rise = k(0.68, 0.96, p);
    if (scoop.current) {
      scoop.current.visible = p > 0.62;
      scoop.current.position.set(0.05 + rise * 0.15, neckTop - 0.55 + rise * 1.55, 0.05 + rise * 0.35);
      scoop.current.rotation.set(0.25 + rise * 0.45, 0.6, -0.15 - rise * 0.2);
      const sc = 0.9 + rise * 0.15;
      scoop.current.scale.setScalar(sc);
    }
    puff.current = k(0.7, 1.0, p);

    camAt(p, pos, tgt);
    if (narrow) pos.multiplyScalar(1.18);
    const smooth = 1 - Math.exp(-7 * dt);
    camera.position.lerp(pos, smooth);
    look.lerp(tgt, smooth);
    camera.lookAt(look);
    void state;
  });

  return (
    <group>
      <group ref={tubSpin}>
        <TubModel spec={spec} capRef={cap} showPowder />
      </group>
      <group ref={scoop} visible={false}>
        <ScoopModel powder={powder} />
      </group>
      <PowderBurst progress={puff} color={powder} accent={powderAccent} origin={[0, neckTop - 0.05, 0]} count={700} size={32} />
    </group>
  );
}

export default function HeroTubScene(props: HeroTubProps & SceneProps) {
  const { active, onReady, ...rest } = props;
  const product = getProduct(rest.productId)!;
  const m = tubMetrics(packSpec(product).dims!);
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: [0.4, 1.3, 10.6], fov: 26 }}>
      <RealStudio floor="dark" floorY={m.yOffset} shadow={0.8} floorSize={9} />
      <Rig {...rest} />
    </CanvasShell>
  );
}
