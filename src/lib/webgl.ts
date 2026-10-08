let cached: boolean | null = null;

/** True when a WebGL context can be created. Cached after the first probe. */
export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    cached = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  // Manual override for QA: ?no3d forces every fallback
  if (new URLSearchParams(location.search).has('no3d')) cached = false;
  return cached;
}

/** Resolves after first paint + idle, so 3D never competes with LCP. */
export function afterFirstPaint(): Promise<void> {
  return new Promise((resolve) => {
    const go = () => {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) ric(() => resolve(), { timeout: 1500 });
      else setTimeout(resolve, 200);
    };
    if (document.readyState === 'complete') requestAnimationFrame(() => requestAnimationFrame(go));
    else window.addEventListener('load', () => requestAnimationFrame(go), { once: true });
  });
}
