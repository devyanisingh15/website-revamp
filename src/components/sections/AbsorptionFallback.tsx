import { cx } from '@/lib/format';

/**
 * Static 4-state diagram used when 3D is unavailable or motion is reduced.
 * Carries the same story as the scroll-scrubbed scene.
 */
export function AbsorptionFallback({ stages, active, className }: { stages: { title: string }[]; active?: number; className?: string }) {
  const dots = (n: number, f: (i: number) => [number, number], color = '#efe6d4') =>
    Array.from({ length: n }).map((_, i) => {
      const [x, y] = f(i);
      return <circle key={i} cx={x} cy={y} r={2.2} fill={color} />;
    });
  const rnd = (i: number, s: number) => {
    const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  const panels = [
    // scoop mound
    <g key="0">
      <path d="M20 70 Q60 110 100 70" fill="none" stroke="#3a3a40" strokeWidth="4" />
      {dots(70, (i) => {
        const a = rnd(i, 1) * Math.PI;
        const r = Math.sqrt(rnd(i, 2)) * 36;
        return [60 + Math.cos(a) * r, 70 - Math.sin(a) * r * 0.55];
      })}
    </g>,
    // particles
    <g key="1">{dots(70, (i) => [15 + rnd(i, 3) * 90, 20 + rnd(i, 4) * 70])}</g>,
    // chains
    <g key="2">
      {Array.from({ length: 12 }).map((_, c) => {
        const x = 18 + rnd(c, 5) * 80;
        const y = 22 + rnd(c, 6) * 62;
        const a = rnd(c, 7) * Math.PI;
        return (
          <g key={c}>
            {[0, 1, 2, 3].map((k) => (
              <circle key={k} cx={x + Math.cos(a) * k * 6} cy={y + Math.sin(a) * k * 6} r={2.4} fill={c % 4 === 0 ? '#46e891' : '#efe6d4'} />
            ))}
          </g>
        );
      })}
    </g>,
    // fibre
    <g key="3">
      {[34, 50, 66].map((y) => (
        <rect key={y} x="10" y={y - 7} width="100" height="14" rx="7" fill="#7a1018" opacity=".8" />
      ))}
      {dots(54, (i) => [12 + rnd(i, 8) * 96, [34, 50, 66][i % 3] + (rnd(i, 9) - 0.5) * 12], '#ff4a50')}
    </g>,
  ];
  return (
    <ol className={cx('grid grid-cols-2 gap-3 md:grid-cols-4', className)}>
      {stages.map((s, i) => (
        <li key={s.title} className={cx('rounded-md border p-3 transition-colors', active === i ? 'border-blaze-500/60 bg-white/[0.03]' : 'hairline')}>
          <svg viewBox="0 0 120 100" className="w-full" aria-hidden>
            {panels[i]}
          </svg>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-bone-400">
            <span className="text-blaze-500">0{i + 1}</span> {s.title}
          </p>
        </li>
      ))}
    </ol>
  );
}
