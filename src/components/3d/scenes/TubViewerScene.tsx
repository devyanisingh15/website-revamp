import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitImpl } from 'three-stdlib';
import { CanvasShell } from '../CanvasShell';
import { StudioLights } from '../StudioLights';
import { Tub, type TubLabel } from '../models/Tub';
import type { SceneProps } from '../Stage3D';

export interface ViewerHotspot {
  id: string;
  label: string;
  /** Angle around the tub (radians) where the hotspot faces the camera */
  angle: number;
  y: number;
}

export interface TubViewerProps {
  tub: TubLabel;
  /** Draco GLB path when supplied by the 3D team; procedural tub otherwise */
  model3d: string | null;
  hotspots: ViewerHotspot[];
  focus: string | null;
  onFocus: (id: string | null) => void;
  /** Increments to request a zoom step from keyboard/buttons: +1 in, -1 out */
  zoomStep: { n: number; dir: 1 | -1 };
  rotateStep: { n: number; dir: 1 | -1 };
}

function GlbModel({ url }: { url: string }) {
  // Draco decoder files must be self-hosted at /draco/ (see README → assets)
  const { scene } = useGLTF(url, '/draco/');
  return <primitive object={scene} />;
}

function Viewer({ tub, model3d, hotspots, focus, onFocus, zoomStep, rotateStep }: TubViewerProps) {
  const group = useRef<THREE.Group>(null);
  const controls = useRef<OrbitImpl>(null);
  const targetAngle = useRef<number | null>(null);
  const interacting = useRef(false);

  useEffect(() => {
    const h = hotspots.find((x) => x.id === focus);
    if (h) targetAngle.current = -h.angle;
  }, [focus, hotspots]);

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
      // shortest path
      const cur = g.rotation.y;
      let d = targetAngle.current - cur;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      g.rotation.y = cur + d * Math.min(1, dt * 5);
      if (Math.abs(d) < 0.002) targetAngle.current = null;
    } else if (!interacting.current && !focus) {
      g.rotation.y += dt * 0.25;
    }
  });

  return (
    <>
      <group ref={group} position={[0, -0.15, 0]}>
        {model3d ? <GlbModel url={model3d} /> : <Tub {...tub} />}
        {hotspots.map((h, i) => (
          <group key={h.id} rotation-y={h.angle}>
            <Html position={[0, h.y, 1.08]} center zIndexRange={[20, 0]} occlude={false}>
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                onClick={() => onFocus(focus === h.id ? null : h.id)}
                className={`grid size-7 place-items-center rounded-full border font-mono text-[11px] font-semibold backdrop-blur transition-all ${
                  focus === h.id ? 'scale-110 border-proof-400 bg-proof-400 text-ink-950' : 'border-white/50 bg-ink-950/60 text-bone-100 hover:border-proof-400'
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
        enablePan={false}
        minDistance={4}
        maxDistance={9}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.62}
        onStart={() => (interacting.current = true)}
        onEnd={() => (interacting.current = false)}
      />
    </>
  );
}

export default function TubViewerScene({ active, onReady, ...rest }: TubViewerProps & SceneProps) {
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: [0, 0.6, 6.5], fov: 30 }} interactive>
      <StudioLights accent={rest.tub.band} />
      <Viewer {...rest} />
    </CanvasShell>
  );
}
