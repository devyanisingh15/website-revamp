import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRig } from '../rig';
import { ease } from '../config/timeline';
import { CONTAINER } from '../config/assets';
import { SCOOP_SPOT } from '../components/PowderBed';
import { PowderParticles } from '../components/PowderParticles';
import { Scoop } from '../components/Scoop';

/**
 * SCENE 5 — SCOOP + POUR (≈44–72%)
 * 1 scoop enters the jar  2 digs and collects (crater forms, mound builds)
 * 3 lifts out  4 travels to the shaker  5 tips; granules fall under gravity.
 * Owns: scoop transform + mound, powder crater, pour particles.
 */
const SCALE = 0.115;
type K = { p: number; pos: [number, number, number]; yaw: number; tilt: number };
const PATH: K[] = [
  { p: 0.44, pos: [0.3, 0.98, 0.2], yaw: Math.PI, tilt: 0.5 },
  { p: 0.47, pos: [SCOOP_SPOT.x, 0.8, SCOOP_SPOT.y], yaw: Math.PI, tilt: 0.35 },
  { p: 0.5, pos: [SCOOP_SPOT.x, CONTAINER.powderY - 0.035, SCOOP_SPOT.y], yaw: Math.PI, tilt: 0.75 },
  { p: 0.535, pos: [SCOOP_SPOT.x, CONTAINER.powderY + 0.03, SCOOP_SPOT.y], yaw: Math.PI, tilt: 0.0 },
  { p: 0.565, pos: [0.06, 1.0, 0.03], yaw: Math.PI, tilt: 0.0 },
  { p: 0.605, pos: [0.52, 0.8, 0.08], yaw: Math.PI, tilt: 0.0 },
  { p: 0.62, pos: [0.52, 0.8, 0.08], yaw: Math.PI, tilt: 0.0 },
  { p: 0.68, pos: [0.52, 0.8, 0.08], yaw: Math.PI, tilt: 2.1 },
  { p: 0.71, pos: [0.3, 1.1, 0.12], yaw: Math.PI, tilt: 1.2 },
];
export const POUR = { start: 0.625, end: 0.685 };

function pose(p: number, out: { pos: THREE.Vector3; yaw: number; tilt: number }) {
  let i = 0;
  while (i < PATH.length - 2 && p > PATH[i + 1].p) i++;
  const a = PATH[i];
  const b = PATH[i + 1];
  const t = ease(p, a.p, b.p);
  out.pos.set(...a.pos).lerp(new THREE.Vector3(...b.pos), t);
  out.yaw = THREE.MathUtils.lerp(a.yaw, b.yaw, t);
  out.tilt = THREE.MathUtils.lerp(a.tilt, b.tilt, t);
}

export function PourScene() {
  const { progress, scoop, scoopMound, crater } = useRig();
  const tilt = useRef<THREE.Group>(null);
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), yaw: 0, tilt: 0 }), []);

  // Lip of the tipped scoop (world) and pour velocity toward the cup centre
  const origin = useMemo(() => new THREE.Vector3(0.548, 0.735, 0.08), []);
  const velocity = useMemo(() => new THREE.Vector3(0.32, -0.08, 0.0), []);

  useFrame(() => {
    const p = progress.current ?? 0;
    const s = scoop.current;
    if (!s) return;
    s.visible = p > 0.44 && p < 0.72;
    if (!s.visible) return;
    pose(p, tmp);
    s.position.copy(tmp.pos);
    s.rotation.y = tmp.yaw;
    if (tilt.current) tilt.current.rotation.z = tmp.tilt;
    // Collect: crater deepens as the mound builds; pour: mound empties
    crater.current = ease(p, 0.49, 0.535);
    if (scoopMound.current) scoopMound.current.scale.y = Math.max(0.001, ease(p, 0.5, 0.535) * (1 - ease(p, POUR.start, POUR.end)));
  });

  return (
    <>
      <group ref={scoop} visible={false}>
        <group ref={tilt}>
          <group scale={SCALE}>
            <Scoop fillRef={scoopMound} />
          </group>
        </group>
      </group>
      <PowderParticles start={POUR.start} end={POUR.end} origin={origin} velocity={velocity} floorY={0.03} timeScale={21} />
    </>
  );
}
