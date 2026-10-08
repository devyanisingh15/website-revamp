import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasShell } from '../CanvasShell';
import type { SceneProps } from '../Stage3D';

export interface SwirlProps {
  color: string;
  accent: string;
  notes: string[];
}

const vert = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;
  uniform float uSize;
  attribute float aR;
  attribute float aA;
  attribute float aY;
  attribute float aSeed;
  varying float vSeed;
  varying float vAlpha;
  void main() {
    float speed = 0.25 + (1.0 - aR / 2.4) * 0.6;
    float a = aA + uTime * speed;
    float r = aR * (1.0 + uPulse * 0.35 * aSeed);
    vec3 pos = vec3(cos(a) * r, aY + sin(a * 2.0 + aSeed * 6.0) * 0.08, sin(a) * r * 0.6);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.4 + aSeed) / -mv.z;
    vSeed = aSeed;
    vAlpha = 0.75 - aR * 0.2;
  }
`;
const frag = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vSeed;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 c = mix(uColor, uAccent, smoothstep(0.55, 1.0, vSeed)) * 0.9;
    gl_FragColor = vec4(c, smoothstep(0.5, 0.1, d) * vAlpha);
  }
`;

/** Ingredient props per flavour note (cocoa, mango, kesar…) */
const INGREDIENT: Record<string, { color: string; shape: 'sphere' | 'ico' | 'strand' | 'almond' | 'pod' | 'cube'; size: number }> = {
  Cocoa: { color: '#3a2016', shape: 'sphere', size: 0.12 },
  Milk: { color: '#f5efe2', shape: 'sphere', size: 0.08 },
  Hazelnut: { color: '#9a6435', shape: 'sphere', size: 0.14 },
  Vanilla: { color: '#2a1a10', shape: 'pod', size: 0.5 },
  Cream: { color: '#fff6df', shape: 'sphere', size: 0.1 },
  Mango: { color: '#ffb12e', shape: 'ico', size: 0.18 },
  Kesar: { color: '#d4361f', shape: 'strand', size: 0.3 },
  Pista: { color: '#8fb35a', shape: 'almond', size: 0.1 },
  Badam: { color: '#c79560', shape: 'almond', size: 0.14 },
};

function Ingredients({ notes }: { notes: string[] }) {
  const group = useRef<THREE.Group>(null);
  const items = useMemo(() => {
    const out: { key: string; pos: [number, number, number]; rot: [number, number, number]; spec: (typeof INGREDIENT)[string] }[] = [];
    notes.forEach((n, ni) => {
      const spec = INGREDIENT[n];
      if (!spec) return;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + ni;
        const r = 1.6 + ((i * 37 + ni * 13) % 10) / 10;
        out.push({
          key: `${n}-${i}`,
          pos: [Math.cos(a) * r, ((i % 3) - 1) * 0.6 + ni * 0.2, Math.sin(a) * r * 0.6],
          rot: [a, a * 2, a * 0.5],
          spec,
        });
      }
    });
    return out;
  }, [notes]);

  useFrame((s, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.25;
    group.current.children.forEach((c, i) => {
      c.rotation.x += dt * 0.4;
      c.position.y += Math.sin(s.clock.elapsedTime + i) * 0.002;
    });
  });

  return (
    <group ref={group}>
      {items.map(({ key, pos, rot, spec }) => (
        <mesh key={key} position={pos} rotation={rot} scale={spec.shape === 'almond' ? [spec.size * 1.6, spec.size, spec.size] : spec.size}>
          {spec.shape === 'sphere' && <sphereGeometry args={[1, 16, 12]} />}
          {spec.shape === 'ico' && <icosahedronGeometry args={[1, 0]} />}
          {spec.shape === 'almond' && <sphereGeometry args={[1, 12, 10]} />}
          {spec.shape === 'cube' && <boxGeometry args={[1, 1, 1]} />}
          {spec.shape === 'strand' && <cylinderGeometry args={[0.03, 0.01, 1, 6]} />}
          {spec.shape === 'pod' && <cylinderGeometry args={[0.05, 0.03, 1, 8]} />}
          <meshStandardMaterial color={spec.color} roughness={0.55} flatShading={spec.shape === 'ico'} />
        </mesh>
      ))}
    </group>
  );
}

function Swirl({ color, accent, notes }: SwirlProps) {
  const { size } = useThree();
  const count = size.width < 640 ? 2200 : 4200;
  const mat = useRef<THREE.ShaderMaterial>(null);
  const pulse = useRef(0);
  const last = useRef(color);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const r = new Float32Array(count);
    const a = new Float32Array(count);
    const y = new Float32Array(count);
    const sd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const t = Math.pow(Math.random(), 0.7);
      r[i] = 0.2 + t * 2.2;
      a[i] = Math.random() * Math.PI * 2;
      // funnel: tighter at the bottom
      y[i] = (Math.random() - 0.5) * 2.6 * (0.4 + t * 0.6);
      sd[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aR', new THREE.BufferAttribute(r, 1));
    g.setAttribute('aA', new THREE.BufferAttribute(a, 1));
    g.setAttribute('aY', new THREE.BufferAttribute(y, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uSize: { value: 50 },
      uColor: { value: new THREE.Color(color) },
      uAccent: { value: new THREE.Color(accent) },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const tc = useMemo(() => new THREE.Color(), []);

  useFrame((s, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    if (last.current !== color) {
      last.current = color;
      pulse.current = 1;
    }
    pulse.current = THREE.MathUtils.damp(pulse.current, 0, 2.5, dt);
    u.uTime.value = s.clock.elapsedTime;
    u.uPulse.value = pulse.current;
    u.uSize.value = 50 * s.viewport.dpr;
    (u.uColor.value as THREE.Color).lerp(tc.set(color), 0.06);
    (u.uAccent.value as THREE.Color).lerp(tc.set(accent), 0.06);
  });

  return (
    <group rotation-x={0.25}>
      <points geometry={geom} frustumCulled={false}>
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <Ingredients notes={notes} />
    </group>
  );
}

export default function PowderSwirlScene({ active, onReady, ...rest }: SwirlProps & SceneProps) {
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: [0, 0, 6], fov: 38 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 3]} intensity={1.6} />
      <Swirl {...rest} />
    </CanvasShell>
  );
}
