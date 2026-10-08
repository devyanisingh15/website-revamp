import { useId } from 'react';
import type { ProductArt as Art } from '@/data/types';
import { cx } from '@/lib/format';

/**
 * Parametric vector packshot. Serves as:
 *  - the static product render shown before 3D loads (LCP-friendly, zero network)
 *  - the permanent fallback when WebGL is unavailable or motion is reduced
 *  - catalogue imagery until real photography is supplied
 */

function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

interface Props {
  art: Art;
  /** Flavour band colour */
  band?: string;
  /** Protein callout, e.g. 25 → "25g PROTEIN" */
  protein?: number | null;
  className?: string;
  title?: string;
  shadow?: boolean;
}

export function ProductArt({ art, band = '#e8202a', protein, className, title, shadow = true }: Props) {
  const uid = useId().replace(/:/g, '');
  const dark = lum(art.body) < 0.5;
  const ink = dark ? '#f2efe9' : '#0a0a0b';
  const muted = dark ? 'rgba(242,239,233,.55)' : 'rgba(10,10,11,.55)';
  const shade = `${uid}-shade`;
  const gloss = `${uid}-gloss`;

  const defs = (
    <defs>
      <linearGradient id={shade} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity=".55" />
        <stop offset=".18" stopColor="#000" stopOpacity=".05" />
        <stop offset=".42" stopColor="#fff" stopOpacity=".14" />
        <stop offset=".55" stopColor="#fff" stopOpacity="0" />
        <stop offset=".85" stopColor="#000" stopOpacity=".25" />
        <stop offset="1" stopColor="#000" stopOpacity=".6" />
      </linearGradient>
      <linearGradient id={gloss} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".18" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
  );

  const floor = shadow ? <ellipse cx="100" cy="252" rx="70" ry="7" fill="#000" opacity=".35" /> : null;

  const brand = (y: number, size = 8) => (
    <text x="100" y={y} textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="700" fontSize={size} letterSpacing="2.2" fill={muted}>
      MUSCLEBLAZE
    </text>
  );

  const labelText = (y: number, size = 22) => (
    <>
      <text
        x="100"
        y={y}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontWeight="850"
        fontSize={size}
        letterSpacing="-0.5"
        style={{ fontVariationSettings: "'wdth' 118" }}
        fill={ink}
      >
        {art.label}
      </text>
      {art.sub && (
        <text x="100" y={y + size * 0.62} textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="600" fontSize={size * 0.36} letterSpacing="1.6" fill={band}>
          {art.sub}
        </text>
      )}
    </>
  );

  const proteinChip = (y: number) =>
    protein != null ? (
      <g>
        <rect x="70" y={y} width="60" height="15" rx="2" fill={band} />
        <text x="100" y={y + 10.5} textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="600" fontSize="7.5" fill={lum(band) > 0.55 ? '#0a0a0b' : '#fff'}>
          {protein}g PROTEIN
        </text>
      </g>
    ) : null;

  let body: React.ReactNode;
  switch (art.shape) {
    case 'tub':
    case 'tub-wide': {
      const w = art.shape === 'tub' ? 120 : 140;
      const x = 100 - w / 2;
      body = (
        <>
          {floor}
          {/* body */}
          <path d={`M${x} 62 L${x + 4} 240 Q100 252 ${x + w - 4} 240 L${x + w} 62 Z`} fill={art.body} />
          {/* band */}
          <path d={`M${x + 1.5} 128 L${x + 3} 196 Q100 205 ${x + w - 3} 196 L${x + w - 1.5} 128 Q100 137 ${x + 1.5} 128 Z`} fill={band} opacity=".92" />
          <path d={`M${x} 62 L${x + 4} 240 Q100 252 ${x + w - 4} 240 L${x + w} 62 Z`} fill={`url(#${shade})`} />
          {/* lid */}
          <rect x={x - 4} y="34" width={w + 8} height="30" rx="4" fill={dark ? '#0a0a0b' : '#1a1a1d'} />
          <rect x={x - 4} y="34" width={w + 8} height="30" rx="4" fill={`url(#${shade})`} />
          <ellipse cx="100" cy="35" rx={w / 2 + 4} ry="7" fill={dark ? '#26262a' : '#2a2a2e'} />
          <ellipse cx="100" cy="35" rx={w / 2 - 6} ry="4.5" fill={`url(#${gloss})`} />
          {brand(84)}
          {labelText(112, art.label.length > 8 ? 17 : 24)}
          {art.bandText && (
            <text x="100" y="172" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="800" fontSize="11" letterSpacing="1" fill={lum(band) > 0.55 ? '#0a0a0b' : '#fff'}>
              {art.bandText}
            </text>
          )}
          {proteinChip(212)}
        </>
      );
      break;
    }
    case 'jar':
      body = (
        <>
          {floor}
          <rect x="45" y="100" width="110" height="146" rx="10" fill={art.body} />
          <rect x="45" y="150" width="110" height="46" fill={band} opacity=".9" />
          <rect x="45" y="100" width="110" height="146" rx="10" fill={`url(#${shade})`} />
          <rect x="50" y="76" width="100" height="28" rx="4" fill="#0f0f11" />
          <rect x="50" y="76" width="100" height="28" rx="4" fill={`url(#${shade})`} />
          {brand(124, 7)}
          {labelText(140, art.label.length > 7 ? 15 : 20)}
          {proteinChip(214)}
        </>
      );
      break;
    case 'bottle':
      body = (
        <>
          {floor}
          <path d="M66 96 Q66 84 80 80 L120 80 Q134 84 134 96 L134 240 Q100 250 66 240 Z" fill={art.body} />
          <rect x="66" y="140" width="68" height="58" fill={band} opacity=".9" />
          <path d="M66 96 Q66 84 80 80 L120 80 Q134 84 134 96 L134 240 Q100 250 66 240 Z" fill={`url(#${shade})`} />
          <rect x="80" y="50" width="40" height="32" rx="3" fill="#111" />
          <rect x="80" y="50" width="40" height="32" rx="3" fill={`url(#${shade})`} />
          {brand(120, 6)}
          <text x="100" y="174" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="850" fontSize={art.label.length > 8 ? 9 : 12} fill={lum(band) > 0.55 ? '#0a0a0b' : '#fff'}>
            {art.label}
          </text>
          {art.sub && (
            <text x="100" y="186" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill={lum(band) > 0.55 ? '#0a0a0b' : '#fff'}>
              {art.sub}
            </text>
          )}
        </>
      );
      break;
    case 'bar':
      body = (
        <>
          {floor}
          <g transform="rotate(-14 100 160)">
            <path d="M18 132 L30 126 L170 126 L182 132 L182 188 L170 194 L30 194 L18 188 Z" fill={art.body} />
            <rect x="30" y="126" width="46" height="68" fill={band} opacity=".9" />
            <path d="M18 132 L30 126 L170 126 L182 132 L182 188 L170 194 L30 194 L18 188 Z" fill={`url(#${gloss})`} />
            <text x="124" y="156" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="700" fontSize="6.5" letterSpacing="1.8" fill={muted}>
              MUSCLEBLAZE
            </text>
            <text x="124" y="174" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="850" fontSize="13" fill={ink} style={{ fontVariationSettings: "'wdth' 118" }}>
              {art.label}
            </text>
          </g>
        </>
      );
      break;
    case 'sachet':
      body = (
        <>
          {floor}
          {[-24, 0].map((dx, i) => (
            <g key={i} transform={`translate(${dx} ${i === 0 ? 12 : 0}) rotate(${i === 0 ? -8 : 4} 100 150)`}>
              <path d="M52 58 L148 58 L150 242 L50 242 Z" fill={art.body} />
              <path d="M52 58 L148 58 L148 70 L52 70 Z" fill="#000" opacity=".25" />
              <rect x="51" y="150" width="98" height="50" fill={band} opacity=".92" />
              <path d="M52 58 L148 58 L150 242 L50 242 Z" fill={`url(#${shade})`} />
              {i === 1 && (
                <>
                  {brand(98, 6.5)}
                  {labelText(124, 16)}
                  <text x="100" y="180" textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="600" fontSize="9" fill={lum(band) > 0.55 ? '#0a0a0b' : '#fff'}>
                    36 g · 1 SERVE
                  </text>
                </>
              )}
            </g>
          ))}
        </>
      );
      break;
    case 'shaker':
      body = (
        <>
          {floor}
          <path d="M64 80 L70 242 Q100 250 130 242 L136 80 Z" fill={art.body} opacity=".92" />
          <path d="M66 150 L68 242 Q100 250 132 242 L134 150 Z" fill={band} opacity=".35" />
          <path d="M64 80 L70 242 Q100 250 130 242 L136 80 Z" fill={`url(#${shade})`} />
          {[110, 130, 150, 170, 190, 210].map((y) => (
            <line key={y} x1="122" x2="130" y1={y} y2={y} stroke={muted} strokeWidth="1" />
          ))}
          <rect x="60" y="56" width="80" height="26" rx="3" fill="#0a0a0b" />
          <rect x="88" y="36" width="24" height="22" rx="3" fill={band} />
          <text x="96" y="170" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="900" fontSize="22" fill={ink} style={{ fontVariationSettings: "'wdth' 118" }}>
            MB
          </text>
        </>
      );
      break;
    case 'pouch':
    default:
      body = (
        <>
          {floor}
          <path d="M48 64 Q100 56 152 64 L160 236 Q100 250 40 236 Z" fill={art.body} />
          <path d="M45 150 L155 150 L158 200 Q100 210 42 200 Z" fill={band} opacity=".9" />
          <path d="M48 64 Q100 56 152 64 L160 236 Q100 250 40 236 Z" fill={`url(#${shade})`} />
          <path d="M48 64 Q100 56 152 64 L152 76 Q100 68 48 76 Z" fill="#000" opacity=".18" />
          {brand(98, 7)}
          {labelText(126, 22)}
          {proteinChip(214)}
        </>
      );
  }

  return (
    <svg viewBox="0 0 200 260" className={cx('h-auto w-full', className)} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {defs}
      {body}
    </svg>
  );
}
