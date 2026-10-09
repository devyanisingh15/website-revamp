import { forwardRef, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { drawWrapLabel, drawPouchFront, drawPouchBack, drawBottleLabel, drawBarWrapper, drawShakerWrap } from './labelArt';
import { canvasToTexture, capEmboss, plasticRoughness, powderBump } from './textures';
import type { PackSpec, TubDims } from './spec';

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */
export function useFontsReady() {
  const [ready, setReady] = useState(() => typeof document !== 'undefined' && document.fonts?.status === 'loaded');
  useEffect(() => {
    if (ready) return;
    let alive = true;
    document.fonts?.ready.then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [ready]);
  return ready;
}

/** Builds a texture from a canvas factory; rebuilt when `key` or fonts change. */
function useCanvasTexture(key: string, make: () => HTMLCanvasElement, wrap = true, offsetHalf = true) {
  const fonts = useFontsReady();
  const tex = useMemo(() => canvasToTexture(make(), wrap, offsetHalf), [key, fonts]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

/* ------------------------------------------------------------------ */
/* Tub / jar — lathe-turned body, knurled screw cap, shrink-sleeve label */
/* ------------------------------------------------------------------ */
export function tubMetrics(d: TubDims) {
  const neckR = d.radius * d.neck;
  const labelBottom = 0.1;
  const labelTop = d.height - d.shoulder - 0.03;
  const total = d.height + 0.14 + d.capH;
  return { neckR, labelBottom, labelTop, total, capR: neckR + 0.045, yOffset: -total / 2 };
}

function tubProfile(d: TubDims) {
  const R = d.radius;
  const { neckR } = tubMetrics(d);
  const pts: THREE.Vector2[] = [];
  const cr = 0.14; // bottom corner radius
  pts.push(new THREE.Vector2(0, 0.012));
  pts.push(new THREE.Vector2(R - cr - 0.05, 0));
  for (let i = 0; i <= 10; i++) {
    const t = (i / 10) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R - cr + Math.sin(t) * cr, cr - Math.cos(t) * cr));
  }
  // Very slight barrel on the wall
  for (let i = 1; i <= 12; i++) {
    const y = cr + ((d.height - d.shoulder - cr) * i) / 12;
    const k = i / 12;
    pts.push(new THREE.Vector2(R + Math.sin(k * Math.PI) * 0.003, y));
  }
  // Rounded shoulder (quarter super-ellipse)
  for (let i = 1; i <= 24; i++) {
    const t = (i / 24) * (Math.PI / 2);
    const r = neckR + (R - neckR) * Math.pow(Math.cos(t), 0.75);
    const y = d.height - d.shoulder + d.shoulder * Math.pow(Math.sin(t), 1.15);
    pts.push(new THREE.Vector2(r, y));
  }
  // Neck with thread lip, then the inner wall so an open tub reads as hollow
  pts.push(new THREE.Vector2(neckR, d.height + 0.02));
  pts.push(new THREE.Vector2(neckR + 0.02, d.height + 0.05));
  pts.push(new THREE.Vector2(neckR, d.height + 0.08));
  pts.push(new THREE.Vector2(neckR, d.height + 0.14));
  pts.push(new THREE.Vector2(neckR - 0.04, d.height + 0.14));
  pts.push(new THREE.Vector2(neckR - 0.04, d.height - 0.3));
  return pts;
}

function knurledCap(radius: number, height: number) {
  const seg = 240;
  const g = new THREE.CylinderGeometry(radius, radius, height, seg, 6, false);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    if (r < radius * 0.98) continue; // top/bottom centre verts
    const a = Math.atan2(v.z, v.x);
    const yN = v.y / height + 0.5; // 0..1
    // Knurl ribs over the grip band; smooth chamfered band at top like the reference cap
    const inGrip = yN < 0.72;
    const rib = inGrip ? Math.cos(a * 180) * 0.0035 : 0;
    const chamfer = yN > 0.9 ? -(yN - 0.9) * 0.35 : 0;
    const band = yN > 0.72 && yN < 0.78 ? 0.008 : 0;
    const nr = r + rib + chamfer + band;
    pos.setXYZ(i, Math.cos(a) * nr, v.y, Math.sin(a) * nr);
  }
  g.computeVertexNormals();
  return g;
}

function PowderSurface({ radius, color }: { radius: number; color: string }) {
  const geom = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const r = (i / 24) * radius;
      const y = 0.035 * Math.cos((i / 24) * Math.PI * 0.5) + Math.sin(i * 1.7) * 0.006;
      pts.push(new THREE.Vector2(r, y));
    }
    const g = new THREE.LatheGeometry(pts, 96);
    // irregular surface
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, pos.getY(i) + Math.sin(x * 23 + z * 7) * 0.008 + Math.cos(z * 19 - x * 5) * 0.008);
    }
    g.computeVertexNormals();
    return g;
  }, [radius]);
  const bump = useMemo(() => {
    const t = powderBump().clone();
    t.repeat.set(4, 4);
    t.needsUpdate = true;
    return t;
  }, []);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color={color} roughness={1} bumpMap={bump} bumpScale={1.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

export interface TubModelProps {
  spec: PackSpec;
  /** Group that holds the cap (unscrew animation) */
  capRef?: React.RefObject<THREE.Group | null>;
  /** Show the powder surface inside the neck */
  showPowder?: boolean;
  /** Half-resolution artwork for scenes with many packs */
  lite?: boolean;
  children?: ReactNode;
}

export const TubModel = forwardRef<THREE.Group, TubModelProps>(function TubModel({ spec, capRef, showPowder, lite, children }, ref) {
  const d = spec.dims!;
  const m = tubMetrics(d);
  const body = useMemo(() => new THREE.LatheGeometry(tubProfile(d), 160), [d]);
  const cap = useMemo(() => knurledCap(m.capR, d.capH), [m.capR, d.capH]);
  const rough = useMemo(() => plasticRoughness(), []);
  const fonts = useFontsReady();
  const emboss = useMemo(() => capEmboss(spec.cap + (fonts ? 'f' : '')), [spec.cap, fonts]);
  const labelKey = JSON.stringify(spec.wrap) + (lite ? 'lite' : '');
  const label = useCanvasTexture(labelKey, () => drawWrapLabel(spec.wrap!, lite ? 0.45 : 1));
  const labelH = m.labelTop - m.labelBottom;

  return (
    <group ref={ref} position={[0, m.yOffset, 0]}>
      <mesh geometry={body} castShadow>
        <meshPhysicalMaterial color={spec.body} metalness={0.42} roughness={0.42} roughnessMap={rough} clearcoat={0.45} clearcoatRoughness={0.3} side={THREE.DoubleSide} envMapIntensity={1} />
      </mesh>
      {/* Shrink-sleeve label */}
      <mesh position={[0, m.labelBottom + labelH / 2, 0]}>
        <cylinderGeometry args={[d.radius + 0.014, d.radius + 0.014, labelH, 160, 1, true]} />
        <meshPhysicalMaterial map={label} roughness={0.42} metalness={0.05} clearcoat={0.35} clearcoatRoughness={0.3} />
      </mesh>
      {showPowder && (
        <group position={[0, d.height + 0.02, 0]}>
          <PowderSurface radius={m.neckR - 0.045} color={spec.powder} />
        </group>
      )}
      {/* Cap */}
      <group position={[0, d.height + 0.14 + d.capH / 2 - 0.06, 0]}>
        <group ref={capRef}>
          <mesh geometry={cap}>
            <meshPhysicalMaterial color={spec.cap} metalness={0.45} roughness={0.38} clearcoat={0.5} clearcoatRoughness={0.25} />
          </mesh>
          <mesh position={[0, d.capH / 2 + 0.001, 0]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[m.capR * 0.93, 96]} />
            <meshPhysicalMaterial color={spec.cap} map={emboss} bumpMap={emboss} bumpScale={1.5} metalness={0.4} roughness={0.42} clearcoat={0.4} clearcoatRoughness={0.3} />
          </mesh>
          <mesh position={[0, -d.capH / 2 + 0.002, 0]} rotation-x={Math.PI / 2}>
            <ringGeometry args={[m.neckR - 0.05, m.capR - 0.01, 96]} />
            <meshStandardMaterial color="#1a1a1c" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
      {children}
    </group>
  );
});

/* ------------------------------------------------------------------ */
/* Stand-up pouch / sachet — pillowed front & back panels              */
/* ------------------------------------------------------------------ */
function pouchPanel(w: number, h: number, depth: number, side: 1 | -1, gusset: number) {
  const g = new THREE.PlaneGeometry(w, h, 48, 72);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const u = x / w + 0.5;
    const v = y / h + 0.5;
    const across = Math.pow(Math.sin(Math.PI * THREE.MathUtils.clamp(u, 0, 1)), 0.55);
    // top seal stays flat; body bulges; bottom flares into the gusset
    const top = v > 0.92 ? 0 : THREE.MathUtils.smoothstep(0.92 - v, 0, 0.18);
    const bottom = gusset * Math.pow(1 - v, 3);
    let z = depth * across * top + bottom * across;
    // soft wrinkles near the seals
    z += (Math.sin(u * 40 + v * 9) * 0.004 + Math.sin(v * 55) * 0.003) * (1 - top * 0.8);
    // side seams pinch slightly inward
    const xi = x * (1 - 0.02 * (1 - across));
    pos.setXYZ(i, xi, y, z * side);
  }
  g.computeVertexNormals();
  if (side === -1) {
    // flip winding so the back faces outward, and mirror UVs so artwork reads correctly
    const idx = g.index!;
    for (let i = 0; i < idx.count; i += 3) {
      const a = idx.getX(i + 1);
      idx.setX(i + 1, idx.getX(i + 2));
      idx.setX(i + 2, a);
    }
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    g.computeVertexNormals();
  }
  return g;
}

