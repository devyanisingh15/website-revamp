import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasShell } from '../CanvasShell';
import type { SceneProps } from '../Stage3D';

/**
 * SCOOP → PARTICLES → BREAKDOWN → MUSCLE FIBRE
 * One particle system whose four target layouts are baked into attributes;
 * the vertex shader blends between them from a single scroll uniform.
 * `absorb` (0..1) controls the share of particles that reach the fibre, so the
 * "Regular whey vs Biozyme" toggle can illustrate 50% higher absorption
 * (Biozyme = 1.0, regular = 1 / 1.5 ≈ 0.67). Illustrative only.
 */

export interface AbsorptionProps {
  progress: React.RefObject<number>;
  absorb: number;
  /** Highlight BCAAs (60% higher BCAA absorption) in proof green */
  showBcaa?: boolean;
}

const vert = /* glsl */ `
  uniform float uP;
  uniform float uTime;
  uniform float uAbsorb;
  uniform float uSize;
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aP3;
  attribute vec3 aWaste;
  attribute float aSeed;
  attribute float aKind;
  varying vec3 vColor;
  varying float vAlpha;
  uniform vec3 uPowder;
  uniform vec3 uBcaa;
  uniform vec3 uMuscle;
  uniform float uShowBcaa;
  void main() {
    float s1 = smoothstep(0.12, 0.34, uP);
    float s2 = smoothstep(0.38, 0.6, uP);
    float s3 = smoothstep(0.64, 0.9, uP);
    float wasted = step(uAbsorb, aSeed);
    vec3 target3 = mix(aP3, aWaste, wasted);
    vec3 pos = mix(mix(mix(position, aP1, s1), aP2, s2), target3, s3);
    float n = uTime * 0.6 + aSeed * 40.0;
    float drift = (s1 - s3) * 0.08 + 0.01;
    pos += vec3(sin(n), cos(n * 1.3), sin(n * 0.7)) * drift;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float isB = step(0.5, aKind) * uShowBcaa;
    gl_PointSize = uSize * (0.6 + aSeed * 0.6) * (1.0 + isB * 0.4 * s2) * (1.0 - 0.45 * s3) / -mv.z;
    vec3 c = uPowder;
    c = mix(c, uBcaa, isB * s2);
    c = mix(c, uMuscle, s3 * (1.0 - wasted) * (1.0 - isB * 0.5));
    vColor = c;
    vAlpha = (1.0 - wasted * s3 * 0.85) * (1.0 - 0.3 * s3 * (1.0 - wasted));
  }
`;

const frag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.15, d) * vAlpha);
  }
