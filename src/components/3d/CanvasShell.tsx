import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, type ReactNode } from 'react';
import type { SceneProps } from './Stage3D';

/** Signals readiness after the first frame actually rendered. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(onReady);
  });
  return null;
}

/**
 * Shared Canvas config: clamped DPR, frameloop paused when inactive,
 * transparent background so the page design shows through.
 */
export function CanvasShell({
  active,
  onReady,
  children,
  camera = { position: [0, 0, 6], fov: 32 },
  className,
  interactive = false,
}: SceneProps & { children: ReactNode; camera?: { position: [number, number, number]; fov: number }; className?: string; interactive?: boolean }) {
  return (
    <Canvas
      className={className}
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={camera}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: interactive ? 'none' : 'pan-y' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <ReadySignal onReady={onReady} />
      {children}
    </Canvas>
  );
}
