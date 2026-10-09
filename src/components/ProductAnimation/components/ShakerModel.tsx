import { Component, useMemo, useRef, type ReactNode } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { productAssets, SHAKER } from '../config/assets';
import { useRig } from '../rig';

/**
 * SHAKER BOTTLE — supplied GLB (shaker-bottle.glb)
 * Nodes: `cup` (translucent, moulded measurement marks), `cap` (screw ring),
 * `lid` (flip top). Cap + lid are grouped as one assembly with a pivot on the
 * cup axis so it can be lifted off, set aside and screwed back on.
 * The supplied cap is green; it is recoloured to brand black (keeping its normal map).
 *
 * Children: liquid + powder inside the cup are driven by MixingScene via refs.
 */
export interface ShakerContents {
  liquid: React.RefObject<THREE.Mesh | null>;
  liquidMat: React.RefObject<THREE.MeshPhysicalMaterial | null>;
  liquidTop: React.RefObject<THREE.Mesh | null>;
  powderPile: React.RefObject<THREE.Mesh | null>;
  clumps: React.RefObject<THREE.InstancedMesh | null>;
}

export const CLUMPS = 140;

function useShakerParts(url: string) {
  const { scene } = useGLTF(url, productAssets.draco);
  return useMemo(() => {
    scene.updateMatrixWorld(true);
    const parts: Record<string, THREE.Mesh> = {};
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const key = (m.parent?.name ?? m.name).toLowerCase();
      if (key.includes('cup')) parts.cup = m;
      else if (key.includes('lid')) parts.lid = m;
      else if (key.includes('cap')) parts.cap = m;
    });
    if (!parts.cup || !parts.cap || !parts.lid) throw new Error('shaker-bottle.glb: expected cup / cap / lid nodes');
    const s = SHAKER.scale;
    const geo = (m: THREE.Mesh, pivotY = 0) => {
      const g = m.geometry.clone();
      g.applyMatrix4(m.matrixWorld);
      g.scale(s, s, s);
      g.translate(0, -pivotY, 0);
      g.computeBoundingSphere();
      return g;
    };
    // Cap assembly pivot: bottom of the screw ring (model units 308.27)
    const capPivot = 308.27 * s;
    const src = parts.cup.material as THREE.MeshStandardMaterial;

    // Translucent cup: keep the authored textures (marks, frosting, normal)
    const cupMat = src.clone();
    cupMat.transparent = true;
    cupMat.depthWrite = false;
    cupMat.side = THREE.DoubleSide;
    cupMat.envMapIntensity = 1.3;
    cupMat.opacity = 0.85;

    // Brand-black cap / lid (green in the source)
    const capMat = new THREE.MeshPhysicalMaterial({ color: '#131315', roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.4, normalMap: src.normalMap ?? null });

    return { cup: geo(parts.cup), cap: geo(parts.cap, capPivot), lid: geo(parts.lid, capPivot), capPivot, cupMat, capMat };
  }, [scene]);
}

function Contents({ contents }: { contents: ShakerContents }) {
  const { quality, powderColor } = useRig();
  const clumpGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const pile = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      pts.push(new THREE.Vector2(t * SHAKER.innerBottom * 0.95, Math.cos(t * Math.PI * 0.5) * 0.05));
    }
    return new THREE.LatheGeometry(pts, 48);
  }, []);
  return (
    <group>
      {/* Liquid column: unit height, scaled by MixingScene */}
      <mesh ref={contents.liquid} position={[0, 0.012, 0]} scale={[1, 0.0001, 1]} renderOrder={0}>
        <cylinderGeometry args={[SHAKER.innerTop * 0.97, SHAKER.innerBottom * 0.97, 1, 64, 1, true]} />
        <meshPhysicalMaterial ref={contents.liquidMat} color="#dfe6e8" roughness={0.12} clearcoat={1} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={contents.liquidTop} rotation-x={-Math.PI / 2} position={[0, 0.012, 0]} visible={false}>
        <circleGeometry args={[SHAKER.innerTop * 0.96, 64]} />
        <meshPhysicalMaterial color="#dfe6e8" roughness={0.06} clearcoat={1} transparent opacity={0.7} />
      </mesh>
      {/* Powder settling on the bottom as it lands */}
      <mesh ref={contents.powderPile} geometry={pile} position={[0, 0.012, 0]} scale={[1, 0.0001, 1]}>
        <meshStandardMaterial color={powderColor} roughness={1} />
      </mesh>
      {/* Clumps that dissolve while shaking */}
      <instancedMesh ref={contents.clumps} args={[clumpGeo, undefined, quality === 'high' ? CLUMPS : 50]}>
        <meshStandardMaterial color={powderColor} roughness={1} />
      </instancedMesh>
    </group>
  );
}

function GlbShaker({ url, contents }: { url: string; contents: ShakerContents }) {
  const { shaker, shakerCap } = useRig();
  const p = useShakerParts(url);
  return (
    <group ref={shaker} position={SHAKER.position} rotation-y={-0.5}>
      <Contents contents={contents} />
      <mesh geometry={p.cup} material={p.cupMat} renderOrder={2} />
      <group position={[0, p.capPivot, 0]}>
        <group ref={shakerCap}>
          <mesh geometry={p.cap} material={p.capMat} castShadow />
          <mesh geometry={p.lid} material={p.capMat} castShadow />
        </group>
      </group>
    </group>
  );
}

/** PLACEHOLDER if the shaker GLB fails — same scale and pivots. */
function PlaceholderShaker({ contents }: { contents: ShakerContents }) {
  const { shaker, shakerCap } = useRig();
  return (
    <group ref={shaker} position={SHAKER.position}>
      <Contents contents={contents} />
      <mesh position={[0, SHAKER.cupHeight / 2, 0]}>
        <cylinderGeometry args={[SHAKER.innerTop + 0.006, SHAKER.innerBottom + 0.006, SHAKER.cupHeight, 64, 1, true]} />
        <meshPhysicalMaterial color="#e8eef0" transparent opacity={0.35} roughness={0.2} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <group position={[0, 308.27 * SHAKER.scale, 0]}>
        <group ref={shakerCap}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.15, 0.16, 0.16, 64]} />
            <meshPhysicalMaterial color="#131315" roughness={0.42} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    console.warn('[ProductAnimation] shaker GLB failed — using placeholder geometry', e);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function ShakerModel({ contents }: { contents: ShakerContents }) {
  const { quality } = useRig();
  return (
    <Boundary fallback={<PlaceholderShaker contents={contents} />}>
      <GlbShaker url={quality === 'high' ? productAssets.shaker : productAssets.shakerMobile} contents={contents} />
    </Boundary>
  );
}

/** Convenience: create the refs MixingScene and PourScene share. */
export function useShakerContents(): ShakerContents {
  return {
    liquid: useRef<THREE.Mesh>(null),
    liquidMat: useRef<THREE.MeshPhysicalMaterial>(null),
    liquidTop: useRef<THREE.Mesh>(null),
    powderPile: useRef<THREE.Mesh>(null),
    clumps: useRef<THREE.InstancedMesh>(null),
  };
}
