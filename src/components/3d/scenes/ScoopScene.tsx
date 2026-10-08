import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CanvasShell } from '../CanvasShell';
import type { SceneProps } from '../Stage3D';

/**
 * A scoop of powder made of particles.
 *  - "nutrition" mode: nested subsets light up — EAAs are a share of protein,
 *    BCAAs a share of EAAs (11.75 / 25 g and 5.51 / 25 g from the label data).
 *  - "hotspots" mode: numbered markers for the Why Biozyme story.
 */
export type Macro = 'protein' | 'eaas' | 'bcaas' | 'calories' | null;

export interface ScoopProps {
  powder: string;
  macro: Macro;
  /** Fractions of protein particles that are EAAs / BCAAs */
  eaaShare: number;
  bcaaShare: number;
  hotspots?: { id: string; pos: [number, number, number] }[];
  focus?: string | null;
  onFocus?: (id: string) => void;
}

const vert = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uMode;
  uniform float uEaa;
  uniform float uBcaa;
  attribute float aSeed;
  attribute float aRank;
  varying float vLit;
  varying float vSeed;
  void main() {
    float lit = 0.0;
    if (uMode > 0.5 && uMode < 1.5) lit = 1.0;              // protein — all
    else if (uMode > 1.5 && uMode < 2.5) lit = step(aRank, uEaa);  // EAAs
    else if (uMode > 2.5 && uMode < 3.5) lit = step(aRank, uBcaa); // BCAAs
    else if (uMode > 3.5) lit = 1.0;                         // calories
    vec3 pos = position;
    pos.y += lit * (0.06 + sin(uTime * 2.0 + aSeed * 20.0) * 0.03);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + aSeed * 0.5) * (1.0 + lit * 0.35) / -mv.z;
    vLit = lit;
    vSeed = aSeed;
  }
`;
const frag = /* glsl */ `
  uniform vec3 uPowder;
  uniform vec3 uLit;
  varying float vLit;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 c = mix(uPowder * (0.75 + vSeed * 0.35), uLit, vLit);
    gl_FragColor = vec4(c, smoothstep(0.5, 0.2, d));
  }
`;

const LIT: Record<Exclude<Macro, null>, string> = {
  protein: '#ff4a50',
  eaas: '#ffb547',
  bcaas: '#46e891',
  calories: '#f2efe9',
};

function Scoop({ powder, macro, eaaShare, bcaaShare, hotspots, focus, onFocus }: ScoopProps) {
  const { size } = useThree();
  const count = size.width < 640 ? 1800 : 3200;
  const mat = useRef<THREE.ShaderMaterial>(null);
  const root = useRef<THREE.Group>(null);
  const tc = useMemo(() => new THREE.Color(), []);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const rank = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * 1.15;
      const a = Math.random() * Math.PI * 2;
      const h = Math.sqrt(Math.max(0, 1 - (r / 1.2) ** 2)) * 0.75 * Math.random();
      pos.set([Math.cos(a) * r, h + 0.02, Math.sin(a) * r], i * 3);
      seed[i] = Math.random();
      rank[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aRank', new THREE.BufferAttribute(rank, 1));
    return g;
  }, [count]);

  const cup = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = (i / 20) * (Math.PI / 2);
      pts.push(new THREE.Vector2(Math.sin(t) * 1.25, -Math.cos(t) * 0.8 + 0.05));
    }
    return new THREE.LatheGeometry(pts, 64);
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 55 },
      uMode: { value: 0 },
      uEaa: { value: eaaShare },
      uBcaa: { value: bcaaShare },
      uPowder: { value: new THREE.Color(powder) },
      uLit: { value: new THREE.Color('#ff4a50') },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useFrame((s, dt) => {
    const u = mat.current?.uniforms;
    if (u) {
      u.uTime.value = s.clock.elapsedTime;
      u.uSize.value = 55 * s.viewport.dpr;
      u.uMode.value = macro === 'protein' ? 1 : macro === 'eaas' ? 2 : macro === 'bcaas' ? 3 : macro === 'calories' ? 4 : 0;
      u.uEaa.value = eaaShare;
      u.uBcaa.value = bcaaShare;
      (u.uPowder.value as THREE.Color).lerp(tc.set(powder), 0.08);
      if (macro) (u.uLit.value as THREE.Color).lerp(tc.set(LIT[macro]), 0.2);
    }
    if (root.current) root.current.rotation.y += dt * 0.15;
  });

  return (
    <group rotation-x={0.45} position={[0, -0.2, 0]}>
      <group ref={root}>
        <mesh geometry={cup}>
          <meshStandardMaterial color="#1c1c1f" metalness={0.3} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[1.95, -0.1, 0]} rotation-z={Math.PI / 2 + 0.12}>
          <cylinderGeometry args={[0.08, 0.06, 1.5, 12]} />
          <meshStandardMaterial color="#1c1c1f" metalness={0.3} roughness={0.35} />
        </mesh>
        <points geometry={geom} frustumCulled={false}>
          <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} />
        </points>
      </group>
      {hotspots?.map((h, i) => (
        <Html key={h.id} position={h.pos} center zIndexRange={[20, 0]}>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => onFocus?.(h.id)}
            className={`relative grid size-8 place-items-center rounded-full border font-mono text-xs font-semibold transition-all ${
              focus === h.id ? 'scale-110 border-proof-400 bg-proof-400 text-ink-950' : 'border-white/40 bg-ink-950/70 text-bone-100 hover:border-proof-400'
            }`}
          >
            {focus === h.id && <span className="absolute inset-0 animate-pulse-ring rounded-full" />}
            {i + 1}
          </button>
        </Html>
      ))}
    </group>
  );
}

export default function ScoopScene({ active, onReady, ...rest }: ScoopProps & SceneProps) {
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: [0, 1.6, 5.4], fov: 34 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 3]} intensity={1.6} />
      <pointLight position={[-2, 1, 2]} intensity={4} color="#e8202a" />
      <Scoop {...rest} />
    </CanvasShell>
  );
}
