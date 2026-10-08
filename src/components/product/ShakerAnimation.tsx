import { useEffect, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMedia';
import { cx } from '@/lib/format';

export const HOW_TO_STEPS = [
  'Add 1 scoop to 180–200 ml cold water or milk.',
  'Shake for 20 seconds.',
  'Drink within 30 minutes of your workout, or anytime you need a protein boost.',
];

/**
 * Shaker fills → shakes → pours. Plays on enter, cycles through the three
 * steps; reduced motion shows the steps as static states the user can pick.
 */
export function ShakerAnimation({ powder = '#5b3322' }: { powder?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.35 });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!inView || reduced || !auto) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 3), 2600);
    return () => clearInterval(t);
  }, [inView, reduced, auto]);

  const fill = step === 0 ? 0.62 : step === 1 ? 0.62 : 0.25;

  return (
    <div ref={ref} className="grid items-center gap-10 md:grid-cols-2">
      <div className="relative mx-auto aspect-square w-full max-w-[360px]">
        <svg viewBox="0 0 240 240" className="size-full" aria-hidden>
          <defs>
            <clipPath id="shaker-body">
              <path d="M78 70 L84 206 Q120 214 156 206 L162 70 Z" />
            </clipPath>
          </defs>
          <g
            style={{
              transformOrigin: '120px 140px',
              transition: 'transform .8s var(--ease-out-expo)',
              transform: step === 2 ? 'rotate(-58deg) translate(-10px,-30px)' : 'none',
              animation: step === 1 && !reduced ? 'shake .18s ease-in-out infinite alternate' : 'none',
            }}
          >
            {/* liquid */}
            <g clipPath="url(#shaker-body)">
              <rect x="70" y={206 - 136 * fill} width="100" height="160" fill={step === 0 ? '#f2efe9' : powder} opacity={step === 0 ? 0.25 : 0.95} style={{ transition: 'all .9s var(--ease-out-expo)' }} />
              {step === 1 && <rect x="70" y={206 - 136 * fill - 6} width="100" height="10" fill="#fff" opacity=".25" />}
            </g>
            <path d="M78 70 L84 206 Q120 214 156 206 L162 70 Z" fill="none" stroke="#f2efe9" strokeOpacity=".6" strokeWidth="2.5" />
            {[100, 125, 150, 175].map((y) => (
              <line key={y} x1="146" x2="156" y1={y} y2={y} stroke="#f2efe9" strokeOpacity=".4" />
            ))}
            <rect x="72" y="50" width="96" height="22" rx="3" fill="#2a2a2e" />
            <rect x="106" y="34" width="28" height="18" rx="3" fill="#e8202a" />
          </g>
          {/* scoop dropping powder */}
          <g style={{ opacity: step === 0 ? 1 : 0, transition: 'opacity .4s', transform: step === 0 ? 'translateY(0)' : 'translateY(-20px)' }}>
            <path d="M150 20 q20 16 40 0" fill="#3a3a40" />
            <rect x="188" y="10" width="34" height="5" rx="2" fill="#3a3a40" transform="rotate(-12 188 10)" />
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={i} cx={160 + i * 4} cy={34 + i * 6} r="2.5" fill={powder} style={{ animation: reduced ? 'none' : `drop 1s ${i * 0.12}s ease-in infinite` }} />
            ))}
          </g>
          {/* pour stream */}
          {step === 2 && <path d="M58 92 Q40 140 46 220" stroke={powder} strokeWidth="6" fill="none" strokeLinecap="round" style={{ animation: reduced ? 'none' : 'pour .8s ease-out both' }} strokeDasharray="160" />}
          <style>{`
            @keyframes shake { from { transform: rotate(-9deg) translateY(-4px) } to { transform: rotate(9deg) translateY(4px) } }
            @keyframes drop { from { transform: translateY(0); opacity: 1 } to { transform: translateY(60px); opacity: 0 } }
            @keyframes pour { from { stroke-dashoffset: 160 } to { stroke-dashoffset: 0 } }
          `}</style>
        </svg>
        <span className="absolute left-0 top-0 font-mono text-[11px] uppercase tracking-wider text-bone-400">
          {step === 1 ? '20 s' : step === 0 ? '180–200 ml' : '≤ 30 min'}
        </span>
      </div>
      <ol className="space-y-3">
        {HOW_TO_STEPS.map((s, i) => (
          <li key={i}>
            <button
              onClick={() => {
                setAuto(false);
                setStep(i);
              }}
              aria-current={step === i ? 'step' : undefined}
              className={cx('flex w-full gap-5 rounded-sm border p-5 text-left transition-colors', step === i ? 'border-blaze-500/60 bg-white/[0.03]' : 'hairline opacity-60 hover:opacity-100')}
            >
              <span className="display-tight text-3xl text-blaze-500">{i + 1}</span>
              <span className="pt-1 text-[15px] leading-relaxed">{s}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
