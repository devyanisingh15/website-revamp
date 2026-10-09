import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { productAssets } from '../config/assets';
import { useRig } from '../rig';
import { ease } from '../config/timeline';
import { MarbleFloor } from '@/components/3d/real/Studio';

/**
 * PRODUCT LIGHTING — one consistent studio rig for every scene.
 *  - HDRI environment (studio_small_03, CC0) for real reflections; Lightformers
 *    add the large window-style key, fill and rim on top of it.
 *  - Key / fill / rim direct lights.
 *  - Polished dark stone counter + soft contact shadows.
 * Light level follows the story: black intro → lit reveal → fade-out outro.
 * Mobile: no HDRI download, Lightformers only, cheaper shadows.
 */
export function ProductLighting() {
  const { quality, progress, reduced } = useRig();
  const scene = useThree((s) => s.scene);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.SpotLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const p = reduced ? 0.9 : progress.current ?? 0;
    // Story lighting: rises out of black, macro gets a touch more key, fades at the end
    const level = ease(p, 0.05, 0.17) * (1 - ease(p, 0.955, 1)) + (reduced ? 1 : 0) * 0;
    const macro = ease(p, 0.4, 0.46) * (1 - ease(p, 0.55, 0.6));
    (scene as unknown as { environmentIntensity: number }).environmentIntensity = 0.02 + level * (0.75 + macro * 0.25);
    if (key.current) key.current.intensity = level * (2.2 + macro * 0.8);
    if (fill.current) fill.current.intensity = level * 0.35;
    // Rim comes in first, so the silhouette appears before the front (reveal)
    if (rim.current) rim.current.intensity = ease(p, 0.04, 0.12) * (1 - ease(p, 0.95, 1)) * 28;
  });

  return (
    <>
      <Environment files={quality === 'high' ? productAssets.environment : undefined} resolution={quality === 'high' ? 512 : 128} frames={1} environmentIntensity={0.8}>
        {/* Large soft key (window softbox) — the long streak down the jar */}
        <Lightformer form="rect" intensity={quality === 'high' ? 2.2 : 3.2} color="#fff1e2" position={[-3.2, 2.2, 2.4]} rotation-y={Math.PI / 3.2} scale={[2.2, 4.5, 1]} />
        {/* Overhead diffusion */}
        <Lightformer form="rect" intensity={0.8} position={[0, 4, 0.5]} rotation-x={Math.PI / 2} scale={[4, 3, 1]} />
        {/* Thin cool rim strips behind */}
        <Lightformer form="rect" intensity={2.4} color="#dfe8ff" position={[2.6, 1.2, -2]} rotation-y={-Math.PI / 4} scale={[0.35, 4, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#dfe8ff" position={[-2.4, 1.2, -2.2]} rotation-y={Math.PI / 4} scale={[0.3, 4, 1]} />
      </Environment>
      <directionalLight ref={key} position={[-2.2, 3.2, 2.6]} intensity={0} color="#fff3e6" />
      <directionalLight ref={fill} position={[2.4, 1, 2.8]} intensity={0} color="#e9eef7" />
      <spotLight ref={rim} position={[1.2, 1.6, -2.2]} angle={0.5} penumbra={0.9} intensity={0} color="#e6eeff" distance={8} decay={2} target-position={[0.2, 0.4, 0]} />
      <MarbleFloor dark y={0} size={7} />
      <ContactShadows position={[0, 0.001, 0]} scale={3} opacity={0.75} blur={2.4} far={1.2} resolution={quality === 'high' ? 1024 : 256} frames={reduced ? 1 : Infinity} />
    </>
  );
}
