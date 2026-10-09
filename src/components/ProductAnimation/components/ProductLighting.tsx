import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { CONTAINER, SHAKER, productAssets } from '../config/assets';
import { useRig } from '../rig';
import { ease } from '../config/timeline';

/**
 * PRODUCT LIGHTING — modelled on the supplied studio reference video:
 * a dark room with black acoustic walls, one warm LED panel, cool overhead
 * fluorescent tubes and a polished concrete floor.
 *  - Environment built from Lightformers to match that room (black walls,
 *    warm square panel, slanted cool tubes, faint monitor glow). An HDRI can be
 *    layered underneath via productAssets.environment.
 *  - Direct lights: warm key (the panel's colour), cool top light (the tubes),
 *    warm + cool rims to cut the black jar out of the black room.
 *  - Practicals: the panel and tubes are also visible far behind the set, out of
 *    focus, catching bloom — the look of the reference.
 * Light level follows the story: black intro → lit reveal → fade-out outro.
 */
const WARM = '#ffcf9e';
const COOL = '#e4eeff';

export function ProductLighting() {
  const { quality, progress, reduced } = useRig();
  const scene = useThree((s) => s.scene);
  const key = useRef<THREE.DirectionalLight>(null);
  const top = useRef<THREE.DirectionalLight>(null);
  const warmRim = useRef<THREE.SpotLight>(null);
  const coolRim = useRef<THREE.SpotLight>(null);
  const practicals = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = reduced ? 0.9 : progress.current ?? 0;
    const level = ease(p, 0.05, 0.17) * (1 - ease(p, 0.955, 1));
    const macro = ease(p, 0.4, 0.46) * (1 - ease(p, 0.55, 0.6));
    (scene as unknown as { environmentIntensity: number }).environmentIntensity = 0.02 + level * (0.85 + macro * 0.25);
    if (key.current) key.current.intensity = level * (2.0 + macro * 0.9);
    if (top.current) top.current.intensity = level * 0.75;
    // Rims arrive first, so the silhouette appears before the front (reveal)
    const rim = ease(p, 0.04, 0.12) * (1 - ease(p, 0.95, 1));
    if (warmRim.current) warmRim.current.intensity = rim * 22;
    if (coolRim.current) coolRim.current.intensity = rim * 20;
    // Practicals switch on with the room, stay a touch lit into the outro
    if (practicals.current) practicals.current.userData.level = ease(p, 0.11, 0.2) * (1 - ease(p, 0.97, 1) * 0.7);
  });

  return (
    <>
      <Environment files={productAssets.environment ?? undefined} resolution={quality === 'high' ? 512 : 128} frames={1} environmentIntensity={0.8} background={false}>
        <color attach="background" args={['#020203']} />
        {/* Warm LED panel (square), back-left — the brightest thing in the room */}
        <Lightformer form="rect" intensity={7} color={WARM} position={[-2.8, 1.8, -0.6]} rotation-y={Math.PI / 2.4} scale={[1.2, 1.2, 1]} />
        {/* Front-left softbox: the long highlight down the jar + readable label */}
        <Lightformer form="rect" intensity={1.8} color="#fff0de" position={[-2.6, 1.6, 2.6]} rotation-y={Math.PI / 4} scale={[1.6, 3.2, 1]} />
        {/* Overhead fluorescent tubes, slanted like the reference ceiling */}
        {[-0.9, 0, 0.9].map((x, i) => (
          <Lightformer key={i} form="rect" intensity={3.2} color={COOL} position={[x, 3.4, -0.4 + i * 0.3]} rotation={[Math.PI / 2, 0, 0.35]} scale={[0.12, 4.2, 1]} />
        ))}
        {/* Monitor glow behind the set, cool and dim */}
        <Lightformer form="rect" intensity={0.7} color="#cfdcff" position={[0.8, 1.4, -3.4]} scale={[2.2, 1.2, 1]} />
        {/* Thin cool rim strip, right */}
        <Lightformer form="rect" intensity={2.2} color={COOL} position={[2.6, 1.2, -2]} rotation-y={-Math.PI / 4} scale={[0.3, 4, 1]} />
      </Environment>
      <directionalLight ref={key} position={[-2.2, 2.6, 2.6]} intensity={0} color="#ffe3c4" />
      <directionalLight ref={top} position={[0.3, 4, 0.5]} intensity={0} color={COOL} />
      <spotLight ref={warmRim} position={[-1.7, 1.5, -2.1]} angle={0.55} penumbra={0.9} intensity={0} color={WARM} distance={8} decay={2} target-position={[0, 0.45, 0]} />
      <spotLight ref={coolRim} position={[1.3, 1.7, -2.2]} angle={0.5} penumbra={0.9} intensity={0} color={COOL} distance={8} decay={2} target-position={[0.2, 0.4, 0]} />
      <StudioPracticals groupRef={practicals} />
      <ConcreteFloor size={8} />
      <GroundShadows />
    </>
  );
}

