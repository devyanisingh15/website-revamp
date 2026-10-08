import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * GPU powder burst: every particle's path is computed in the vertex shader
 * from a single progress uniform, so scrubbing costs nothing on the CPU.
 */
const vert = /* glsl */ `
  uniform float uP;
  uniform float uTime;
  uniform float uSize;
  attribute vec3 aDir;
  attribute float aSpeed;
  attribute float aSeed;
  varying float vAlpha;
  varying float vMix;
  void main() {
    float b = uP;
    vec3 pos = position + aDir * aSpeed * b * 3.4;
    pos.y -= b * b * 0.9 * aSpeed;
    float sw = uTime * (0.4 + aSeed) + aSeed * 6.2831;
    pos.x += sin(sw) * 0.06 * b;
    pos.z += cos(sw) * 0.06 * b;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + aSeed) * (1.0 / -mv.z);
    vAlpha = smoothstep(0.0, 0.08, b) * (1.0 - smoothstep(0.75, 1.0, b * (0.7 + aSeed * 0.5)));
    vMix = aSeed;
  }
`;

const frag = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vAlpha;
  varying float vMix;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.1, d) * vAlpha;
    vec3 col = mix(uColor * 1.25, uAccent, step(0.6, vMix));
    gl_FragColor = vec4(col, a);
  }
`;

export function PowderBurst({
  progress,
  color,
  accent,
  origin = [0, 0, 0],
  count = 2600,
}: {
  progress: React.RefObject<number>;
  color: string;
  accent?: string;
  origin?: [number, number, number];
  count?: number;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const dir = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * 0.9;
      const a = Math.random() * Math.PI * 2;
      pos.set([Math.cos(a) * r, 0, Math.sin(a) * r], i * 3);
      // Upward cone, wider at the edges
      const spread = 0.25 + r * 0.9;
      const d = new THREE.Vector3(Math.cos(a) * spread * Math.random(), 0.8 + Math.random() * 0.9, Math.sin(a) * spread * Math.random()).normalize();
      dir.set([d.x, d.y, d.z], i * 3);
      speed[i] = 0.4 + Math.random() * 1.2;
      seed[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aDir', new THREE.BufferAttribute(dir, 3));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uP: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 110 },
      uColor: { value: new THREE.Color(color) },
      uAccent: { value: new THREE.Color(accent ?? color) },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useFrame((s) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uP.value = progress.current ?? 0;
    u.uTime.value = s.clock.elapsedTime;
    u.uSize.value = 110 * s.viewport.dpr;
    (u.uColor.value as THREE.Color).lerp(new THREE.Color(color), 0.1);
    (u.uAccent.value as THREE.Color).lerp(new THREE.Color(accent ?? color), 0.1);
  });

  return (
    <points geometry={geom} position={origin} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} />
    </points>
  );
}
