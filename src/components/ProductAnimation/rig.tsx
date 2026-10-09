import { createContext, useContext, type ReactNode } from 'react';
import type * as THREE from 'three';

/**
 * Shared state for the animation canvas. Scenes own different objects but
 * read the same scroll progress; refs let them animate without React re-renders.
 */
export type Quality = 'high' | 'low';

export interface Rig {
  /** Smoothed scroll progress 0→1 (written by ProductAnimation, read every frame) */
  progress: React.RefObject<number>;
  quality: Quality;
  reduced: boolean;
  powderColor: string;
  jar: React.RefObject<THREE.Group | null>;
  jarCap: React.RefObject<THREE.Group | null>;
  shaker: React.RefObject<THREE.Group | null>;
  shakerCap: React.RefObject<THREE.Group | null>;
  scoop: React.RefObject<THREE.Group | null>;
  scoopMound: React.RefObject<THREE.Group | null>;
  /** Depth of field: world-space focus point and bokeh strength, driven by the camera */
  focus: THREE.Vector3;
  bokeh: React.RefObject<number>;
  /** 0→1 how much powder the scoop has carved out of the bed */
  crater: React.RefObject<number>;
}

const RigCtx = createContext<Rig | null>(null);

export function RigProvider({ value, children }: { value: Rig; children: ReactNode }) {
  return <RigCtx.Provider value={value}>{children}</RigCtx.Provider>;
}

export function useRig() {
  const r = useContext(RigCtx);
  if (!r) throw new Error('useRig outside RigProvider');
  return r;
}
