import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRig } from '../rig';
import { ease, seg } from '../config/timeline';

/**
 * SCENE 7 — HERO PRODUCT SHOT (82–95%)
 * Jar + mixed shake on the counter; the camera orbits and pushes in on the
 * label (CinematicCamera). Here: a soft specular light sweep travels across the
 * label during the push-in — the classic commercial "glint".
 */
export function HeroProductScene() {
  const { progress } = useRig();
  const sweep = useRef<THREE.SpotLight>(null);
  useFrame(() => {
    const p = progress.current ?? 0;
    const s = sweep.current;
    if (!s) return;
    const t = seg(p, 0.86, 0.945);
    s.intensity = ease(p, 0.85, 0.87) * (1 - ease(p, 0.935, 0.955)) * 14;
    s.position.set(THREE.MathUtils.lerp(-1.2, 1.2, t), 0.7, 1.4);
  });
  return <spotLight ref={sweep} angle={0.18} penumbra={1} intensity={0} color="#ffffff" distance={4} decay={2} target-position={[0, 0.35, 0]} />;
}