export function PouchModel({ spec, small = false, lite }: { spec: PackSpec; small?: boolean; lite?: boolean }) {
  const w = small ? 1.3 : 2.1;
  const h = small ? 1.9 : 2.85;
  const depth = small ? 0.08 : 0.32;
  const gusset = small ? 0 : 0.18;
  const front = useMemo(() => pouchPanel(w, h, depth, 1, gusset), [w, h, depth, gusset]);
  const back = useMemo(() => pouchPanel(w, h, depth, -1, gusset), [w, h, depth, gusset]);
  const key = JSON.stringify(spec.pouch) + (lite ? 'lite' : '');
  const fTex = useCanvasTexture('pf' + key, () => drawPouchFront(spec.pouch!, lite ? 0.5 : 1), false);
  const bTex = useCanvasTexture('pb' + key, () => drawPouchBack(spec.pouch!, null, lite ? 0.35 : 1), false);
  const mat = { roughness: 0.36, metalness: 0.05, clearcoat: 0.7, clearcoatRoughness: 0.25 };
  return (
    <group>
      <mesh geometry={front}>
        <meshPhysicalMaterial map={fTex} {...mat} />
      </mesh>
      <mesh geometry={back}>
        <meshPhysicalMaterial map={bTex} {...mat} />
      </mesh>
      {/* Gusset floor */}
      {!small && (
        <mesh position={[0, -h / 2 + 0.005, 0]} rotation-x={-Math.PI / 2} scale={[1, gusset + 0.02, 1]}>
          <circleGeometry args={[w / 2, 48]} />
          <meshStandardMaterial color={spec.pouch!.accent} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Supplement bottle                                                   */
/* ------------------------------------------------------------------ */
export function BottleModel({ spec }: { spec: PackSpec }) {
  const R = 0.62;
  const H = 1.75;
  const body = useMemo(() => {
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(R - 0.08, 0)];
    for (let i = 0; i <= 8; i++) {
      const t = (i / 8) * (Math.PI / 2);
      pts.push(new THREE.Vector2(R - 0.08 + Math.sin(t) * 0.08, 0.08 - Math.cos(t) * 0.08));
    }
    pts.push(new THREE.Vector2(R, H - 0.3));
    for (let i = 1; i <= 12; i++) {
      const t = (i / 12) * (Math.PI / 2);
      pts.push(new THREE.Vector2(0.38 + (R - 0.38) * Math.cos(t), H - 0.3 + 0.24 * Math.sin(t)));
    }
    pts.push(new THREE.Vector2(0.36, H));
    return new THREE.LatheGeometry(pts, 128);
  }, []);
  const cap = useMemo(() => knurledCap(0.42, 0.42), []);
  const b = spec.bottle!;
  const tex = useCanvasTexture('bt' + JSON.stringify(b), () => drawBottleLabel(b.name, b.sub, b.accent, b.base));
  return (
    <group position={[0, -(H + 0.38) / 2, 0]}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color={spec.body} roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[R + 0.005, R + 0.005, 1.0, 128, 1, true]} />
        <meshPhysicalMaterial map={tex} roughness={0.4} clearcoat={0.4} />
      </mesh>
      <mesh geometry={cap} position={[0, H + 0.17, 0]}>
        <meshPhysicalMaterial color={spec.cap} roughness={0.35} clearcoat={0.5} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Protein bar — flow-wrap pillow with crimped ends                     */
/* ------------------------------------------------------------------ */
export function BarModel({ spec }: { spec: PackSpec }) {
  const geom = useMemo(() => {
    const g = new THREE.BoxGeometry(3, 0.95, 0.42, 60, 20, 10);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const ex = Math.abs(x) / 1.5;
      const pinch = THREE.MathUtils.smoothstep(ex, 0.86, 1); // crimped ends flatten
      const pill = 1 - Math.pow(Math.abs(y) / 0.475, 4) * 0.35;
      pos.setZ(i, z * (1 - pinch * 0.92) * pill);
      pos.setY(i, y * (1 - pinch * 0.12) + (pinch > 0.5 ? Math.sin(x * 60) * 0.004 : 0));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const b = spec.bar!;
  const tex = useCanvasTexture('bar' + JSON.stringify(b), () => drawBarWrapper(b.name, b.accent, b.flavour), false);
  return (
    <mesh geometry={geom} rotation={[0.2, -0.35, -0.12]}>
      {[0, 1, 2, 3].map((i) => (
        <meshPhysicalMaterial key={i} attach={`material-${i}`} color={b.accent} roughness={0.25} metalness={0.25} clearcoat={0.9} clearcoatRoughness={0.12} />
      ))}
      <meshPhysicalMaterial attach="material-4" map={tex} roughness={0.25} metalness={0.25} clearcoat={0.9} clearcoatRoughness={0.12} />
      <meshPhysicalMaterial attach="material-5" map={tex} roughness={0.25} metalness={0.25} clearcoat={0.9} clearcoatRoughness={0.12} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Shaker — matte black, flip cap, carry loop                           */
/* ------------------------------------------------------------------ */
export const SHAKER = { r: 0.5, h: 2.1, capH: 0.5 };

export function ShakerModel({ capRef, liquid, liquidColor = '#5b3322', children }: { capRef?: React.RefObject<THREE.Group | null>; liquid?: number; liquidColor?: string; children?: ReactNode }) {
  const body = useMemo(() => {
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(SHAKER.r * 0.86 - 0.05, 0)];
    for (let i = 0; i <= 8; i++) {
      const t = (i / 8) * (Math.PI / 2);
      pts.push(new THREE.Vector2(SHAKER.r * 0.86 - 0.05 + Math.sin(t) * 0.05, 0.05 - Math.cos(t) * 0.05));
    }
    pts.push(new THREE.Vector2(SHAKER.r, SHAKER.h));
    pts.push(new THREE.Vector2(SHAKER.r - 0.03, SHAKER.h));
    pts.push(new THREE.Vector2(SHAKER.r * 0.86 - 0.08, 0.06));
    return new THREE.LatheGeometry(pts, 128);
  }, []);
  const wrap = useCanvasTexture('shaker', () => drawShakerWrap());
  const fill = THREE.MathUtils.clamp(liquid ?? 0, 0, 1);
  const lh = 0.06 + fill * (SHAKER.h * 0.72);
  return (
    <group position={[0, -(SHAKER.h + SHAKER.capH) / 2, 0]}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#151517" roughness={0.62} metalness={0.05} clearcoat={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, SHAKER.h * 0.5, 0]}>
        <cylinderGeometry args={[SHAKER.r + 0.003, SHAKER.r * 0.86 + 0.003, SHAKER.h * 0.86, 128, 1, true]} />
        <meshPhysicalMaterial map={wrap} roughness={0.6} transparent />
      </mesh>
      {fill > 0 && (
        <mesh position={[0, 0.06 + lh / 2, 0]}>
          <cylinderGeometry args={[SHAKER.r * 0.84 + (lh / SHAKER.h) * 0.1, SHAKER.r * 0.82, lh, 64]} />
          <meshPhysicalMaterial color={liquidColor} roughness={0.15} clearcoat={1} />
        </mesh>
      )}
      <group position={[0, SHAKER.h, 0]}>
        <group ref={capRef}>
          <mesh position={[0, SHAKER.capH * 0.35, 0]}>
            <cylinderGeometry args={[SHAKER.r * 0.96, SHAKER.r + 0.02, SHAKER.capH * 0.7, 96]} />
            <meshPhysicalMaterial color="#121214" roughness={0.45} clearcoat={0.3} />
          </mesh>
          {/* spout + flip lid */}
          <mesh position={[SHAKER.r * 0.35, SHAKER.capH * 0.82, 0]}>
            <cylinderGeometry args={[0.1, 0.13, 0.18, 32]} />
            <meshPhysicalMaterial color="#0e0e10" roughness={0.4} />
          </mesh>
          <mesh position={[-SHAKER.r * 0.1, SHAKER.capH * 0.78, 0]} rotation-z={0.25}>
            <boxGeometry args={[0.5, 0.08, 0.34]} />
            <meshPhysicalMaterial color="#141416" roughness={0.45} clearcoat={0.3} />
          </mesh>
          {/* carry loop */}
          <mesh position={[-SHAKER.r * 0.55, SHAKER.capH * 0.95, 0]} rotation-y={Math.PI / 2}>
            <torusGeometry args={[0.16, 0.045, 12, 32, Math.PI]} />
            <meshPhysicalMaterial color="#121214" roughness={0.5} />
          </mesh>
        </group>
      </group>
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scoop with a heaped powder mound                                    */
/* ------------------------------------------------------------------ */
export function ScoopModel({ powder, heaped = 1, moundRef }: { powder: string; heaped?: number; moundRef?: React.RefObject<THREE.Mesh | null> }) {
  const cup = useMemo(() => {
    // Flat-bottomed cylindrical measuring scoop with a rolled rim
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(0.28, 0)];
    for (let i = 0; i <= 6; i++) {
      const t = (i / 6) * (Math.PI / 2);
      pts.push(new THREE.Vector2(0.28 + Math.sin(t) * 0.06, 0.06 - Math.cos(t) * 0.06));
    }
    pts.push(new THREE.Vector2(0.35, 0.48));
    pts.push(new THREE.Vector2(0.37, 0.5));
    pts.push(new THREE.Vector2(0.35, 0.52));
    pts.push(new THREE.Vector2(0.33, 0.5));
    pts.push(new THREE.Vector2(0.31, 0.06));
    pts.push(new THREE.Vector2(0.25, 0.025));
    pts.push(new THREE.Vector2(0, 0.025));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  const mound = useMemo(() => {
    const g = new THREE.SphereGeometry(0.33, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // irregular, non-repeating lumps
      const n =
        Math.sin(x * 17.3 + z * 4.1) * 0.012 +
        Math.sin(z * 23.7 - x * 9.2 + 1.3) * 0.01 +
        Math.sin((x - z) * 41.9 + 0.7) * 0.006 +
        (Math.sin(i * 12.9898) * 43758.5453 % 1) * 0.008;
      pos.setXYZ(i, x * (1 + n), y * 0.75 + n * 0.6, z * (1 + n));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const bump = useMemo(() => powderBump(), []);
  return (
    <group>
      <mesh geometry={cup}>
        <meshPhysicalMaterial color="#f1efe9" roughness={0.32} transmission={0} opacity={0.94} transparent clearcoat={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.66, 0.3, 0]} rotation-z={-0.3}>
        <boxGeometry args={[0.66, 0.06, 0.11]} />
        <meshPhysicalMaterial color="#f1efe9" roughness={0.32} clearcoat={0.6} />
      </mesh>
      <mesh ref={moundRef} geometry={mound} position={[0, 0.5, 0]} scale={[1, heaped, 1]}>
        <meshStandardMaterial color={powder} roughness={1} bumpMap={bump} bumpScale={2} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Dispatcher                                                          */
/* ------------------------------------------------------------------ */
export function PackModel({ spec, capRef, showPowder, lite }: { spec: PackSpec; capRef?: React.RefObject<THREE.Group | null>; showPowder?: boolean; lite?: boolean }) {
  switch (spec.kind) {
    case 'tub':
    case 'jar':
      return <TubModel spec={spec} capRef={capRef} showPowder={showPowder} lite={lite} />;
    case 'pouch':
      return <PouchModel spec={spec} lite={lite} />;
    case 'sachet':
      return <PouchModel spec={spec} small lite={lite} />;
    case 'bottle':
      return <BottleModel spec={spec} />;
    case 'bar':
      return <BarModel spec={spec} />;
    case 'shaker':
    default:
      return <ShakerModel />;
  }
}
