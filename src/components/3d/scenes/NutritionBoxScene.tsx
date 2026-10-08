import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasShell } from '../CanvasShell';
import type { SceneProps } from '../Stage3D';
import { BOX, BOX_FACES, drawBoxFace, rowWorldY, type BoxData, type BoxFace, type LabelRowId } from '@/components/product/box/boxPanels';

/**
 * ROTATING PROTEIN BOX
 * Drag (or use the DOM panel buttons / arrow keys) to turn the carton.
 * On release it snaps flat to the nearest panel; when the Nutrition Facts
 * panel faces the viewer the camera eases closer and the tilt levels out so
 * the label reads straight-on.
 */
export interface NutritionBoxProps {
  data: BoxData;
  face: BoxFace;
  onFaceChange: (f: BoxFace) => void;
  highlight: LabelRowId | null;
  /** Extra push-in for close reading */
  magnify: boolean;
  reduced: boolean;
}

const QUARTER = Math.PI / 2;
// Box rotation that brings each face to the camera
const FACE_ANGLE: Record<BoxFace, number> = { front: 0, right: -QUARTER, back: Math.PI, left: QUARTER };
const faceFromAngle = (a: number): BoxFace => {
  const k = ((Math.round(-a / QUARTER) % 4) + 4) % 4; // 0 front, 1 right, 2 back, 3 left
  return BOX_FACES[k].id;
};

