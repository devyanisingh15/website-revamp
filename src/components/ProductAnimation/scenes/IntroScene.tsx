import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRig } from '../rig';
import { ease } from '../config/timeline';

/**
 * SCENE 1 — BRAND INTRO (0–10%)
 * 3D: a few dust motes catching the rim light in the dark (barely there).
 * DOM: the logo fades in with a very slight scale (IntroOverlay.tsx — kept
 * three-free so it can ship in the main bundle).
 */
export function IntroScene() {
  const { progress, quality } = useRig();
  const count = quality === 'high' ? 160 : 40;
  const pts = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 2.2;
      a[i * 3 + 1] = Math.random() * 1.4;
      a[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    }
    g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    return g;
  }, [count]);
  useFrame((s) => {
    const p = progress.current ?? 0;
    if (!pts.current) return;
    pts.current.visible = p < 0.22;
    pts.current.rotation.y = s.clock.elapsedTime * 0.02;
    (pts.current.material as THREE.PointsMaterial).opacity = 0.35 * ease(p, 0.02, 0.08) * (1 - ease(p, 0.15, 0.22));
  });
  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial color="#f2efe9" size={0.006} transparent opacity={0} depthWrite={false} sizeAttenuation />
    </points>
  );
}
