/**
 * SCROLL CHOREOGRAPHY
 * The whole sequence is a function of one scroll progress value p ∈ [0, 1].
 * Every scene reads its own window from here, so beats can be re-timed in one place.
 */
export const BEATS = {
  intro: [0.0, 0.1],
  reveal: [0.1, 0.25],
  interaction: [0.25, 0.4],
  macro: [0.4, 0.55],
  pour: [0.55, 0.7],
  mixing: [0.7, 0.82],
  hero: [0.82, 0.95],
  outro: [0.95, 1.0],
} as const;

export type BeatId = keyof typeof BEATS;

export const BEAT_LABELS: Record<BeatId, string> = {
  intro: 'Brand',
  reveal: 'Reveal',
  interaction: 'Open',
  macro: 'Powder',
  pour: 'Scoop',
  mixing: 'Shake',
  hero: 'Hero',
  outro: 'Outro',
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Linear 0→1 across [a, b] */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/** Smoothstep 0→1 across [a, b] */
export const ease = (p: number, a: number, b: number) => {
  const t = seg(p, a, b);
  return t * t * (3 - 2 * t);
};

/** Ease-in-out cubic for camera-like moves */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Local progress within a named beat */
export const beat = (p: number, id: BeatId) => seg(p, BEATS[id][0], BEATS[id][1]);

export const beatAt = (p: number): BeatId => (Object.keys(BEATS) as BeatId[]).find((k) => p <= BEATS[k][1]) ?? 'outro';
