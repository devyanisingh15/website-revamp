import { useEffect, useRef } from 'react';
import { ease, seg } from '../config/timeline';
import { productAssets } from '../config/assets';

/**
 * Transparent hand footage, scrubbed by scroll across the interaction beat.
 * Renders nothing until productAssets.handFootage is configured.
 */
export function HandFootageLayer({ p }: { p: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const { webm, mov } = productAssets.handFootage;
  const local = seg(p, 0.25, 0.4);
  useEffect(() => {
    const v = video.current;
    if (!v || !v.duration) return;
    v.currentTime = local * v.duration;
  }, [local]);
  if (!webm && !mov) return null;
  const opacity = ease(p, 0.25, 0.28) * (1 - ease(p, 0.38, 0.41));
  return (
    <video ref={video} className="pa-hands" muted playsInline preload="auto" style={{ opacity }} aria-hidden>
      {mov && <source src={mov} type='video/quicktime; codecs="hvc1"' />}
      {webm && <source src={webm} type="video/webm" />}
    </video>
  );
}
