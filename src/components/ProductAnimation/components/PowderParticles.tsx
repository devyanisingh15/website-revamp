import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRig } from '../rig';

/**
 * POWDER POUR — deterministic, scroll-scrubbable granule stream.
 * Each granule has an emission moment inside [start, end] of scroll progress.
 * Its position is a closed-form ballistic path (gravity + small lateral spread),
 * so scrubbing backwards and forwards is exact. Granules disappear when they
 * land (y < floorY) — they're absorbed into the pile in the shaker.
 * A handful of slow dust motes add a hint of airborne powder (no smoke cloud).
 */
export interface PourProps {
  /** Scroll window during which granules leave the scoop */
  start: number;
  end: number;
  /** World-space lip of the tipped scoop */
  origin: THREE.Vector3;
  /** Initial velocity direction (m/s) */
  velocity: THREE.Vector3;
  /** Where granules land / vanish */
  floorY: number;
  /** Seconds of simulated time per unit of scroll progress */
  timeScale?: number;
}

const G = -9.81 * 0.55; // light powder in still air: slightly damped gravity

export function PowderParticles({ start, end, origin, velocity, floorY, timeScale = 14 }: PourProps) {
  const { quality, progress, powderColor, reduced } = useRig();
  const count = quality === 'high' ? 1100 : 280;
  const dustCount = quality === 'high' ? 90 : 20;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dust = useRef<THREE.Points>(null);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (k: number) => {
          const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
          return s - Math.floor(s);
        };
        return {
          emit: start + (end - start) * Math.pow(r(1), 0.85),
          spread: new THREE.Vector3((r(2) - 0.5) * 0.08, (r(3) - 0.5) * 0.04, (r(4) - 0.5) * 0.08),
          offset: new THREE.Vector3((r(5) - 0.5) * 0.03, 0, (r(6) - 0.5) * 0.02),
          size: 0.0012 + r(7) ** 2 * 0.0026,
          rot: r(8) * 6,
        };
      }),
    [count, start, end],
  );
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const sc = useMemo(() => new THREE.Vector3(), []);

  const dustGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dustCount * 3), 3));
    return g;
  }, [dustCount]);

  useFrame((state) => {
    const p = progress.current ?? 0;
    const im = mesh.current;
    if (!im) return;
    const active = !reduced && p > start - 0.01 && p < end + 0.06;
    im.visible = active;
    if (dust.current) dust.current.visible = active;
    if (!active) return;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      const age = (p - s.emit) * timeScale;
      if (age <= 0) {
        im.setMatrixAt(i, m.makeScale(0, 0, 0));
        continue;
      }
      v.copy(origin).add(s.offset);
      v.x += (velocity.x + s.spread.x) * age;
      v.y += (velocity.y + s.spread.y) * age + 0.5 * G * age * age;
      v.z += (velocity.z + s.spread.z) * age;
      if (v.y < floorY) {
        im.setMatrixAt(i, m.makeScale(0, 0, 0));
        continue;
      }
      e.set(s.rot + age * 3, s.rot, s.rot * 0.5);
      q.setFromEuler(e);
      im.setMatrixAt(i, m.compose(v, q, sc.setScalar(s.size)));
    }
    im.instanceMatrix.needsUpdate = true;

    // Dust motes drift around the mouth of the shaker
    const dp = dustGeo.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    const strength = Math.min(1, Math.max(0, (p - start) / (end - start + 0.03)));
    for (let i = 0; i < dustCount; i++) {
      const a = i * 2.39996 + t * 0.15;
      const r = 0.04 + ((i * 37) % 10) * 0.008 * strength;
      dp.setXYZ(i, origin.x + Math.cos(a) * r + velocity.x * 0.05, floorY + 0.12 + ((i * 53) % 17) * 0.012 * strength + Math.sin(t * 0.4 + i) * 0.01, origin.z + Math.sin(a) * r);
    }
    dp.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={mesh} args={[geo, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial color={powderColor} roughness={0.95} flatShading />
      </instancedMesh>
      <points ref={dust} geometry={dustGeo} frustumCulled={false}>
        <pointsMaterial color={powderColor} size={0.004} transparent opacity={0.35} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  );
}