/**
 * The room's own lights, far behind the set: the warm square LED panel and two
 * slanted fluorescent tubes, drawn as pre-defocused glows (soft-edged cards) so
 * they read as out-of-focus practicals, as in the reference. Slightly above 1.0
 * so the brightest core catches a little bloom.
 */
function glowTexture(w: number, h: number, round: number) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = Math.round((256 * h) / w);
  const g = c.getContext('2d')!;
  const pad = 40;
  g.filter = 'blur(14px)';
  g.fillStyle = '#fff';
  g.beginPath();
  g.roundRect(pad, pad * (c.height / 256), c.width - pad * 2, c.height - pad * 2 * (c.height / 256), round);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function StudioPracticals({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  const mats = useMemo(() => {
    const mk = (map: THREE.Texture, color: string, k: number) => {
      const m = new THREE.MeshBasicMaterial({ map, color: new THREE.Color(color).multiplyScalar(k), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending });
      return { m, base: m.color.clone() };
    };
    return { panel: mk(glowTexture(1, 1, 18), WARM, 1.0), tube: mk(glowTexture(8, 1, 40), COOL, 0.9) };
  }, []);
  useFrame(() => {
    const l = (groupRef.current?.userData.level as number | undefined) ?? 0;
    for (const { m, base } of Object.values(mats)) m.color.copy(base).multiplyScalar(l);
  });
  return (
    <group ref={groupRef}>
      <mesh position={[1.15, 1.35, -3.9]} material={mats.panel.m}>
        <planeGeometry args={[0.9, 0.9]} />
      </mesh>
      <mesh position={[-0.6, 2.35, -4.2]} rotation-z={0.22} material={mats.tube.m}>
        <planeGeometry args={[2.2, 0.28]} />
      </mesh>
      <mesh position={[2.0, 2.25, -3.6]} rotation-z={-0.18} material={mats.tube.m}>
        <planeGeometry args={[1.8, 0.24]} />
      </mesh>
    </group>
  );
}

/**
 * Soft contact shadows under the jar, the shaker and the resting cap — blurred
 * radial decals that follow each object and fade as it lifts off the counter.
 * (Cheaper and steadier than a render-to-texture contact shadow.)
 */
function GroundShadows() {
  const { jar, shaker, jarCap } = useRig();
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,0.95)');
    grad.addColorStop(0.45, 'rgba(0,0,0,0.7)');
    grad.addColorStop(0.75, 'rgba(0,0,0,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  const blobs = useMemo(
    () =>
      [
        { ref: jar, r: CONTAINER.bodyRadius * 1.55, k: 0.85 },
        { ref: shaker, r: SHAKER.innerBottom * 1.7, k: 0.8 },
        { ref: jarCap, r: CONTAINER.cap.radius * 1.5, k: 0.7 },
      ].map((b) => ({ ...b, mesh: { current: null as THREE.Mesh | null }, mat: new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }) })),
    [jar, shaker, jarCap, tex],
  );
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    for (const b of blobs) {
      const o = b.ref.current;
      const m = b.mesh.current;
      if (!m) continue;
      if (!o || !isShown(o)) {
        m.visible = false;
        continue;
      }
      o.getWorldPosition(v);
      // the cap's pivot is at its bottom; the jar/shaker origins sit on the floor
      const h = b.ref === jarCap ? v.y : Math.max(0, v.y);
      m.visible = true;
      m.position.set(v.x, 0.0015, v.z);
      const lift = THREE.MathUtils.clamp(h / 0.25, 0, 1);
      m.scale.setScalar(b.r * 2 * (1 + lift * 0.6));
      b.mat.opacity = b.k * (1 - lift) * (1 - lift);
    }
  });
  return (
    <>
      {blobs.map((b, i) => (
        <mesh key={i} ref={(m) => void (b.mesh.current = m)} rotation-x={-Math.PI / 2} material={b.mat} renderOrder={1}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </>
  );
}
function isShown(o: THREE.Object3D | null) {
  for (let n = o; n; n = n.parent) if (!n.visible) return false;
  return true;
}

/** Polished concrete, like the reference room's floor: mottled, faint trowel sheen, soft edge falloff. */
function ConcreteFloor({ size }: { size: number }) {
  const { map, rough } = useMemo(() => {
    const N = 1024;
    const mk = () => {
      const c = document.createElement('canvas');
      c.width = c.height = N;
      return c;
    };
    const cm = mk();
    const g = cm.getContext('2d')!;
    g.fillStyle = '#323234';
    g.fillRect(0, 0, N, N);
    // mottling: many soft blotches of slightly different greys
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * N;
      const y = Math.random() * N;
      const r = 20 + Math.random() * 140;
      const v = 40 + Math.random() * 24;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${v},${v},${v + 2},0.18)`);
      grad.addColorStop(1, `rgba(${v},${v},${v + 2},0)`);
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // aggregate speckle
    const img = g.getImageData(0, 0, N, N);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 14 + (Math.random() < 0.004 ? 28 : 0);
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
    // roughness: trowel arcs read as slightly glossier sweeps
    const cr = mk();
    const h = cr.getContext('2d')!;
    h.fillStyle = '#8a8a8a';
    h.fillRect(0, 0, N, N);
    h.lineCap = 'round';
    for (let i = 0; i < 70; i++) {
      h.strokeStyle = `rgba(60,60,60,${0.03 + Math.random() * 0.04})`;
      h.lineWidth = 30 + Math.random() * 90;
      h.beginPath();
      const x = Math.random() * N;
      const y = Math.random() * N;
      h.arc(x, y, 150 + Math.random() * 400, Math.random() * 6, Math.random() * 6 + 1.2);
      h.stroke();
    }
    const t1 = new THREE.CanvasTexture(cm);
    t1.colorSpace = THREE.SRGBColorSpace;
    const t2 = new THREE.CanvasTexture(cr);
    for (const t of [t1, t2]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      t.anisotropy = 8;
    }
    return { map: t1, rough: t2 };
  }, []);
  // Opaque (writes depth, so AO and depth of field read it correctly); the edge
  // falls off to the room's black through vertex colours rather than transparency.
  const geo = useMemo(() => {
    const g = new THREE.RingGeometry(0.001, size / 2, 128, 24);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getY(i)) / (size / 2);
      const t = THREE.MathUtils.clamp((r - 0.18) / 0.6, 0, 1);
      const v = 1 - t * t * (3 - 2 * t);
      col.set([v, v, v], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [size]);
  return (
    <mesh geometry={geo} position={[0, 0, 0]} rotation-x={-Math.PI / 2} receiveShadow>
      <meshPhysicalMaterial map={map} roughnessMap={rough} roughness={0.7} metalness={0} envMapIntensity={0.4} vertexColors />
    </mesh>
  );
}
