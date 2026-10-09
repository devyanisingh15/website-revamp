import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor, Preload, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { RigProvider, type Quality, type Rig } from './rig';
import { productAssets } from './config/assets';
import { CinematicCamera } from './components/CinematicCamera';
import { ProductLighting } from './components/ProductLighting';
import { Effects } from './components/Effects';
import { IntroScene } from './scenes/IntroScene';
import { ProductReveal } from './scenes/ProductReveal';
import { ProductInteraction } from './scenes/ProductInteraction';
import { PowderScene } from './scenes/PowderScene';
import { PourScene } from './scenes/PourScene';
import { MixingScene } from './scenes/MixingScene';
import { HeroProductScene } from './scenes/HeroProductScene';

/**
 * The WebGL side of the product animation (loaded lazily, never in the
 * initial bundle). One persistent scene: all eight beats share the same set,
 * lights and camera, so the sequence plays as one continuous take.
 */
export interface CanvasProps {
  progress: React.RefObject<number>;
  quality: Quality;
  reduced: boolean;
  powderColor: string;
  active: boolean;
  onReady: () => void;
  onPoorPerformance: () => void;
}

/** QA: ?pa-nofallback keeps the live 3D even on very slow (e.g. software) renderers */
const NO_FALLBACK = typeof location !== 'undefined' && new URLSearchParams(location.search).has('pa-nofallback');

function Ready({ onReady }: { onReady: () => void }) {
  const n = useRef(0);
  useFrame(() => {
    if (++n.current === 3) onReady();
  });
  return null;
}

export default function ProductAnimationCanvas({ progress, quality, reduced, powderColor, active, onReady, onPoorPerformance }: CanvasProps) {
  const [dpr, setDpr] = useState(quality === 'high' ? 1.5 : 1.25);
  const [effects, setEffects] = useState(true);
  const declines = useRef(0);

  const rig = useMemo<Rig>(
    () => ({
      progress,
      quality,
      reduced,
      powderColor,
      jar: { current: null },
      jarCap: { current: null },
      shaker: { current: null },
      shakerCap: { current: null },
      scoop: { current: null },
      scoopMound: { current: null },
      focus: new THREE.Vector3(0, 0.4, 0),
      bokeh: { current: 0 },
      crater: { current: 0 },
    }),
    [progress, quality, reduced, powderColor],
  );

  // Warm the cache for the heavier shaker as soon as the canvas mounts
  useEffect(() => {
    useGLTF.preload(quality === 'high' ? productAssets.shaker : productAssets.shakerMobile, productAssets.draco);
    useTexture.preload(quality === 'high' ? productAssets.label : productAssets.labelMobile);
  }, [quality]);

  return (
    <Canvas
      className="pa-canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, dpr]}
      camera={{ position: [0, 0.42, 3.6], fov: 28, near: 0.01, far: 30 }}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false, alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NoToneMapping; // ACES applied in the post chain
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <color attach="background" args={['#060607']} />
      <fog attach="fog" args={['#060607', 3.2, 7]} />
      <RigProvider value={rig}>
        {/* Adaptive quality: drop DPR, then effects; if still struggling, hand over to the poster/video */}
        <PerformanceMonitor
          bounds={() => [24, 50]}
          flipflops={6}
          onDecline={() => {
            declines.current++;
            if (declines.current === 1) setDpr(1);
            else if (declines.current === 2) setEffects(false);
            // Only hand over to the poster/video after sustained very low frame rates
            else if (declines.current >= 5 && !NO_FALLBACK) onPoorPerformance();
          }}
        >
          <CinematicCamera />
          <Suspense fallback={null}>
            <ProductLighting />
            <IntroScene />
            <ProductReveal />
            <ProductInteraction />
            <PowderScene />
            <PourScene />
            <MixingScene />
            <HeroProductScene />
            {effects && <Effects />}
            <Ready onReady={onReady} />
            <Preload all />
          </Suspense>
        </PerformanceMonitor>
      </RigProvider>
    </Canvas>
  );
}
