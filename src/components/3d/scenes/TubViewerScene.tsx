import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitImpl } from 'three-stdlib';
import { CanvasShell } from '../CanvasShell';
import { RealStudio } from '../real/Studio';
import { PackModel, tubMetrics } from '../real/models';
import { framing, packSpec } from '../real/spec';
import { getProduct } from '@/data/products';
import type { SceneProps } from '../Stage3D';

export interface ViewerHotspot {
  id: string;
  label: string;
  /** Position in wrap-label artwork pixels (4096 × 1000 canvas) */
  cx: number;
  cy: number;
}

export interface TubViewerProps {
  productId: string;
  flavourId: string | null;
  sizeLabel: string;
  /** Draco GLB path when supplied by the 3D team; procedural model otherwise */
  model3d: string | null;
  hotspots: ViewerHotspot[];
  focus: string | null;
  onFocus: (id: string | null) => void;
  /** Increments to request a zoom step from keyboard/buttons: +1 in, -1 out */
  zoomStep: { n: number; dir: 1 | -1 };
  rotateStep: { n: number; dir: 1 | -1 };
}

const LABEL_W = 4096;
const LABEL_H = 1000;

function GlbModel({ url }: { url: string }) {
  // Draco decoder files must be self-hosted at /draco/ (see README → assets)
  const { scene } = useGLTF(url, '/draco/');
  return <primitive object={scene} />;
}

function Viewer({ productId, flavourId, sizeLabel, model3d, hotspots, focus, onFocus, zoomStep, rotateStep }: TubViewerProps) {
  const product = getProduct(productId)!;
  const flavour = product.flavours.find((f) => f.id === flavourId);
  const spec = useMemo(() => packSpec(product, flavour, sizeLabel), [product, flavour, sizeLabel]);
  const group = useRef<THREE.Group>(null);
  const controls = useRef<OrbitImpl>(null);
  const targetAngle = useRef<number | null>(null);
  const interacting = useRef(false);

  // Label-art pixels → angle around the tub + world height
  const spots = useMemo(() => {
    if (!spec.dims) return [];
    const m = tubMetrics(spec.dims);
    const labelH = m.labelTop - m.labelBottom;
    return hotspots.map((h) => ({
      ...h,
      angle: (h.cx / LABEL_W - 0.5) * Math.PI * 2,
      y: m.yOffset + m.labelTop - (h.cy / LABEL_H) * labelH,
      r: spec.dims!.radius + 0.06,
    }));
  }, [hotspots, spec]);

  useEffect(() => {
    const h = spots.find((x) => x.id === focus);
    if (h) targetAngle.current = -h.angle;
  }, [focus, spots]);

  useEffect(() => {
    if (!zoomStep.n || !controls.current) return;
    const c = controls.current;
    const cam = c.object as THREE.PerspectiveCamera;
    const dir = cam.position.clone().sub(c.target);
    const len = THREE.MathUtils.clamp(dir.length() * (zoomStep.dir > 0 ? 0.82 : 1.2), c.minDistance, c.maxDistance);
    cam.position.copy(c.target).add(dir.setLength(len));
    c.update();
  }, [zoomStep]);

  useEffect(() => {
    if (!rotateStep.n || !group.current) return;
    targetAngle.current = group.current.rotation.y + rotateStep.dir * (Math.PI / 4);
  }, [rotateStep]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    if (targetAngle.current != null) {
      const cur = g.rotation.y;
      const d = Math.atan2(Math.sin(targetAngle.current - cur), Math.cos(targetAngle.current - cur));
      g.rotation.y = cur + d * Math.min(1, dt * 5);
      if (Math.abs(d) < 0.002) targetAngle.current = null;
    } else if (!interacting.current && !focus) {
      g.rotation.y += dt * 0.22;
    }
  });

  const f = framing(spec);
  return (
    <>
      <RealStudio floor="dark" floorY={f.floorY} shadow={0.75} floorSize={8} />
      <group ref={group} rotation-y={-0.35}>
        {model3d ? <GlbModel url={model3d} /> : <PackModel spec={spec} />}
        {spots.map((h, i) => (
          <group key={h.id} rotation-y={h.angle}>
            <Html position={[0, h.y, h.r]} center zIndexRange={[20, 0]} occlude={false}>
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                onClick={() => onFocus(focus === h.id ? null : h.id)}
                className={`grid size-7 place-items-center rounded-full border font-mono text-[11px] font-semibold shadow-lg backdrop-blur transition-all ${
                  focus === h.id ? 'scale-110 border-proof-400 bg-proof-400 text-ink-950' : 'border-white/60 bg-ink-950/70 text-bone-100 hover:border-proof-400'
                }`}
              >
                {i + 1}
              </button>
            </Html>
          </group>
        ))}
      </group>
      <OrbitControls
        ref={controls as never}
        target={[0, f.y - 0.1, 0]}
        enablePan={false}
        minDistance={f.z * 0.5}
        maxDistance={f.z * 1.35}
        minPolarAngle={Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.55}
        onStart={() => (interacting.current = true)}
        onEnd={() => (interacting.current = false)}
      />
    </>
  );
}

export default function TubViewerScene({ active, onReady, ...rest }: TubViewerProps & SceneProps) {
  const product = getProduct(rest.productId)!;
  const f = framing(packSpec(product));
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: [0, f.y + 0.9, f.z], fov: 26 }} interactive>
      <Viewer {...rest} />
    </CanvasShell>
  );
}
