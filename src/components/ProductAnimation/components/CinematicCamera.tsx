import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRig } from '../rig';

/**
 * CINEMATIC CAMERA
 * Shots are keyframes on the scroll timeline. Position, look-target and focus
 * point each run on a centripetal Catmull-Rom spline, so moves blend into one
 * continuous take (dolly → orbit → crane → macro push-in) with no cuts.
 * FOV and bokeh are interpolated with easing. A damped follow absorbs scroll
 * jitter; a tiny pointer parallax adds life on desktop.
 *
 * Coordinates: metres. Jar at the origin (0.84 m tall, label facing +Z);
 * shaker at x ≈ 0.62.
 */
type V3 = [number, number, number];
interface Shot {
  p: number;
  pos: V3;
  target: V3;
  fov: number;
  focus: V3;
  bokeh: number;
  note: string;
  /** Portrait screens: where the look-target sits horizontally (default 0 = centred on the subject) */
  px?: number;
  /** Portrait screens: extra pull-back for this shot (default 1), for wide action like two hands */
  pz?: number;
}

export const SHOTS: Shot[] = [
  { p: 0.0, pos: [0, 0.42, 3.6], target: [0, 0.4, 0], fov: 28, focus: [0, 0.4, 0], bokeh: 0, note: 'Brand intro — dark' },
  { p: 0.1, pos: [0.3, 0.5, 3.1], target: [-0.32, 0.4, 0], fov: 28, focus: [0, 0.4, 0.2], bokeh: 1.2, note: 'Reveal — wide' },
  { p: 0.18, pos: [0.12, 0.46, 2.3], target: [-0.3, 0.38, 0], fov: 27, focus: [0, 0.38, 0.25], bokeh: 1.8, note: 'Slow dolly in' },
  { p: 0.25, pos: [-0.02, 0.42, 1.75], target: [-0.26, 0.37, 0], fov: 26, focus: [0, 0.36, 0.25], bokeh: 2.2, note: 'Label reveal' },
  { p: 0.28, pos: [0.24, 1.32, 2.9], target: [-0.36, 0.66, 0], fov: 26, focus: [0, 0.66, 0.22], bokeh: 2.0, note: 'Hands — opening, slightly above like the reference photo; whole upper hand in frame below the header', px: 0.08, pz: 1.32 },
  { p: 0.335, pos: [0.12, 1.3, 2.5], target: [-0.32, 0.7, 0], fov: 26, focus: [0, 0.72, 0.2], bokeh: 2.2, note: 'Hands — slow push-in while the cap twists off', px: 0.08, pz: 1.32 },
  { p: 0.39, pos: [0.0, 1.38, 2.0], target: [-0.24, 0.74, 0], fov: 25, focus: [-0.1, 0.7, 0.05], bokeh: 2.4, note: 'Cap carried to the counter', px: -0.4, pz: 1.3 },
  { p: 0.45, pos: [0.03, 1.08, 0.24], target: [0.02, 0.69, 0.0], fov: 22, focus: [0.035, 0.695, 0.02], bokeh: 5, note: 'Macro powder' },
  { p: 0.52, pos: [0.16, 1.0, 0.34], target: [0.03, 0.71, 0.02], fov: 23, focus: [0.035, 0.72, 0.02], bokeh: 4.5, note: 'Macro — scoop dips' },
  { p: 0.58, pos: [0.3, 1.18, 0.95], target: [0.22, 0.86, 0.04], fov: 25, focus: [0.2, 0.9, 0.04], bokeh: 3.2, note: 'Follow scoop out' },
  { p: 0.65, pos: [0.86, 1.0, 0.72], target: [0.58, 0.68, 0.08], fov: 24, focus: [0.62, 0.72, 0.08], bokeh: 3.4, note: 'Pour into shaker' },
  { p: 0.72, pos: [1.02, 0.7, 1.45], target: [0.6, 0.36, 0.08], fov: 25, focus: [0.62, 0.36, 0.1], bokeh: 2.6, note: 'Liquid in' },
  { p: 0.78, pos: [0.95, 0.62, 1.75], target: [0.6, 0.42, 0.08], fov: 25, focus: [0.62, 0.42, 0.1], bokeh: 2.2, note: 'Shake — locked camera' },
  { p: 0.84, pos: [-0.65, 0.66, 3.3], target: [-0.28, 0.42, 0], fov: 26, focus: [0.05, 0.38, 0.2], bokeh: 1.6, note: 'Hero — orbit start' },
  { p: 0.9, pos: [0.15, 0.54, 3.25], target: [-0.3, 0.42, 0], fov: 26, focus: [0.05, 0.38, 0.22], bokeh: 1.8, note: 'Hero — orbit' },
  { p: 0.945, pos: [0.2, 0.38, 0.86], target: [-0.13, 0.36, 0], fov: 24, focus: [0, 0.35, 0.255], bokeh: 2.4, note: 'Macro push-in on label' },
  { p: 1.0, pos: [0.1, 0.46, 2.7], target: [0.2, 0.38, 0], fov: 26, focus: [0.1, 0.38, 0.2], bokeh: 1.2, note: 'Pull back — outro' },
];

