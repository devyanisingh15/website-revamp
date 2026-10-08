/**
 * DEV-ONLY packshot renderer (not part of the production build).
 * /packshot.html?product=<id>&flavour=<id>&size=<label>&angle=<rad>&floor=none|dark|light
 * Used by scripts/render-packshots.mjs to produce public/packshots/*.webp,
 * and handy for inspecting the realistic models in isolation.
 */
import { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import { getProduct } from '@/data/products';
import { packSpec } from '@/components/3d/real/spec';
import { PackModel } from '@/components/3d/real/models';
import { RealStudio } from '@/components/3d/real/Studio';

const q = new URLSearchParams(location.search);
const product = getProduct(q.get('product') ?? 'biozyme-performance-whey')!;
const flavour = product.flavours.find((f) => f.id === q.get('flavour')) ?? product.flavours[0];
const size = q.get('size') ?? undefined;
const angle = Number(q.get('angle') ?? -0.35);
const floor = (q.get('floor') ?? 'none') as 'none' | 'dark' | 'light';
const spec = packSpec(product, flavour, size);

// Frame each pack kind
const FRAME: Record<string, { z: number; y: number; floorY: number; tilt?: number }> = {
  tub: { z: 9.4, y: 0.15, floorY: -1.53 },
  jar: { z: 7.2, y: 0.1, floorY: -1.03 },
  pouch: { z: 8.6, y: 0.1, floorY: -1.43 },
  sachet: { z: 6.4, y: 0.05, floorY: -0.96 },
  bottle: { z: 6.6, y: 0.05, floorY: -1.07 },
  bar: { z: 8, y: 0, floorY: -0.8 },
  shaker: { z: 8.4, y: 0.1, floorY: -1.3 },
};
const fr = FRAME[spec.kind];
if (spec.kind === 'tub' && spec.dims && spec.dims.radius > 1.05) fr.z = 10.4;

function Ready() {
  const n = useRef(0);
  const { gl } = useThree();
  useFrame(() => {
    n.current++;
    if (n.current === 30) document.fonts.ready.then(() => setTimeout(() => ((window as unknown as { __ready: boolean }).__ready = true), 300));
  });
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [gl]);
  return null;
}

function App() {
  return (
    <Canvas dpr={1} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} camera={{ position: [0, fr.y + 0.6, fr.z], fov: 24 }} onCreated={({ camera }) => camera.lookAt(0, fr.y - 0.1, 0)}>
      <RealStudio floor={floor} floorY={fr.floorY} shadow={0.55} shadowFrames={floor === 'none' ? 40 : Infinity} />
      <group rotation-y={angle}>
        <PackModel spec={spec} />
      </group>
      <Ready />
    </Canvas>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
