import { Component, Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { productAssets, CONTAINER, LABEL_SLEEVE } from '../config/assets';
import { useRig } from '../rig';
import { plasticRoughness, powderBump } from '@/components/3d/real/textures';

/**
 * PROTEIN CONTAINER — supplied GLB (protein-container.glb)
 * The source jar is offset from the origin and its cap is a separate mesh, so
 * we bake each mesh's world transform into its geometry, re-centre it, and give
 * the cap its own pivot on the jar axis (for the unscrew).
 * The jar has no textures, so the printed label is a thin sleeve fitted to the
 * straight wall (measured: r 0.2522, y 0.12–0.57) — no stretching, seam at the back.
 */

function bake(mesh: THREE.Mesh, offset: THREE.Vector3) {
  const g = mesh.geometry.clone();
  g.applyMatrix4(mesh.matrixWorld);
  g.translate(-offset.x, -offset.y, -offset.z);
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

function useContainerGeometry(url: string) {
  const { scene } = useGLTF(url, productAssets.draco);
  return useMemo(() => {
    scene.updateMatrixWorld(true);
    let body: THREE.Mesh | null = null;
    let cap: THREE.Mesh | null = null;
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      if (/Cylinder002|Material_?#?3/.test(m.name + m.parent?.name)) cap = m;
      else body = m;
    });
    if (!body || !cap) throw new Error('protein-container.glb: expected a body mesh and a separate cap mesh');
    const c = new THREE.Vector3(CONTAINER.centre.x, 0, CONTAINER.centre.z);
    return {
      body: bake(body, c),
      // cap pivot = bottom of the cap on the jar axis
      cap: bake(cap, new THREE.Vector3(c.x, CONTAINER.cap.bottom, c.z)),
    };
  }, [scene]);
}

/** Printed shrink-sleeve label with print grain, sharp at close range. */
function LabelSleeve() {
  const { quality } = useRig();
  const map = useTexture(quality === 'high' ? productAssets.label : productAssets.labelMobile);
  const bump = useMemo(() => {
    const t = powderBump().clone();
    t.repeat.set(24, 6);
    t.needsUpdate = true;
    return t;
  }, []);
  useEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = THREE.RepeatWrapping;
    map.offset.x = 0.5; // artwork centre faces +Z (camera front)
    map.anisotropy = 16;
    map.generateMipmaps = true;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.needsUpdate = true;
  }, [map]);
  const h = LABEL_SLEEVE.top - LABEL_SLEEVE.bottom;
  return (
    <mesh position={[0, LABEL_SLEEVE.bottom + h / 2, 0]} renderOrder={1}>
      <cylinderGeometry args={[LABEL_SLEEVE.radius, LABEL_SLEEVE.radius, h, 256, 1, true]} />
      <meshPhysicalMaterial map={map} roughness={0.4} metalness={0} clearcoat={0.45} clearcoatRoughness={0.35} bumpMap={bump} bumpScale={0.15} specularIntensity={0.6} />
    </mesh>
  );
}

/** Red foil shrink-wrap and printed top on the cap (reference: mockup's red cap). */
function CapDressing() {
  const [side, top] = useTexture([productAssets.capLabel, productAssets.capTop]);
  useEffect(() => {
    for (const t of [side, top]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
    side.wrapS = THREE.RepeatWrapping;
    side.offset.x = 0.5;
    top.center.set(0.5, 0.5);
    top.rotation = Math.PI;
  }, [side, top]);
  const r = CONTAINER.cap.radius;
  const h = CONTAINER.cap.top - CONTAINER.cap.bottom;
  return (
    <>
      <mesh position={[0, h * 0.48, 0]}>
        <cylinderGeometry args={[r + 0.0022, r + 0.0022, h * 0.78, 192, 1, true]} />
        <meshPhysicalMaterial map={side} transparent alphaTest={0.02} roughness={0.3} metalness={0.2} clearcoat={1} />
      </mesh>
      <mesh position={[0, h + 0.0006, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[r * 0.94, 96]} />
        <meshPhysicalMaterial map={top} roughness={0.3} metalness={0.25} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
    </>
  );
}

function GlbContainer({ url }: { url: string }) {
  const { jar, jarCap } = useRig();
  const geo = useContainerGeometry(url);
  const rough = useMemo(() => {
    const t = plasticRoughness().clone();
    t.repeat.set(10, 10);
    t.needsUpdate = true;
    return t;
  }, []);
  return (
    <group ref={jar}>
      {/* Matte black plastic — not metallic; faint clearcoat for edge highlights */}
      <mesh geometry={geo.body} castShadow receiveShadow>
        <meshPhysicalMaterial color="#0c0c0d" roughness={0.58} roughnessMap={rough} metalness={0} clearcoat={0.18} clearcoatRoughness={0.55} specularIntensity={0.5} />
      </mesh>
      <Suspense fallback={null}>
        <LabelSleeve />
      </Suspense>
      <group position={[0, CONTAINER.cap.bottom, 0]}>
        <group ref={jarCap}>
          {/* Cap: glossier foil than the body so it reads as a separate part */}
          <mesh geometry={geo.cap} castShadow>
            <meshPhysicalMaterial color="#a50f18" roughness={0.26} metalness={0.3} clearcoat={1} clearcoatRoughness={0.12} />
          </mesh>
          <Suspense fallback={null}>
            <CapDressing />
          </Suspense>
        </group>
      </group>
    </group>
  );
}

/**
 * PLACEHOLDER — used only if the GLB fails to load. Same dimensions and pivots
 * as the supplied jar so the animation is unchanged. Replace by fixing
 * productAssets.container; do not design around this.
 */
function PlaceholderContainer() {
  const { jar, jarCap } = useRig();
  const body = useMemo(() => {
    const R = CONTAINER.bodyRadius;
    const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(R - 0.04, 0), new THREE.Vector2(R, 0.05), new THREE.Vector2(R, CONTAINER.wallTop), new THREE.Vector2(CONTAINER.neckRadius, 0.7), new THREE.Vector2(CONTAINER.neckRadius, CONTAINER.height)];
    return new THREE.LatheGeometry(pts, 96);
  }, []);
  return (
    <group ref={jar}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#0c0c0d" roughness={0.58} />
      </mesh>
      <Suspense fallback={null}>
        <LabelSleeve />
      </Suspense>
      <group position={[0, CONTAINER.cap.bottom, 0]}>
        <group ref={jarCap}>
          <mesh position={[0, (CONTAINER.cap.top - CONTAINER.cap.bottom) / 2, 0]}>
            <cylinderGeometry args={[CONTAINER.cap.radius, CONTAINER.cap.radius, CONTAINER.cap.top - CONTAINER.cap.bottom, 96]} />
            <meshPhysicalMaterial color="#a50f18" roughness={0.26} clearcoat={1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

class GlbBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    console.warn('[ProductAnimation] container GLB failed — using placeholder geometry', e);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function ProductModel() {
  const { quality } = useRig();
  return (
    <GlbBoundary fallback={<PlaceholderContainer />}>
      <GlbContainer url={quality === 'high' ? productAssets.container : productAssets.containerMobile} />
    </GlbBoundary>
  );
}
