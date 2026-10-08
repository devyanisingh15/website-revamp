import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasShell } from '../CanvasShell';
import type { SceneProps } from '../Stage3D';

export interface FigureProps {
  /** 0 = lean frame, 1 = big frame */
  mass: number;
  /** 0 = soft, 1 = defined (tapered waist) */
  definition: number;
  tint: string;
}

type Part = {
  key: string;
  geo: 'ico' | 'cap';
  /** returns [pos, scale, rotZ] for current mass m and definition d */
  f: (m: number, d: number) => { p: [number, number, number]; s: [number, number, number]; rz?: number };
};

const sym = (x: number) => [x, -x] as const;

const PARTS: Part[] = [
  { key: 'head', geo: 'ico', f: () => ({ p: [0, 1.82, 0], s: [0.24, 0.28, 0.25] }) },
  { key: 'neck', geo: 'cap', f: (m) => ({ p: [0, 1.52, 0], s: [0.12 + m * 0.05, 0.12, 0.12 + m * 0.05] }) },
  { key: 'chest', geo: 'ico', f: (m) => ({ p: [0, 1.12, 0], s: [0.5 + m * 0.26, 0.42 + m * 0.06, 0.28 + m * 0.12] }) },
  { key: 'waist', geo: 'ico', f: (m, d) => ({ p: [0, 0.58, 0], s: [0.36 + m * 0.22 - d * 0.05, 0.36, 0.24 + m * 0.12 - d * 0.03] }) },
  { key: 'hips', geo: 'ico', f: (m) => ({ p: [0, 0.2, 0], s: [0.4 + m * 0.14, 0.22, 0.26 + m * 0.06] }) },
  ...sym(1).map((sx) => ({
    key: `shoulder${sx}`,
    geo: 'ico' as const,
    f: (m: number) => ({ p: [sx * (0.56 + m * 0.24), 1.32, 0] as [number, number, number], s: [0.16 + m * 0.08, 0.15 + m * 0.07, 0.16 + m * 0.07] as [number, number, number] }),
  })),
  ...sym(1).map((sx) => ({
    key: `upperArm${sx}`,
    geo: 'cap' as const,
    f: (m: number) => ({ p: [sx * (0.66 + m * 0.28), 0.98, 0] as [number, number, number], s: [0.1 + m * 0.07, 0.3, 0.1 + m * 0.07] as [number, number, number], rz: sx * 0.12 }),
  })),
  ...sym(1).map((sx) => ({
    key: `forearm${sx}`,
    geo: 'cap' as const,
    f: (m: number) => ({ p: [sx * (0.74 + m * 0.3), 0.5, 0.04] as [number, number, number], s: [0.08 + m * 0.045, 0.28, 0.08 + m * 0.045] as [number, number, number], rz: sx * 0.06 }),
  })),
  ...sym(1).map((sx) => ({
    key: `thigh${sx}`,
    geo: 'cap' as const,
    f: (m: number) => ({ p: [sx * (0.2 + m * 0.06), -0.32, 0] as [number, number, number], s: [0.15 + m * 0.07, 0.38, 0.15 + m * 0.07] as [number, number, number], rz: -sx * 0.04 }),
  })),
  ...sym(1).map((sx) => ({
    key: `calf${sx}`,
    geo: 'cap' as const,
    f: (m: number) => ({ p: [sx * (0.22 + m * 0.06), -1.08, 0] as [number, number, number], s: [0.1 + m * 0.045, 0.34, 0.1 + m * 0.045] as [number, number, number] }),
  })),
];

function Figure({ mass, definition, tint }: FigureProps) {
  const root = useRef<THREE.Group>(null);
  const meshes = useRef<Record<string, THREE.Group | null>>({});
  const state = useRef({ m: mass, d: definition });
  const ico = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const cap = useMemo(() => new THREE.CapsuleGeometry(1, 1.2, 2, 6), []);
  const wireMat = useRef<THREE.MeshBasicMaterial>(null);
  const tc = useMemo(() => new THREE.Color(), []);

  useFrame((s, dt) => {
    const st = state.current;
    st.m = THREE.MathUtils.damp(st.m, mass, 3, dt);
    st.d = THREE.MathUtils.damp(st.d, definition, 3, dt);
    const breathe = 1 + Math.sin(s.clock.elapsedTime * 1.6) * 0.012;
    PARTS.forEach((part) => {
      const g = meshes.current[part.key];
      if (!g) return;
      const { p, s: sc, rz = 0 } = part.f(st.m, st.d);
      g.position.set(...p);
      g.scale.set(sc[0] * breathe, part.geo === 'cap' ? sc[1] / 1.2 : sc[1], sc[2] * breathe);
      g.rotation.z = rz;
    });
    if (root.current) root.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.35) * 0.6;
    wireMat.current?.color.lerp(tc.set(tint), 0.08);
  });

  return (
    <group ref={root} position={[0, -0.25, 0]}>
      {PARTS.map((part) => (
        <group
          key={part.key}
          ref={(el) => {
            meshes.current[part.key] = el;
          }}
        >
          <mesh geometry={part.geo === 'ico' ? ico : cap}>
            <meshStandardMaterial color="#26262b" roughness={0.6} metalness={0.15} flatShading />
          </mesh>
          <mesh geometry={part.geo === 'ico' ? ico : cap} scale={1.01}>
            <meshBasicMaterial ref={part.key === 'head' ? wireMat : undefined} color={tint} wireframe transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function FigureScene({ active, onReady, ...rest }: FigureProps & SceneProps) {
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: [0, 0.3, 6.2], fov: 34 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 4, 4]} intensity={1.8} />
      <directionalLight position={[-3, 1, -2]} intensity={1.2} color={rest.tint} />
      <Figure {...rest} />
    </CanvasShell>
  );
}
