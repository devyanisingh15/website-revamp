import { BEATS, beat, ease } from '../config/timeline';
import { productAssets } from '../config/assets';

/** SCENE 1 — BRAND INTRO, DOM layer: the logo fades in with a very slight scale. */
export function IntroOverlay({ p }: { p: number }) {
  const t = beat(p, 'intro');
  const opacity = ease(p, 0.005, 0.04) * (1 - ease(p, BEATS.intro[1] - 0.02, BEATS.intro[1] + 0.03));
  return (
    <div className="pa-overlay pa-center" style={{ opacity }} aria-hidden={opacity < 0.05}>
      <img src={productAssets.logo} alt="MuscleBlaze" width={520} height={96} className="pa-logo" style={{ transform: `scale(${1 + t * 0.04})` }} />
    </div>
  );
}
