import { Environment, Lightformer } from '@react-three/drei';

/**
 * Studio lighting built from local Lightformers — no HDR download.
 * Gives soft rim + key reflections on the tub's glossy plastic.
 */
export function StudioLights({ accent = '#e8202a', intensity = 1 }: { accent?: string; intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.25 * intensity} />
      <directionalLight position={[3, 5, 4]} intensity={1.6 * intensity} />
      <directionalLight position={[-4, 2, -3]} intensity={0.8 * intensity} color={accent} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[5, 0, -1]} rotation-y={-Math.PI / 2} scale={[3, 6, 1]} color={accent} />
        <Lightformer form="circle" intensity={1} position={[0, -3, 2]} scale={2} />
      </Environment>
    </>
  );
}
