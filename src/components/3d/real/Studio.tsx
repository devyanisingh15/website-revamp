import { useMemo } from 'react';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { marbleTexture } from './textures';

/**
 * Photographic product lighting, modelled on the reference reel:
 * a big warm window softbox from the side, a cool fill, a hard rim, and a
 * polished marble counter with soft contact shadows. All local — no HDRI download.
 */
export function RealStudio({
  floor = 'dark',
  floorY = -1.6,
  shadow = 0.7,
  warmth = 1,
  floorSize = 14,
  shadowFrames = Infinity,
}: {
  floor?: 'dark' | 'light' | 'none';
  floorY?: number;
  shadow?: number;
  warmth?: number;
  floorSize?: number;
  /** 1 for static scenes (renders the shadow once) */
  shadowFrames?: number;
}) {
  const warm = new THREE.Color('#ffe2bf').lerp(new THREE.Color('#ffffff'), 1 - warmth);
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[-4, 6, 4]} intensity={1.6} color={warm} />
      <directionalLight position={[5, 2, -4]} intensity={0.9} color="#cfe0ff" />
      <Environment resolution={256} frames={1}>
        {/* Window softbox — the long reflection streak down the tub */}
        <Lightformer form="rect" intensity={4} color={warm} position={[-5, 2, 3]} rotation-y={Math.PI / 2.6} scale={[3, 9, 1]} />
        {/* Overhead diffuser */}
        <Lightformer form="rect" intensity={1.6} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[8, 8, 1]} />
        {/* Cool rim from behind-right */}
        <Lightformer form="rect" intensity={2.4} color="#dfe8ff" position={[5, 1, -3]} rotation-y={-Math.PI / 3} scale={[1.2, 8, 1]} />
        {/* Front bounce card */}
        <Lightformer form="rect" intensity={0.8} position={[0, 0, 6]} scale={[6, 3, 1]} />
        {/* Faint ground bounce */}
        <Lightformer form="circle" intensity={0.5} color="#f3ece2" position={[0, -4, 1]} rotation-x={-Math.PI / 2} scale={6} />
      </Environment>
      {floor !== 'none' && <MarbleFloor dark={floor === 'dark'} y={floorY} size={floorSize} />}
      <ContactShadows position={[0, floorY + 0.005, 0]} opacity={shadow} scale={8} blur={2.6} far={4} resolution={512} frames={shadowFrames} color="#000000" />
    </>
  );
}

/** Polished stone disc whose edge fades out, so it sits on any page background. */
function MarbleFloor({ dark, y, size }: { dark: boolean; y: number; size: number }) {
  const map = useMemo(() => {
    const t = marbleTexture(dark).clone();
    t.repeat.set(1.6, 1.6);
    t.needsUpdate = true;
    return t;
  }, [dark]);
  const alpha = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(128, 128, 30, 128, 128, 128);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.55, '#aaa');
    grad.addColorStop(1, '#000');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh position={[0, y, 0]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[size / 2, 96]} />
      <meshPhysicalMaterial map={map} alphaMap={alpha} transparent roughness={dark ? 0.42 : 0.28} metalness={0} clearcoat={dark ? 0.35 : 0.8} clearcoatRoughness={dark ? 0.3 : 0.12} envMapIntensity={dark ? 0.35 : 1} depthWrite={false} />
    </mesh>
  );
}
