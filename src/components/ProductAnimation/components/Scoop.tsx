import { useMemo } from 'react';
import * as THREE from 'three';
import { useRig } from '../rig';
import { powderClumpGeometry, usePowderTextures } from './PowderBed';

/**
 * MEASURING SCOOP — modelled on the supplied photo: clear, slightly frosted
 * polypropylene cup with a flat handle, heaped with powder that shows through
 * the walls. Origin = centre of the cup floor; handle along +X.
 * `fillRef` scales (Y) the whole powder load: 0 = empty, 1 = heaped.
 */
const R_TOP = 0.345;
const R_BOT = 0.315;
const H = 0.5;
const WALL = 0.02;

function cupGeometry() {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
  // rounded outer heel
  for (let i = 0; i <= 6; i++) {
    const t = (i / 6) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R_BOT - 0.05 + Math.sin(t) * 0.05, 0.05 - Math.cos(t) * 0.05));
  }
  pts.push(new THREE.Vector2(R_TOP, H - 0.012));
  // rolled lip
  for (let i = 0; i <= 6; i++) {
    const t = (i / 6) * Math.PI;
    pts.push(new THREE.Vector2(R_TOP - WALL / 2 + Math.cos(t) * (WALL / 2 + 0.004), H - 0.012 + Math.sin(t) * 0.012));
  }
  pts.push(new THREE.Vector2(R_BOT - WALL, 0.05 + WALL));
  pts.push(new THREE.Vector2(0, WALL));
  return new THREE.LatheGeometry(pts, 72);
}

function handleGeometry() {
  // Flat bar with a rounded end, joined just under the rim
  const s = new THREE.Shape();
  const L = 0.86;
  const W = 0.065;
  s.moveTo(0, -W);
  s.lineTo(L - W, -W);
  s.absarc(L - W, 0, W, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(0, W);
  s.lineTo(0, -W);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.032, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 3, curveSegments: 24 });
  g.rotateX(Math.PI / 2); // lie flat in XZ
  g.translate(0, 0.016, 0);
  return g;
}

function heapGeometry() {
  // Heaped cone of powder above the rim, irregular like the photo
  // Polar grid so the surface can be displaced
  const rings = 24;
  const segs = 72;
  const verts: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  for (let r = 0; r <= rings; r++) {
    for (let a = 0; a <= segs; a++) {
      const t = r / rings;
      const ang = (a / segs) * Math.PI * 2;
      const rad = t * (R_TOP - WALL * 0.6);
      const x = Math.cos(ang) * rad;
      const z = Math.sin(ang) * rad;
      const n = Math.sin(x * 23 + z * 7) * 0.012 + Math.sin(z * 31 - x * 11 + 1.3) * 0.01 + Math.sin((x - z) * 57) * 0.006;
      const y = (1 - t * t) * 0.2 + n * (1 - t * 0.6);
      verts.push(x, y, z);
      uvs.push(0.5 + x * 1.4, 0.5 + z * 1.4);
    }
  }
  for (let r = 0; r < rings; r++) {
    for (let a = 0; a < segs; a++) {
      const i0 = r * (segs + 1) + a;
      const i1 = i0 + segs + 1;
      idx.push(i0, i1, i0 + 1, i0 + 1, i1, i1 + 1);
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  out.setIndex(idx);
  out.computeVertexNormals();
  return out;
}

export function Scoop({ fillRef }: { fillRef: React.RefObject<THREE.Group | null> }) {
  const { quality } = useRig();
  const cup = useMemo(cupGeometry, []);
  const handle = useMemo(handleGeometry, []);
  const heap = useMemo(heapGeometry, []);
  const clumpGeo = useMemo(powderClumpGeometry, []);
  const [albedo, height] = usePowderTextures(1.6);

  const plastic = useMemo(
    () =>
      quality === 'high'
        ? new THREE.MeshPhysicalMaterial({ color: '#f4f6f7', roughness: 0.22, transmission: 0.92, thickness: 0.04, ior: 1.49, transparent: true, side: THREE.DoubleSide, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 1.2 })
        : new THREE.MeshPhysicalMaterial({ color: '#eef1f2', roughness: 0.25, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false, clearcoat: 0.6 }),
    [quality],
  );

  const clumps = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = i * 2.4 + 0.4;
        const r = 0.06 + (i % 3) * 0.07;
        const s = 0.035 + ((i * 37) % 5) * 0.009;
        return { p: [Math.cos(a) * r, 0.2 * (1 - (r / R_TOP) ** 2) + s * 0.3, Math.sin(a) * r] as [number, number, number], s, rot: i * 1.7 };
      }),
    [],
  );

  return (
    <group>
      {/* Powder load (visible through the clear walls) */}
      <group ref={fillRef}>
        <mesh position={[0, WALL + (H - WALL) / 2 - 0.01, 0]}>
          <cylinderGeometry args={[R_TOP - WALL * 1.6, R_BOT - WALL * 1.6, H - WALL - 0.02, 48, 1, false]} />
          <meshStandardMaterial map={albedo} bumpMap={height} bumpScale={1} roughness={1} />
        </mesh>
        <mesh geometry={heap} position={[0, H - 0.02, 0]}>
          <meshStandardMaterial map={albedo} bumpMap={height} bumpScale={1.1} roughness={1} />
        </mesh>
        {clumps.map((c, i) => (
          <mesh key={i} geometry={clumpGeo} position={[c.p[0], H - 0.02 + c.p[1], c.p[2]]} rotation={[c.rot, c.rot * 1.3, 0]} scale={[c.s, c.s * 0.75, c.s]}>
            <meshStandardMaterial map={albedo} bumpMap={height} bumpScale={1.2} roughness={1} />
          </mesh>
        ))}
      </group>
      <mesh geometry={cup} material={plastic} renderOrder={3} />
      <mesh geometry={handle} material={plastic} position={[R_TOP - 0.03, H - 0.07, 0]} rotation-z={0.3} renderOrder={3} />
    </group>
  );
}
