/** Flat low-poly silhouette that scales with the same mass/definition params as the 3D figure. */
export function FigureFallback({ mass, definition, tint }: { mass: number; definition: number; tint: string }) {
  const sh = 34 + mass * 16; // shoulder half-width
  const wa = 20 + mass * 12 - definition * 4; // waist half-width
  const arm = 7 + mass * 5;
  const leg = 10 + mass * 5;
  const path = `M100 64 L${100 + sh} 76 L${100 + sh - 4} 120 L${100 + wa} 150 L${100 + wa + 4} 170 L${100 - wa - 4} 170 L${100 - wa} 150 L${100 - sh + 4} 120 L${100 - sh} 76 Z`;
  return (
    <svg viewBox="0 0 200 300" className="h-full w-auto transition-all" aria-hidden>
      <g fill="#26262b" stroke={tint} strokeOpacity=".5" strokeWidth="1" strokeLinejoin="round" style={{ transition: 'all .6s' }}>
        <polygon points="100,22 114,32 114,50 100,60 86,50 86,32" />
        <path d={path} />
        <rect x={100 + sh - 2} y="78" width={arm} height="86" rx={arm / 2} />
        <rect x={100 - sh - arm + 2} y="78" width={arm} height="86" rx={arm / 2} />
        <rect x={100 + 4} y="172" width={leg} height="110" rx={leg / 2} />
        <rect x={100 - 4 - leg} y="172" width={leg} height="110" rx={leg / 2} />
      </g>
    </svg>
  );
}
