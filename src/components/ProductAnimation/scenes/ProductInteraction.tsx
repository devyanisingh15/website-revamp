import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useRig } from '../rig';
import { ease } from '../config/timeline';
import { CONTAINER, HAND_PHOTO, productAssets } from '../config/assets';

/**
 * SCENE 3 — HUMAN INTERACTION / OPENING (25–40%)
 * One hand steadies the jar, the other twists the cap off in three short
 * re-grips (as people actually open a tub), lifts it off the thread, carries it
 * to the counter and lets go. The cap returns and screws back on later, while the
 * camera is on the shaker, so the hero shot shows a sealed tub.
 *
 * HANDS: keyed from the supplied photo (productAssets.hands) and composited as
 * camera-facing cards. Each card is registered to the photo (HAND_PHOTO): the
 * top hand's fingertips and thumb land on the 3D cap's rims, the lower hand
 * wraps the jar's front. Cards sit just in front of the surface they touch and
 * are rescaled so the projection matches exactly.
 * Transparent hand FOOTAGE can replace them (productAssets.handFootage, DOM layer).
 */
// Set down on the counter to the left of the jar, in view and clear of the jar mouth
const REST = { x: -0.58, y: -CONTAINER.cap.bottom, z: 0.06 };
/** Real tub caps come off in about one turn */
const TURNS = 1;
const CYCLES = 3;

/** Key moments (scroll progress) */
export const GRIP = {
  jarHandIn: [0.255, 0.285],
  capHandIn: [0.262, 0.29],
  twist: [0.29, 0.35],
  lift: [0.35, 0.358],
  carry: [0.358, 0.4],
  release: [0.392, 0.41],
  jarHandOut: [0.37, 0.4],
} as const;

/** Stepped unscrew: twist ~120°, let go, re-grip, twist again. */
function twistState(p: number) {
  const u = THREE.MathUtils.clamp((p - GRIP.twist[0]) / (GRIP.twist[1] - GRIP.twist[0]), 0, 1) * CYCLES;
  const i = Math.min(Math.floor(u), CYCLES - 1);
  const phi = u >= CYCLES ? 1 : u - i;
  const twist = phi < 0.65 ? ease(phi, 0, 0.65) : 1; // hand + cap turn together
  const regrip = phi < 0.65 ? 0 : ease(phi, 0.65, 1); // hand slides back, cap stays
  const done = u >= CYCLES;
  return { turn: (done ? CYCLES : i + twist) / CYCLES, hand: done ? 1 : twist * (1 - regrip) };
}

function capPose(p: number) {
  const { turn } = twistState(p);
  const lift = 0.016 * ease(p, GRIP.lift[0], GRIP.lift[1]);
  const off = ease(p, GRIP.carry[0], GRIP.carry[1]);
  const back = ease(p, 0.74, 0.785);
  const screw = ease(p, 0.785, 0.81);
  const travel = off * (1 - back); // out-and-back along the same arc
  const turns = turn * (1 - screw);
  const l = lift * (1 - screw);
  return {
    x: REST.x * travel,
    z: REST.z * travel,
    y: l + (REST.y - l) * travel + Math.sin(Math.PI * travel) * 0.12,
    ry: turns * TURNS * Math.PI * 2,
    tilt: Math.sin(Math.PI * travel) * 0.25,
  };
}

export function ProductInteraction() {
  const { progress, jarCap, reduced } = useRig();
  useFrame(() => {
    const c = jarCap.current;
    if (!c) return;
    const pose = capPose(reduced ? 0.9 : progress.current ?? 0);
    c.position.set(pose.x, pose.y, pose.z);
    c.rotation.set(pose.tilt, pose.ry, 0);
  });
  return reduced ? null : <HandRig />;
}

/* ------------------------------------------------------------------ */

const k = HAND_PHOTO.pxToM;
/** Plane centre relative to an anchor pixel, in metres (x right, y up) */
function cardOffset(rect: { x: number; y: number; w: number; h: number }, ax: number, ay: number) {
  return new THREE.Vector3((rect.x + rect.w / 2 - ax) * k, -(rect.y + rect.h / 2 - ay) * k, 0);
}
const TOP = HAND_PHOTO.top;
const BOT = HAND_PHOTO.bottom;
const TOP_ANCHOR = { x: (TOP.fingers.x + TOP.thumb.x) / 2, y: (TOP.fingers.y + TOP.thumb.y) / 2 };
/** Roll that levels the fingertip→thumb line on a level cap */
const TOP_ROLL = -Math.atan2(TOP.fingers.y - TOP.thumb.y, TOP.thumb.x - TOP.fingers.x);
/** Grip span in the photo vs our cap diameter */
const TOP_FIT = (CONTAINER.cap.radius * 2) / (Math.hypot(TOP.thumb.x - TOP.fingers.x, TOP.thumb.y - TOP.fingers.y) * k);
const JAR_HAND_Y = 0.45;

