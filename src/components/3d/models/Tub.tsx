import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * PROCEDURAL BIOZYME TUB
 * Stand-in until the 3D team supplies a Draco-compressed GLB (< 2 MB).
 * Built from primitives + a canvas-drawn label so it weighs ~0 KB and
 * re-colours instantly per flavour.
 */

export interface TubLabel {
  body: string;
  band: string;
  label: string;
  sub?: string;
  bandText?: string;
  protein?: number | null;
}

function drawLabel(l: TubLabel, scale = 1) {
  const W = 2048;
  const H = 1024;
  const c = document.createElement('canvas');
  c.width = W * scale;
  c.height = H * scale;
  const g = c.getContext('2d')!;
  g.scale(scale, scale);
  const body = new THREE.Color(l.body);
  const dark = body.getHSL({ h: 0, s: 0, l: 0 }).l < 0.5;
  const ink = dark ? '#f2efe9' : '#0a0a0b';
  const muted = dark ? 'rgba(242,239,233,0.55)' : 'rgba(10,10,11,0.55)';
  const bandInk = new THREE.Color(l.band).getHSL({ h: 0, s: 0, l: 0 }).l > 0.55 ? '#0a0a0b' : '#ffffff';

  g.fillStyle = l.body;
  g.fillRect(0, 0, W, H);

  // Front panel is centred at x = W/2 (texture offset puts it facing the camera)
  const cx = W / 2;
  g.textAlign = 'center';
  g.fillStyle = muted;
  g.font = '700 34px "Archivo Variable", Archivo, sans-serif';
  g.letterSpacing = '10px';
  g.fillText('MUSCLEBLAZE', cx, 170);

  g.fillStyle = ink;
  g.letterSpacing = '-4px';
  g.font = `900 ${l.label.length > 8 ? 120 : 168}px "Archivo Variable", Archivo, sans-serif`;
  g.fillText(l.label, cx, 330);

  if (l.sub) {
    g.fillStyle = l.band;
    g.letterSpacing = '8px';
    g.font = '600 48px "JetBrains Mono", monospace';
    g.fillText(l.sub, cx, 400);
  }

  // Flavour band, full wrap
  g.fillStyle = l.band;
  g.fillRect(0, 470, W, 300);
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fillRect(0, 470, W, 8);
  if (l.bandText) {
    g.fillStyle = bandInk;
    g.letterSpacing = '6px';
    g.font = '800 64px "Archivo Variable", Archivo, sans-serif';
    g.fillText(l.bandText, cx, 600);
  }
  if (l.protein != null) {
    g.fillStyle = bandInk;
    g.letterSpacing = '2px';
    g.font = '600 52px "JetBrains Mono", monospace';
    g.fillText(`${l.protein}g PROTEIN / SCOOP`, cx, 690);
  }

  // Back panel (edges of the canvas wrap behind): authenticity sticker
  const bx = 120;
  g.fillStyle = '#d9d4ca';
  g.fillRect(bx, 230, 300, 200);
  g.fillStyle = '#0a0a0b';
  g.letterSpacing = '2px';
  g.font = '600 26px "JetBrains Mono", monospace';
  g.textAlign = 'left';
  g.fillText('AUTHENTICITY', bx + 24, 278);
  g.fillStyle = '#9b958a';
  g.fillRect(bx + 24, 300, 252, 50);
  g.fillStyle = '#0a0a0b';
  g.font = '600 22px "JetBrains Mono", monospace';
  g.fillText('SCRATCH · SCAN · VERIFY', bx + 24, 395);
  // QR-ish block
  const qx = W - 380;
  g.fillStyle = '#f2efe9';
  g.fillRect(qx, 230, 220, 220);
  g.fillStyle = '#0a0a0b';
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < 11; y++)
    for (let x = 0; x < 11; x++) if (rnd() > 0.5) g.fillRect(qx + 12 + x * 18, 242 + y * 18, 18, 18);
  g.fillText('BATCH LAB REPORT', qx - 10, 490);

  // Bottom spec strip
  g.textAlign = 'center';
  g.fillStyle = muted;
  g.font = '600 28px "JetBrains Mono", monospace';
  g.letterSpacing = '4px';
  g.fillText('CLINICALLY TESTED · LAB VERIFIED · MADE FOR INDIA', cx, 880);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.offset.x = 0.5;
  tex.anisotropy = 8;
  return tex;
}

