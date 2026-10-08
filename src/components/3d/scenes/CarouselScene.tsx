import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasShell } from '../CanvasShell';
import { StudioLights } from '../StudioLights';
import { Tub } from '../models/Tub';
import type { SceneProps } from '../Stage3D';

export interface CarouselItem {
  id: string;
  label: string;
  sub?: string;
  body: string;
  band: string;
}

export interface CarouselProps {
  items: CarouselItem[];
  index: number;
  onSelect: (i: number) => void;
}

/** Ring of floating tubs; the active one rotates to the front and steps forward. */
function Ring({ items, index: active, onSelect }: CarouselProps) {
  const ring = useRef<THREE.Group>(null);
  const tubs = useRef<(THREE.Group | null)[]>([]);
  const { size } = useThree();
  const n = items.length;
  const R = size.width < 640 ? 2.6 : 3.4;
  const step = (Math.PI * 2) / n;
  const target = useRef(0);
  const current = useRef(0);

  useFrame((s, dt) => {
    // shortest-path rotation to the active index
    let goal = -active * step;
    const diff = ((goal - target.current + Math.PI) % (Math.PI * 2)) - Math.PI;
    goal = target.current + (diff < -Math.PI ? diff + Math.PI * 2 : diff);
    target.current = goal;
    current.current = THREE.MathUtils.damp(current.current, target.current, 5, dt);
    if (ring.current) ring.current.rotation.y = current.current;
    tubs.current.forEach((t, i) => {
      if (!t) return;
      const isActive = i === active;
      const sc = THREE.MathUtils.damp(t.scale.x, isActive ? 0.62 : 0.4, 6, dt);
      t.scale.setScalar(sc);
      t.position.y = Math.sin(s.clock.elapsedTime * 1.1 + i) * 0.08 + (isActive ? 0.1 : -0.15);
      t.rotation.y += dt * (isActive ? 0.5 : 0.15);
    });
  });

  return (
    <group ref={ring} position={[0, -0.2, -R + 1.2]}>
      {items.map((it, i) => {
        const a = i * step;
        return (
          <group key={it.id} position={[Math.sin(a) * R, 0, Math.cos(a) * R]}>
            <group
              ref={(el) => {
                tubs.current[i] = el;
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(i);
              }}
              onPointerOver={() => (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = '')}
            >
              <Tub lite body={it.body} band={it.band} label={it.label} sub={it.sub} />
            </group>
          </group>
        );
      })}
    </group>
  );
}

export default function CarouselScene({ active, onReady, ...rest }: CarouselProps & SceneProps) {
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: [0, 1.2, 8.4], fov: 30 }}>
      <StudioLights intensity={0.9} />
      <Ring {...rest} />
    </CanvasShell>
  );
}