function useFaceTexture(face: BoxFace, data: BoxData, highlight: LabelRowId | null) {
  const canvas = useMemo(() => document.createElement('canvas'), []);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
    return t;
  }, [canvas]);
  useEffect(() => {
    let alive = true;
    const draw = () => {
      if (!alive) return;
      drawBoxFace(face, data, face === 'back' ? highlight : null, canvas);
      tex.needsUpdate = true;
    };
    draw();
    // Redraw once web fonts are ready so the label isn't set in a fallback face
    document.fonts?.ready.then(draw);
    return () => {
      alive = false;
    };
  }, [face, data, highlight, canvas, tex]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function Box({ data, face, onFaceChange, highlight, magnify, reduced }: NutritionBoxProps) {
  const group = useRef<THREE.Group>(null);
  const { gl, camera, size } = useThree();
  const s = useRef({ angle: 0, target: 0, tilt: 0, tiltTarget: 0, vel: 0, dragging: false, lastX: 0, lastY: 0, startY: 0, touched: false, reported: 'front' as BoxFace });
  const faceRef = useRef(face);
  const cb = useRef(onFaceChange);
  cb.current = onFaceChange;

  const front = useFaceTexture('front', data, highlight);
  const back = useFaceTexture('back', data, highlight);
  const right = useFaceTexture('right', data, highlight);
  const left = useFaceTexture('left', data, highlight);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(BOX.w * 1.002, BOX.h * 1.002, BOX.d * 1.002)), []);
  const capColor = useMemo(() => new THREE.Color(data.body).multiplyScalar(0.8), [data.body]);

  // External face selection (buttons / keyboard) → shortest rotation to that panel
  useEffect(() => {
    faceRef.current = face;
    const st = s.current;
    if (faceFromAngle(st.target) === face) return;
    const goal = FACE_ANGLE[face];
    const d = Math.atan2(Math.sin(goal - st.target), Math.cos(goal - st.target));
    st.target += d;
    st.touched = true;
    st.reported = face;
  }, [face]);

  // Pointer drag on the canvas: horizontal spins, vertical tilts a little
  useEffect(() => {
    const el = gl.domElement;
    const st = s.current;
    const down = (e: PointerEvent) => {
      st.dragging = true;
      st.touched = true;
      st.lastX = e.clientX;
      st.lastY = st.startY = e.clientY;
      st.vel = 0;
      el.style.cursor = 'grabbing';
    };
    const move = (e: PointerEvent) => {
      if (!st.dragging) return;
      const dx = e.clientX - st.lastX;
      st.lastX = e.clientX;
      const k = 3.2 / Math.max(320, el.clientWidth); // full width drag ≈ half a turn+
      st.target += dx * k * Math.PI;
      st.vel = dx * k * Math.PI;
      if (e.pointerType === 'mouse') st.tiltTarget = THREE.MathUtils.clamp((e.clientY - st.startY) * 0.004, -0.4, 0.4);
    };
    const up = () => {
      if (!st.dragging) return;
      st.dragging = false;
      el.style.cursor = 'grab';
      // Momentum-aware snap to the nearest panel
      st.target = Math.round((st.target + st.vel * 6) / QUARTER) * QUARTER;
      st.tiltTarget = 0;
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

  const camTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const st = s.current;
    const g = group.current;
    if (!g) return;
    const lambda = reduced ? 30 : st.dragging ? 18 : 7;
    st.angle = THREE.MathUtils.damp(st.angle, st.target, lambda, dt);
    st.tilt = THREE.MathUtils.damp(st.tilt, st.tiltTarget, 8, dt);
    // Gentle idle sway until the user interacts, so it reads as "turnable"
    const sway = !st.touched && !reduced ? Math.sin(state.clock.elapsedTime * 0.9) * 0.28 : 0;
    g.rotation.y = st.angle + sway;
    g.rotation.x = st.tilt;
    g.position.y = reduced ? 0 : Math.sin(state.clock.elapsedTime * 1.1) * 0.03;

    // Report the panel facing the viewer (live while dragging)
    const facing = faceFromAngle(st.dragging ? st.angle : st.target);
    if (facing !== st.reported) {
      st.reported = facing;
      cb.current(facing);
    }

    // Push in for the label; further when magnified
    const narrow = size.width < 520;
    const reading = facing === 'back' && Math.abs(Math.sin(st.angle - st.target)) < 0.2;
    const base = narrow ? 7.6 : 6.8;
    // Reading: whole panel fits, levelled. Magnified: close-up that pans to the hovered row.
    const z = reading ? (magnify ? base - 3.1 : base - 0.7) : base;
    const rowIdx = highlight ? data.rows.findIndex((r) => r.id === highlight) : -1;
    const y = reading && magnify ? (rowIdx >= 0 ? rowWorldY(rowIdx) : rowWorldY(1.5)) : 0;
    camTarget.set(0, y, z);
    camera.position.lerp(camTarget, reduced ? 1 : 1 - Math.exp(-6 * dt));
    camera.lookAt(0, y, 0);
  });

  return (
    <group>
      <group ref={group}>
        <mesh>
          <boxGeometry args={[BOX.w, BOX.h, BOX.d]} />
          {/* +x, -x, +y, -y, +z, -z */}
          <meshStandardMaterial attach="material-0" map={right} roughness={0.55} emissive="#ffffff" emissiveMap={right} emissiveIntensity={0.22} />
          <meshStandardMaterial attach="material-1" map={left} roughness={0.55} emissive="#ffffff" emissiveMap={left} emissiveIntensity={0.22} />
          <meshStandardMaterial attach="material-2" color={capColor} roughness={0.6} />
          <meshStandardMaterial attach="material-3" color={capColor} roughness={0.6} />
          <meshStandardMaterial attach="material-4" map={front} roughness={0.45} emissive="#ffffff" emissiveMap={front} emissiveIntensity={0.18} />
          <meshStandardMaterial attach="material-5" map={back} roughness={0.6} emissive="#ffffff" emissiveMap={back} emissiveIntensity={0.5} />
        </mesh>
        {/* Thin edge lines read as carton folds */}
        <lineSegments geometry={edges}>
          <lineBasicMaterial color="#000" transparent opacity={0.35} />
        </lineSegments>
      </group>
      <mesh position={[0, -BOX.h / 2 - 0.25, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.5, 48]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function NutritionBoxScene({ active, onReady, ...rest }: NutritionBoxProps & SceneProps) {
  return (
    <CanvasShell active={active} onReady={onReady} camera={{ position: [0, 0, 6.6], fov: 32 }}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[2.5, 4, 5]} intensity={1.3} />
      <directionalLight position={[-4, 1, -4]} intensity={0.5} color={rest.data.band} />
      <Box {...rest} />
    </CanvasShell>
  );
}