`;

const FIBRES: [number, number][] = [
  [0, 0],
  [0.46, 0],
  [-0.46, 0],
  [0.23, 0.4],
  [-0.23, 0.4],
  [0.23, -0.4],
  [-0.23, -0.4],
];

function useParticles(count: number) {
  return useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p0 = new Float32Array(count * 3);
    const p1 = new Float32Array(count * 3);
    const p2 = new Float32Array(count * 3);
    const p3 = new Float32Array(count * 3);
    const w = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const kind = new Float32Array(count);
    const v = new THREE.Vector3();
    let chainC = new THREE.Vector3();
    let chainD = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      // 0 — mound of powder in a scoop
      const r = Math.cbrt(Math.random()) * 0.85;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random()); // upper hemisphere
      v.set(Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r * 0.55 - 0.05, Math.sin(ph) * Math.sin(th) * r);
      p0.set([v.x, v.y, v.z], i * 3);
      // 1 — dispersed cloud
      v.randomDirection().multiplyScalar(0.6 + Math.random() * 1.8);
      v.x *= 1.5;
      p1.set([v.x, v.y, v.z], i * 3);
      // 2 — short peptide chains (groups of 4 beads)
      if (i % 4 === 0) {
        chainC = new THREE.Vector3((Math.random() - 0.5) * 5.2, (Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 1.5);
        chainD = new THREE.Vector3().randomDirection().multiplyScalar(0.13);
      }
      const k = i % 4;
      p2.set([chainC.x + chainD.x * k, chainC.y + chainD.y * k + Math.sin(k) * 0.03, chainC.z + chainD.z * k], i * 3);
      // 3 — surface of a muscle fibre bundle
      const [fy, fz] = FIBRES[i % FIBRES.length];
      const a = Math.random() * Math.PI * 2;
      const x = (Math.random() - 0.5) * 5.4;
      p3.set([x, fy + Math.cos(a) * 0.21, fz + Math.sin(a) * 0.21], i * 3);
      // waste path — passes through and falls away
      w.set([(Math.random() - 0.5) * 6, -2.6 - Math.random() * 1.2, (Math.random() - 0.5) * 2], i * 3);
      seed[i] = Math.random();
      kind[i] = Math.random() < 0.22 ? 1 : 0;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p0, 3));
    g.setAttribute('aP1', new THREE.BufferAttribute(p1, 3));
    g.setAttribute('aP2', new THREE.BufferAttribute(p2, 3));
    g.setAttribute('aP3', new THREE.BufferAttribute(p3, 3));
    g.setAttribute('aWaste', new THREE.BufferAttribute(w, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
    return g;
  }, [count]);
}

function Story({ progress, absorb, showBcaa = true }: AbsorptionProps) {
  const { size } = useThree();
  const narrow = size.width < 640;
  const geom = useParticles(narrow ? 1400 : 2600);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const scoop = useRef<THREE.Group>(null);
  const fibre = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uP: { value: 0 },
      uTime: { value: 0 },
      uAbsorb: { value: 1 },
      uSize: { value: 60 },
      uShowBcaa: { value: 1 },
      uPowder: { value: new THREE.Color('#efe6d4') },
      uBcaa: { value: new THREE.Color('#46e891') },
      uMuscle: { value: new THREE.Color('#ff4a50') },
    }),
    [],
  );

  const scoopGeom = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * (Math.PI / 2);
      pts.push(new THREE.Vector2(Math.sin(a) * 1.0, -Math.cos(a) * 0.7));
    }
    return new THREE.LatheGeometry(pts, 64);
  }, []);

  useFrame((s, dt) => {
    const p = progress.current ?? 0;
    const u = mat.current?.uniforms;
    if (u) {
      u.uP.value = p;
      u.uTime.value = s.clock.elapsedTime;
      u.uAbsorb.value = THREE.MathUtils.damp(u.uAbsorb.value, absorb, 4, dt);
      u.uSize.value = (narrow ? 70 : 60) * s.viewport.dpr;
      u.uShowBcaa.value = showBcaa ? 1 : 0;
    }
    const fadeScoop = 1 - THREE.MathUtils.smoothstep(p, 0.08, 0.3);
    if (scoop.current) {
      scoop.current.visible = fadeScoop > 0.01;
      scoop.current.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
        if (m) m.opacity = fadeScoop;
      });
      scoop.current.rotation.y = s.clock.elapsedTime * 0.3;
    }
    const showFibre = THREE.MathUtils.smoothstep(p, 0.55, 0.85);
    if (fibre.current) {
      fibre.current.visible = showFibre > 0.01;
      fibre.current.children.forEach((c, i) => {
        const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.opacity = showFibre * 0.28;
        m.emissiveIntensity = 0.2 + Math.max(0, Math.sin(s.clock.elapsedTime * 2 + i)) * 0.25 * showFibre;
      });
    }
    if (root.current) {
      root.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.2) * 0.15 + (narrow ? 0 : -0.2);
      root.current.rotation.x = 0.15;
    }
  });

  return (
    <group ref={root} scale={narrow ? 0.6 : 0.82}>
      <group ref={scoop} position={[0, 0, 0]}>
        <mesh geometry={scoopGeom}>
          <meshStandardMaterial color="#2a2a2e" metalness={0.2} roughness={0.35} side={THREE.DoubleSide} transparent />
        </mesh>
        <mesh position={[1.6, -0.05, 0]} rotation-z={Math.PI / 2 + 0.15}>
          <cylinderGeometry args={[0.07, 0.07, 1.4, 12]} />
          <meshStandardMaterial color="#2a2a2e" metalness={0.2} roughness={0.35} transparent />
        </mesh>
      </group>
      <group ref={fibre}>
        {FIBRES.map(([y, z], i) => (
          <mesh key={i} position={[0, y, z]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.2, 0.2, 5.6, 20, 1, true]} />
            <meshStandardMaterial color="#7a1018" emissive="#e8202a" emissiveIntensity={0.2} transparent opacity={0} roughness={0.6} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <points geometry={geom} frustumCulled={false}>
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} />
      </points>
    </group>
  );
}

export default function AbsorptionScene({ active, onReady, ...rest }: AbsorptionProps & SceneProps) {
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: [0, 0.4, 7.2], fov: 34 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <pointLight position={[-3, -1, 2]} intensity={6} color="#e8202a" />
      <Story {...rest} />
    </CanvasShell>
  );
}
