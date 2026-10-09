import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRig } from '../rig';
import { ease, seg } from '../config/timeline';
import { SHAKER } from '../config/assets';
import { POUR } from './PourScene';
import { ShakerModel, useShakerContents, CLUMPS } from '../components/ShakerModel';

/**
 * SCENE 6 — SHAKER (≈70–82%)
 * 1 powder settles in the cup (during the pour)  2 water is poured in
 * 3 cap assembly is set on and screwed  4 energetic shake with liquid slosh
 * 5 powder clumps dissolve and the liquid turns to shake.
 * Owns: shaker visibility + motion, shaker cap, liquid, pile, clumps, water stream.
 */
const FILL = 0.3; // metres of liquid (~55% of the cup)
const WATER = new THREE.Color('#bcd2da');
const CAP_REST = { x: 0.3, y: -308.27 * SHAKER.scale, z: -0.16 };

export function MixingScene() {
  const { progress, shaker, shakerCap, powderColor, quality } = useRig();
  const contents = useShakerContents();
  const mixed = useMemo(() => new THREE.Color(powderColor).lerp(new THREE.Color('#ffffff'), 0.12), [powderColor]);
  const tmpC = useMemo(() => new THREE.Color(), []);
  const stream = useMemo(() => ({ ref: { current: null as THREE.Mesh | null } }), []);
  const clumpSeeds = useMemo(
    () => Array.from({ length: CLUMPS }, (_, i) => ({ a: i * 2.39996, r: Math.sqrt(((i * 7919) % CLUMPS) / CLUMPS) * 0.11, y: ((i * 104729) % CLUMPS) / CLUMPS, s: 0.005 + ((i * 31) % 10) * 0.0012 })),
    [],
  );
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const sc = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const p = progress.current ?? 0;
    const sh = shaker.current;
    if (!sh) return;
    // The shaker joins the set as the camera follows the scoop out of the jar
    sh.visible = p > 0.53;

    // --- cap assembly: resting on the counter → set on → screwed ---
    const on = ease(p, 0.73, 0.76);
    const screw = ease(p, 0.755, 0.775);
    if (shakerCap.current) {
      const c = shakerCap.current;
      c.position.set(CAP_REST.x * (1 - on), CAP_REST.y * (1 - on) + Math.sin(Math.PI * on) * 0.16 + (1 - screw) * on * 0.01, CAP_REST.z * (1 - on));
      c.rotation.set(0, (1 - screw) * on * -Math.PI * 1.5, Math.sin(Math.PI * on) * 0.2);
    }

    // --- shake: deterministic oscillation scrubbed by scroll ---
    const shake = ease(p, 0.775, 0.785) * (1 - ease(p, 0.805, 0.815));
    const phase = seg(p, 0.775, 0.815) * 8 * Math.PI * 2;
    const lift = ease(p, 0.77, 0.782) * (1 - ease(p, 0.806, 0.818)) * 0.2;
    sh.position.set(SHAKER.position[0] + Math.sin(phase) * 0.02 * shake, lift + Math.abs(Math.sin(phase)) * 0.05 * shake, SHAKER.position[2]);
    sh.rotation.set(Math.sin(phase * 0.5) * 0.05 * shake, -0.5, Math.sin(phase) * 0.32 * shake);

    // --- powder pile from the pour, then dissolving ---
    const pile = ease(p, POUR.start + 0.01, POUR.end + 0.02) * (1 - ease(p, 0.775, 0.81));
    if (contents.powderPile.current) contents.powderPile.current.scale.y = Math.max(0.0001, pile);

    // --- water pour + level ---
    const fill = ease(p, 0.7, 0.735);
    if (contents.liquid.current) {
      const l = contents.liquid.current;
      l.visible = fill > 0.01;
      l.scale.y = Math.max(0.0001, fill * FILL);
      l.position.y = 0.012 + (fill * FILL) / 2;
    }
    if (contents.liquidTop.current) {
      const t = contents.liquidTop.current;
      t.visible = fill > 0.01;
      t.position.y = 0.012 + fill * FILL;
      // slosh: surface tilts against the shake
      t.rotation.set(-Math.PI / 2 - Math.sin(phase + 0.6) * 0.25 * shake, 0, Math.cos(phase) * 0.12 * shake);
    }
    const mix = ease(p, 0.78, 0.81);
    tmpC.copy(WATER).lerp(mixed, mix);
    if (contents.liquidMat.current) {
      contents.liquidMat.current.color.copy(tmpC);
      contents.liquidMat.current.opacity = THREE.MathUtils.lerp(0.72, 0.97, mix);
    }
    const topMat = contents.liquidTop.current?.material as THREE.MeshPhysicalMaterial | undefined;
    if (topMat) {
      topMat.color.copy(tmpC);
      topMat.opacity = THREE.MathUtils.lerp(0.6, 1, mix);
    }

    // --- clumps tumble in the liquid and shrink as they dissolve ---
    const cl = contents.clumps.current;
    if (cl) {
      const n = quality === 'high' ? CLUMPS : 50;
      const show = ease(p, 0.735, 0.75) * (1 - mix);
      cl.visible = show > 0.01;
      for (let i = 0; i < n; i++) {
        const s = clumpSeeds[i];
        const ang = s.a + phase * 0.6 * shake;
        v.set(Math.cos(ang) * s.r, 0.02 + s.y * fill * FILL * 0.9, Math.sin(ang) * s.r);
        q.setFromAxisAngle(v.clone().normalize(), ang);
        m4.compose(v, q, sc.setScalar(s.s * show));
        cl.setMatrixAt(i, m4);
      }
      cl.instanceMatrix.needsUpdate = true;
    }

    // --- water stream from above while filling ---
    const st = stream.ref.current;
    if (st) {
      const flowing = p > 0.698 && p < 0.737;
      st.visible = flowing;
      const top = 1.3;
      const bottom = 0.012 + fill * FILL;
      st.scale.y = top - bottom;
      st.position.set(SHAKER.position[0] + 0.02, bottom + (top - bottom) / 2, SHAKER.position[2]);
    }
  });

  return (
    <>
      <ShakerModel contents={contents} />
      <mesh ref={(m) => (stream.ref.current = m)} visible={false}>
        <cylinderGeometry args={[0.009, 0.006, 1, 16, 1, true]} />
        <meshPhysicalMaterial color="#e7eef0" roughness={0.05} clearcoat={1} transparent opacity={0.55} />
      </mesh>
    </>
  );
}