function HandRig() {
  const { progress, jarCap, quality } = useRig();
  const [topTex, botTex] = useTexture([productAssets.hands.top, productAssets.hands.bottom]);
  const group = useRef<THREE.Group>(null);
  const topCard = useRef<THREE.Group>(null);
  const botCard = useRef<THREE.Group>(null);

  const mats = useMemo(() => {
    const mk = (map: THREE.Texture) => {
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = quality === 'high' ? 8 : 2;
      return new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.03, depthWrite: true, color: '#ece0d6' });
    };
    return { top: mk(topTex), bot: mk(botTex) };
  }, [topTex, botTex, quality]);

  const geo = useMemo(
    () => ({
      top: new THREE.PlaneGeometry(TOP.rect.w * k, TOP.rect.h * k).translate(...cardOffset(TOP.rect, TOP_ANCHOR.x, TOP_ANCHOR.y).toArray()),
      bot: new THREE.PlaneGeometry(BOT.rect.w * k, BOT.rect.h * k).translate(...cardOffset(BOT.rect, BOT.jarAxisX, BOT.fingertips.y).toArray()),
    }),
    [],
  );

  const t = useMemo(() => ({ anchor: new THREE.Vector3(), toCam: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), q: new THREE.Quaternion(), roll: new THREE.Quaternion(), z: new THREE.Vector3(0, 0, 1) }), []);

  /** Place a card: in front of `anchor` by `push`, facing the camera, scale-corrected, slid in screen space. */
  const place = (card: THREE.Group, cam: THREE.Camera, push: number, roll: number, slideX: number, slideY: number, fit: number) => {
    t.toCam.copy(cam.position).sub(t.anchor);
    const dist = t.toCam.length();
    t.toCam.normalize();
    card.position.copy(t.anchor).addScaledVector(t.toCam, push);
    t.right.setFromMatrixColumn(cam.matrixWorld, 0);
    t.up.setFromMatrixColumn(cam.matrixWorld, 1);
    card.position.addScaledVector(t.right, slideX).addScaledVector(t.up, slideY);
    card.scale.setScalar(((dist - push) / dist) * fit);
    t.roll.setFromAxisAngle(t.z, roll);
    card.quaternion.copy(cam.quaternion).multiply(t.roll);
  };

  useFrame((state) => {
    const p = progress.current ?? 0;
    const g = group.current;
    if (!g) return;
    g.visible = p > GRIP.jarHandIn[0] && p < GRIP.release[1];
    if (!g.visible) return;
    const cam = state.camera;

    // Lower hand: slides in from the right, steadies the jar, slides out
    const botIn = ease(p, GRIP.jarHandIn[0], GRIP.jarHandIn[1]);
    const botOut = ease(p, GRIP.jarHandOut[0], GRIP.jarHandOut[1]);
    if (botCard.current) {
      t.anchor.set(0, JAR_HAND_Y, 0);
      place(botCard.current, cam, CONTAINER.bodyRadius + 0.012, 0, (1 - botIn) * 1.05 + botOut * 1.05, 0, 1);
    }

    // Upper hand: comes down onto the cap, twists with it, re-grips, carries it away, lets go
    const capIn = ease(p, GRIP.capHandIn[0], GRIP.capHandIn[1]);
    const rel = ease(p, GRIP.release[0], GRIP.release[1]);
    const { hand } = twistState(p);
    if (topCard.current && jarCap.current) {
      jarCap.current.getWorldPosition(t.anchor);
      t.anchor.y += CONTAINER.cap.top - CONTAINER.cap.bottom - 0.012;
      const tilt = jarCap.current.rotation.x;
      const roll = TOP_ROLL + (hand - 0.5) * 0.2 * (p < GRIP.lift[0] ? 1 : 0) - tilt * 0.6;
      const slideX = (hand - 0.4) * 0.045 * (p < GRIP.lift[0] ? 1 : 0);
      place(topCard.current, cam, CONTAINER.cap.radius, roll, slideX, (1 - capIn) * 0.75 + rel * 0.6, TOP_FIT);
      mats.top.opacity = Math.min(1, capIn * 3) * (1 - rel * rel);
    }
  });

  return (
    <group ref={group} visible={false}>
      <group ref={botCard}>
        <mesh geometry={geo.bot} material={mats.bot} renderOrder={5} />
      </group>
      <group ref={topCard}>
        <mesh geometry={geo.top} material={mats.top} renderOrder={6} />
      </group>
    </group>
  );
}