/** Waits for web fonts so the label isn't drawn in a fallback face. */
function useFontsReady() {
  const [ready, setReady] = useState(() => document.fonts?.status === 'loaded');
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

export interface TubHandles {
  lid: THREE.Group | null;
  powder: THREE.Mesh | null;
}

export const Tub = forwardRef<
  THREE.Group,
  TubLabel & { lidRef?: React.RefObject<THREE.Group | null>; highlight?: string | null; /** Low-res label, no grip ribs — for scenes with many tubs */ lite?: boolean }
>(function Tub(
  { lidRef, highlight, lite, ...label },
  ref,
) {
  const fonts = useFontsReady();
  const tex = useMemo(() => drawLabel(label, lite ? 0.5 : 1), [lite, label.body, label.band, label.label, label.sub, label.bandText, label.protein, fonts]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => tex.dispose(), [tex]);

  const localLid = useRef<THREE.Group>(null);
  const lid = lidRef ?? localLid;

  const lidColor = useMemo(() => new THREE.Color(label.body).multiplyScalar(0.55), [label.body]);
  const powderColor = useMemo(() => new THREE.Color(label.band), [label.band]);
  const emissive = highlight ? new THREE.Color(highlight) : new THREE.Color('#000');

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh castShadow>
        <cylinderGeometry args={[1, 0.95, 2.2, lite ? 48 : 96, 1, true]} />
        <meshPhysicalMaterial map={tex} roughness={0.38} metalness={0.05} clearcoat={0.7} clearcoatRoughness={0.25} side={THREE.DoubleSide} emissive={emissive} emissiveIntensity={highlight ? 0.08 : 0} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -1.1, 0]} rotation-x={Math.PI / 2}>
        <circleGeometry args={[0.95, 64]} />
        <meshStandardMaterial color={lidColor} side={THREE.DoubleSide} />
      </mesh>
      {/* Powder surface, slightly recessed */}
      <mesh position={[0, 0.98, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.97, 64]} />
        <meshStandardMaterial color={powderColor} roughness={1} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 1.1, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.99, 0.025, 12, 96]} />
        <meshStandardMaterial color={lidColor} roughness={0.4} />
      </mesh>
      {/* Lid — hinged at the back edge so it can swing open */}
      <group position={[0, 1.1, -1.04]}>
        <group ref={lid}>
          <group position={[0, 0.2, 1.04]}>
            <mesh>
              <cylinderGeometry args={[1.05, 1.05, 0.4, 96]} />
              <meshPhysicalMaterial color={lidColor} roughness={0.32} clearcoat={0.9} clearcoatRoughness={0.2} />
            </mesh>
            <mesh position={[0, 0.2, 0]} rotation-x={Math.PI / 2}>
              <torusGeometry args={[1.0, 0.05, 16, 96]} />
              <meshPhysicalMaterial color={lidColor} roughness={0.3} clearcoat={1} />
            </mesh>
            {/* Ribbed grip */}
            {!lite && Array.from({ length: 48 }).map((_, i) => {
              const a = (i / 48) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.sin(a) * 1.055, 0, Math.cos(a) * 1.055]} rotation-y={a}>
                  <boxGeometry args={[0.03, 0.34, 0.02]} />
                  <meshStandardMaterial color={lidColor} roughness={0.5} />
                </mesh>
              );
            })}
            {/* Lid top badge in flavour colour */}
            <mesh position={[0, 0.201, 0]} rotation-x={-Math.PI / 2}>
              <ringGeometry args={[0.55, 0.62, 64]} />
              <meshStandardMaterial color={label.band} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
});
