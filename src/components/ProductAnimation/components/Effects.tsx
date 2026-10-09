import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, DepthOfField, N8AO, ToneMapping, Vignette, Noise, Bloom } from '@react-three/postprocessing';
import { ToneMappingMode, BlendFunction, type DepthOfFieldEffect } from 'postprocessing';
import { useRig } from '../rig';

/**
 * CINEMATIC POST
 *  - Depth of field focused on a world-space point driven by the camera
 *    (Background → Product → Label → Powder → Shaker), bokeh per shot.
 *  - Light ambient occlusion for contact realism (desktop).
 *  - Bloom on HDR-bright pixels only (the studio practicals behind the set).
 *  - ACES tone mapping, faint film grain and vignette.
 * Mobile: half-resolution DOF with smaller bokeh, no AO or grain.
 */
export function Effects() {
  const { quality, focus, bokeh, reduced } = useRig();
  const dof = useRef<DepthOfFieldEffect>(null);
  const high = quality === 'high';

  useFrame(() => {
    const e = dof.current;
    if (!e) return;
    e.target = focus;
    const b = reduced ? 0.8 : bokeh.current ?? 0;
    e.bokehScale = high ? b : b * 0.55;
  });

  return (
    <EffectComposer multisampling={high ? 4 : 0} enableNormalPass={false}>
      {high ? <N8AO halfRes aoRadius={0.18} distanceFalloff={0.6} intensity={1.4} quality="performance" /> : <></>}
      <DepthOfField ref={dof} worldFocusRange={high ? 0.2 : 0.32} bokehScale={1} resolutionScale={high ? 1 : 0.5} />
      {high ? <Bloom mipmapBlur luminanceThreshold={1.1} luminanceSmoothing={0.2} intensity={0.55} /> : <></>}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.32} darkness={0.55} />
      {high ? <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.22} /> : <></>}
    </EffectComposer>
  );
}