const smooth = (t: number) => t * t * (3 - 2 * t);

export function CinematicCamera() {
  const { progress, focus, bokeh, quality, reduced } = useRig();
  const { camera, size, pointer } = useThree();
  const cam = camera as THREE.PerspectiveCamera;

  const curves = useMemo(() => {
    const mk = (k: 'pos' | 'target' | 'focus') => new THREE.CatmullRomCurve3(SHOTS.map((s) => new THREE.Vector3(...s[k])), false, 'centripetal', 0.5);
    return { pos: mk('pos'), target: mk('target'), focus: mk('focus') };
  }, []);

  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), tgt: new THREE.Vector3(), foc: new THREE.Vector3(), look: new THREE.Vector3(0, 0.4, 0) }), []);
  const first = useRef(true);

  useEffect(() => {
    cam.near = 0.01;
    cam.far = 30;
    cam.updateProjectionMatrix();
  }, [cam]);

  useFrame((_, dt) => {
    const p = reduced ? 0.9 : progress.current ?? 0;
    // Locate the shot segment and map scroll → spline parameter
    let i = 0;
    while (i < SHOTS.length - 2 && p > SHOTS[i + 1].p) i++;
    const a = SHOTS[i];
    const b = SHOTS[i + 1];
    const local = THREE.MathUtils.clamp((p - a.p) / (b.p - a.p), 0, 1);
    const u = (i + local) / (SHOTS.length - 1);
    curves.pos.getPoint(u, tmp.pos);
    curves.target.getPoint(u, tmp.tgt);
    curves.focus.getPoint(u, tmp.foc);
    const e = smooth(local);
    const fov = THREE.MathUtils.lerp(a.fov, b.fov, e);
    const bk = THREE.MathUtils.lerp(a.bokeh, b.bokeh, e);

    // Portrait screens: pull back so the subject still fits; mobile: calmer moves
    const aspect = size.width / size.height;
    // Portrait: desktop shots leave room for copy beside the product; on phones the
    // copy sits above/below, so slide the whole shot back toward the subject.
    // Shots can set px: during the hands beat the jar sits left of centre so the hand
    // reaching in from the right stays on screen, then the frame follows the cap left.
    if (aspect < 1) {
      const px = THREE.MathUtils.lerp(a.px ?? 0, b.px ?? 0, e);
      const recentre = (px - tmp.tgt.x) * Math.min(1, (1 - aspect) * 1.6);
      tmp.pos.x += recentre;
      tmp.tgt.x += recentre;
    }
    const pullBack = aspect < 1 ? (1 + (1 - aspect) * 0.85) * THREE.MathUtils.lerp(a.pz ?? 1, b.pz ?? 1, e) : 1;
    const calm = quality === 'low' ? 0.72 : 1;
    tmp.pos.sub(tmp.tgt);
    tmp.pos.x *= calm;
    tmp.pos.multiplyScalar(pullBack);
    tmp.pos.add(tmp.tgt);

    // Subtle pointer parallax (desktop only)
    if (quality === 'high' && !reduced) {
      tmp.pos.x += pointer.x * 0.02;
      tmp.pos.y += pointer.y * 0.012;
    }

    const k = first.current || reduced ? 1 : 1 - Math.exp(-6 * dt);
    first.current = false;
    cam.position.lerp(tmp.pos, k);
    tmp.look.lerp(tmp.tgt, k);
    cam.lookAt(tmp.look);
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = THREE.MathUtils.lerp(cam.fov, fov, k);
      cam.updateProjectionMatrix();
    }
    focus.lerp(tmp.foc, k);
    bokeh.current = THREE.MathUtils.lerp(bokeh.current ?? 0, bk, k);
  });

  return null;
}
