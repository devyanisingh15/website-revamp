/**
 * DEV-ONLY GLB inspector: /glb-viewer.html?src=/assets/x.glb&angle=0&elev=0.25
 * Renders the model auto-framed and exposes window.__info with node hierarchy,
 * world bounding boxes, materials and UV presence (used to plan the animation).
 */
import { createRoot } from 'react-dom/client';
import { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const q = new URLSearchParams(location.search);
const src = q.get('src') ?? '/assets/protein-container.glb';
const angle = Number(q.get('angle') ?? 0.6);
const elev = Number(q.get('elev') ?? 0.25);

function Model() {
  const { scene } = useGLTF(src, '/draco/');
  const { camera } = useThree();
  useEffect(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const r = size.length() * 1.7;
    camera.position.set(center.x + Math.sin(angle) * r, center.y + r * elev, center.z + Math.cos(angle) * r);
    camera.lookAt(center);
    (camera as THREE.PerspectiveCamera).near = r / 100;
    (camera as THREE.PerspectiveCamera).far = r * 10;
    camera.updateProjectionMatrix();
    const nodes: unknown[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const b = new THREE.Box3().setFromObject(m);
      const mat = m.material as THREE.MeshStandardMaterial;
      nodes.push({
        name: m.name,
        parent: m.parent?.name,
        tris: (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3,
        min: b.min.toArray().map((v) => +v.toFixed(4)),
        max: b.max.toArray().map((v) => +v.toFixed(4)),
        material: { name: mat.name, color: '#' + mat.color?.getHexString(), rough: mat.roughness, metal: mat.metalness, map: !!mat.map, transparent: mat.transparent, opacity: mat.opacity },
        uv: !!m.geometry.attributes.uv,
      });
    });
    // Radius profile per height band (world units, about the bbox centre axis)
    const bands = 40;
    const prof = new Array(bands).fill(0);
    const v = new THREE.Vector3();
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || !/Cylinder001|cup/.test(m.name + (m.parent?.name ?? ''))) return;
      const pos = m.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
        const b = Math.min(bands - 1, Math.floor(((v.y - box.min.y) / size.y) * bands));
        prof[b] = Math.max(prof[b], Math.hypot(v.x - center.x, v.z - center.z));
      }
    });
    (window as unknown as { __info: unknown }).__info = {
      profile: prof.map((r: number, i: number) => [+(box.min.y + ((i + 0.5) / bands) * size.y).toFixed(4), +r.toFixed(4)]), size: size.toArray(), center: center.toArray(), min: box.min.toArray(), max: box.max.toArray(), nodes };
    setTimeout(() => ((window as unknown as { __ready: boolean }).__ready = true), 800);
  }, [scene, camera]);
  return <primitive object={scene} />;
}

createRoot(document.getElementById('root')!).render(
  <Canvas camera={{ fov: 30 }} gl={{ preserveDrawingBuffer: true }}>
    <color attach="background" args={['#2a2a2e']} />
    <ambientLight intensity={0.4} />
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={3} position={[-5, 3, 4]} scale={[4, 8, 1]} />
      <Lightformer form="rect" intensity={1.5} position={[5, 2, -3]} scale={[2, 8, 1]} />
      <Lightformer form="rect" intensity={1} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[6, 6, 1]} />
    </Environment>
    <Suspense fallback={null}>
      <Model />
    </Suspense>
  </Canvas>,
);
