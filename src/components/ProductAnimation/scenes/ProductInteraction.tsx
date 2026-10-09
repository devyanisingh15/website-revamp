import { useFrame } from '@react-three/fiber';
import { useRig } from '../rig';
import { ease } from '../config/timeline';
import { CONTAINER } from '../config/assets';

/**
 * SCENE 3 — HUMAN INTERACTION / OPENING (25–40%)
 * Owns: the jar cap. It unscrews (2½ counter-clockwise turns, rising on the
 * thread), lifts off and is set down on the counter; it returns and screws back
 * on while the camera is on the shaker, so the hero shot shows a sealed tub.
 *
 * HANDS: no hand asset was supplied. HandFootageLayer.tsx (DOM) is scrubbed across
 * this window — drop transparent hand footage into productAssets.handFootage and
 * it appears in sync with the cap motion, no scene changes needed.
 */
const REST = { x: -0.5, y: -CONTAINER.cap.bottom, z: -0.32 };
const TURNS = 2.5;

function capPose(p: number) {
  const unscrew = ease(p, 0.29, 0.355);
  const off = ease(p, 0.355, 0.4);
  const back = ease(p, 0.74, 0.785);
  const screw = ease(p, 0.785, 0.81);
  // Out-and-back along the same arc
  const travel = off * (1 - back);
  const turns = unscrew * (1 - screw);
  const lift = 0.012 * turns;
  return {
    x: REST.x * travel,
    z: REST.z * travel,
    y: lift + (REST.y - lift) * travel + Math.sin(Math.PI * travel) * 0.12,
    ry: turns * TURNS * Math.PI * 2,
    tilt: Math.sin(Math.PI * travel) * 0.25,
  };
}

export function ProductInteraction() {
  const { progress, jarCap } = useRig();
  useFrame(() => {
    const c = jarCap.current;
    if (!c) return;
    const pose = capPose(progress.current ?? 0);
    c.position.set(pose.x, pose.y, pose.z);
    c.rotation.set(pose.tilt, pose.ry, 0);
  });
  return null;
}
