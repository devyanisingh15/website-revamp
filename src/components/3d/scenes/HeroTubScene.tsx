import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasShell } from '../CanvasShell';
import { StudioLights } from '../StudioLights';
import { Tub, type TubLabel } from '../models/Tub';
import { PowderBurst } from '../models/PowderBurst';
import type { SceneProps } from '../Stage3D';

export interface HeroTubProps {
  tub: TubLabel;
  powder: string;
  powderAccent?: string;
  /** 0→1 scroll progress through the pinned hero (written by ScrollTrigger) */
  progress: React.RefObject<number>;
  /** Keyboard / button rotation impulses (radians), consumed each frame */
  impulse: React.RefObject<number>;
}

const ease = (a: number, b: number, t: number) => {
  const k = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};

function Rig({ tub, powder, powderAccent, progress, impulse }: HeroTubProps) {
  const group = useRef<THREE.Group>(null);
  const tubRef = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const burst = useRef(0);
  const { gl, camera, size } = useThree();
  const spin = useRef({ angle: -0.5, vel: 0, dragging: false, lastX: 0, idle: 0 });

  // Drag-to-rotate on the canvas (horizontal only so vertical page scroll still works on touch)
  useEffect(() => {
    const el = gl.domElement;
    const s = spin.current;
    const down = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = e.clientX;
      s.idle = 0;
      el.style.cursor = 'grabbing';
    };
    const move = (e: PointerEvent) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      s.lastX = e.clientX;
      s.vel = dx * 0.012;
      s.angle += dx * 0.012;
    };
    const up = () => {
      s.dragging = false;
      el.style.cursor = 'grab';
    };
    el.style.cursor = 'grab';
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [gl]);

  const narrow = size.width < 640;
  const camTarget = useMemo(() => new THREE.Vector3(), []);
  const basePos = useMemo(() => new THREE.Vector3(0, 0.2, narrow ? 12.5 : 10.5), [narrow]);

  useFrame((state, dt) => {
    const p = progress.current ?? 0;
    const s = spin.current;
    const t = state.clock.elapsedTime;

    if (impulse.current) {
      s.vel += impulse.current * 0.12;
      impulse.current = 0;
      s.idle = 0;
    }
    if (!s.dragging) {
      s.angle += s.vel;
      s.vel *= 0.94;
      s.idle += dt;
      // Gentle auto-rotate once the user lets go, fades as the lid opens
      if (s.idle > 1.2) s.angle += dt * 0.35 * (1 - ease(0.1, 0.4, p));
    }

    const open = ease(0.12, 0.5, p);
    burst.current = ease(0.32, 0.95, p);

    if (tubRef.current) {
      tubRef.current.rotation.y = s.angle;
      tubRef.current.position.y = Math.sin(t * 1.2) * 0.06 * (1 - open) - open * 0.35;
    }
    if (group.current) {
      // Tip the tub toward camera so we can see inside as it opens
      group.current.rotation.x = THREE.MathUtils.lerp(0.08, 0.5, open);
      group.current.rotation.z = Math.sin(t * 0.8) * 0.02;
    }
    if (lid.current) {
      lid.current.rotation.x = -open * 1.9;
      lid.current.position.y = open * 0.25;
    }
    camTarget.set(basePos.x, basePos.y + open * 0.8, basePos.z - open * 2.2);
    camera.position.lerp(camTarget, 0.08);
    camera.lookAt(0, open * 0.3, 0);
  });

  return (
    <group ref={group}>
      <group ref={tubRef}>
        <Tub {...tub} lidRef={lid} />
        <PowderBurst progress={burst} color={powder} accent={powderAccent} origin={[0, 1.0, 0]} />
      </group>
      {/* Soft contact shadow */}
      <mesh position={[0, -1.6, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.6, 48]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function HeroTubScene(props: HeroTubProps & SceneProps) {
  const { active, onReady, ...rest } = props;
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: [0, 0.2, 10.5], fov: 30 }}>
      <StudioLights accent="#e8202a" />
      <Rig {...rest} />
    </CanvasShell>
  );
}
