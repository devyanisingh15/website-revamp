import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONTAINER } from '../config/assets';
import { useRig } from '../rig';
import { powderBump } from '@/components/3d/real/textures';

/**
 * PROCEDURAL POWDER BED (the supplied powder GLB has no usable powder geometry)
 * A polar-grid surface with granular relief, colour variation and a crater that
 * deepens where the scoop digs — plus instanced granules for the macro shot.
 * Reads as granular powder (not smoke) under shallow depth of field.
 */
const RADIUS = 0.214;
export const SCOOP_SPOT = new THREE.Vector2(0.035, 0.02); // where the scoop digs (x, z)

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/** Surface height (metres, relative to powderY) */
export function powderHeight(x: number, z: number, crater: number) {
  const r = Math.hypot(x, z) / RADIUS;
  const heap = 0.012 * (1 - r * r); // gentle mound settled in the tub
  // low/mid-frequency relief only — fine grain comes from the bump map + granules (avoids aliasing)
  const lumps = (vnoise(x * 38, z * 38) - 0.5) * 0.007 + (vnoise(x * 85 + 3.1, z * 85 - 1.7) - 0.5) * 0.0022;
  const d = Math.hypot(x - SCOOP_SPOT.x, z - SCOOP_SPOT.y);
  const hole = crater * 0.032 * Math.exp(-(d * d) / (2 * 0.032 * 0.032));
  const rim = crater * 0.006 * Math.exp(-((d - 0.06) ** 2) / (2 * 0.012 * 0.012));
  return heap + lumps - hole + rim;
}

export function PowderBed() {
  const { quality, crater, powderColor, progress } = useRig();
  const mesh = useRef<THREE.Mesh>(null);
  const lastCrater = useRef(-1);

  // Regular grid clipped to a circle (a polar grid aliases into radial streaks).
  // The ragged clip edge sits under the jar shoulder, out of view.
  const geom = useMemo(() => {
    const n = quality === 'high' ? 200 : 90;
    const pos: number[] = [];
    const uv: number[] = [];
    const col: number[] = [];
    const id = new Int32Array((n + 1) * (n + 1)).fill(-1);
    let k = 0;
    for (let iy = 0; iy <= n; iy++) {
      for (let ix = 0; ix <= n; ix++) {
        const x = (ix / n - 0.5) * 2 * (RADIUS + 0.01);
        const z = (iy / n - 0.5) * 2 * (RADIUS + 0.01);
        if (Math.hypot(x, z) > RADIUS + 0.012) continue;
        id[iy * (n + 1) + ix] = k++;
        pos.push(x, 0, z);
        uv.push(0.5 + x / (2 * RADIUS), 0.5 + z / (2 * RADIUS));
        const shade = 0.88 + hash(x * 900, z * 900) * 0.18;
        col.push(shade, shade, shade);
      }
    }
    const idx: number[] = [];
    for (let iy = 0; iy < n; iy++) {
      for (let ix = 0; ix < n; ix++) {
        const a = id[iy * (n + 1) + ix];
        const b = id[iy * (n + 1) + ix + 1];
        const c = id[(iy + 1) * (n + 1) + ix];
        const d = id[(iy + 1) * (n + 1) + ix + 1];
        if (a < 0 || b < 0 || c < 0 || d < 0) continue;
        idx.push(a, c, b, b, c, d);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    return g;
  }, [quality]);

  const bump = useMemo(() => {
    const t = powderBump().clone();
    t.repeat.set(10, 10);
    t.needsUpdate = true;
    return t;
  }, []);

  const relief = (c: number) => {
    const pos = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, powderHeight(pos.getX(i), pos.getZ(i), c));
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  };
  useEffect(() => relief(0), [geom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Granules scattered over the surface — what sells "powder" in the macro shot
  const granuleCount = quality === 'high' ? 2600 : 500;
  const granules = useRef<THREE.InstancedMesh>(null);
  const granuleData = useMemo(
    () =>
      Array.from({ length: granuleCount }, (_, i) => {
        const r = Math.sqrt(hash(i, 1.7)) * RADIUS * 0.97;
        const a = hash(i, 9.3) * Math.PI * 2;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.0008 + hash(i, 4.1) ** 3 * 0.0022, rot: hash(i, 2.2) * 6, tint: 0.82 + hash(i, 6.6) * 0.3 };
      }),
    [granuleCount],
  );
  const placeGranules = (c: number) => {
    const im = granules.current;
    if (!im) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const col = new THREE.Color();
    granuleData.forEach((g, i) => {
      e.set(g.rot, g.rot * 1.3, g.rot * 0.7);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(g.x, powderHeight(g.x, g.z, c) + g.s * 0.4, g.z), q, new THREE.Vector3(g.s, g.s * 0.8, g.s));
      im.setMatrixAt(i, m);
      im.setColorAt(i, col.setScalar(g.tint));
    });
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
  };
  useEffect(() => placeGranules(0), [granuleData]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    const c = crater.current ?? 0;
    if (Math.abs(c - lastCrater.current) > 0.01) {
      lastCrater.current = c;
      relief(c);
      placeGranules(c);
    }
    // Only visible once the cap is off (saves fill-rate the rest of the time)
    if (mesh.current) mesh.current.parent!.visible = (progress.current ?? 0) > 0.3 && (progress.current ?? 0) < 0.8;
  });

  const granuleGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  return (
    <group position={[0, CONTAINER.powderY, 0]}>
      <mesh ref={mesh} geometry={geom} receiveShadow>
        <meshStandardMaterial color={powderColor} vertexColors roughness={1} bumpMap={bump} bumpScale={1.4} />
      </mesh>
      <instancedMesh ref={granules} args={[granuleGeo, undefined, granuleCount]}>
        <meshStandardMaterial color={powderColor} roughness={0.95} flatShading />
      </instancedMesh>
    </group>
  );
}
