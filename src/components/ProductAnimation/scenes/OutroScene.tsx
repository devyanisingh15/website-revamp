import { BEATS, ease } from '../config/timeline';
import { productAssets } from '../config/assets';

/**
 * SCENE 8 — BRAND OUTRO (95–100%)
 * The camera pulls back while ProductLighting fades the set to black; the logo
 * and strapline fade up over it. Clean, minimal, premium.
 */
export function OutroOverlay({ p }: { p: number }) {
  const opacity = ease(p, BEATS.outro[0] + 0.005, 0.99);
  return (
    <div className="pa-overlay pa-center pa-outro" style={{ opacity, background: `rgba(5,5,6,${opacity * 0.92})` }} aria-hidden={opacity < 0.05}>
      <img src={productAssets.logo} alt="" width={520} height={96} className="pa-logo" style={{ transform: `scale(${0.98 + opacity * 0.02})` }} />
      <p className="pa-strap">Proof in Every Scoop.</p>
    </div>
  );
}
