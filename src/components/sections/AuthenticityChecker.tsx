import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ShieldX, FileText, Hand, QrCode } from 'lucide-react';
import { verifyCode, lookupLabReport, DEMO_CODES, type VerifyResult, type LabReport } from '@/lib/api/authenticity';
import { Field } from '../ui/Field';
import { Button } from '../ui/Button';
import { MockTag } from '../ui/Placeholder';
import { useReducedMotion } from '@/hooks/useMedia';
import { cx } from '@/lib/format';

/* ------------------------------------------------------------------
   Scratch sticker — canvas scratch-off with a keyboard/button fallback
   ------------------------------------------------------------------ */
export function ScratchSticker({ code, onReveal }: { code: string; onReveal: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { width, height } = c.getBoundingClientRect();
    c.width = width * dpr;
    c.height = height * dpr;
    const g = c.getContext('2d')!;
    g.scale(dpr, dpr);
    // Foil
    const grad = g.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#9b958a');
    grad.addColorStop(0.5, '#c9c3b7');
    grad.addColorStop(1, '#8a8478');
    g.fillStyle = grad;
    g.fillRect(0, 0, width, height);
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.font = '600 11px "JetBrains Mono", monospace';
    g.textAlign = 'center';
    for (let y = 14; y < height; y += 18) g.fillText('SCRATCH · SCRATCH · SCRATCH · SCRATCH', width / 2, y);

    let drawing = false;
    let moves = 0;
    const pos = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const scratch = (e: PointerEvent) => {
      const [x, y] = pos(e);
      g.globalCompositeOperation = 'destination-out';
      g.beginPath();
      g.arc(x, y, 16, 0, Math.PI * 2);
      g.fill();
      if (++moves % 12 === 0) check();
    };
    const check = () => {
      const data = g.getImageData(0, 0, c.width, c.height).data;
      let clear = 0;
      for (let i = 3; i < data.length; i += 32) if (data[i] === 0) clear++;
      if (clear / (data.length / 32) > 0.5) finish();
    };
    const down = (e: PointerEvent) => {
      drawing = true;
      c.setPointerCapture(e.pointerId);
      scratch(e);
    };
    const move = (e: PointerEvent) => drawing && scratch(e);
    const up = () => (drawing = false);
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    return () => {
      c.removeEventListener('pointerdown', down);
      c.removeEventListener('pointermove', move);
      c.removeEventListener('pointerup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    setRevealed(true);
    onReveal();
  };

  return (
    <div className="relative">
      <div className="relative aspect-[2.2/1] w-full overflow-hidden rounded-sm border border-black/10 bg-[#efeae0] text-ink-950 shadow-[inset_0_0_0_6px_#e3ddd1]">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">Authenticity code</span>
          <span className="font-mono text-xl font-semibold tracking-[0.12em] sm:text-2xl">{code}</span>
        </div>
        <canvas
          ref={canvas}
          className={cx('absolute inset-0 size-full touch-none cursor-crosshair transition-opacity duration-500', revealed && 'pointer-events-none opacity-0')}
          aria-hidden
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-ink-500">
        <span className="flex items-center gap-1.5">
          <Hand className="size-3.5" aria-hidden /> {revealed ? 'Code revealed' : 'Scratch the foil to reveal'}
        </span>
        {!revealed && (
          <button type="button" onClick={finish} className="font-semibold text-ink-950 underline underline-offset-4">
            {reduced ? 'Reveal code' : 'Or reveal instantly'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Verification seal animation
   ------------------------------------------------------------------ */
function Seal({ tone }: { tone: 'ok' | 'warn' | 'bad' }) {
  const color = tone === 'ok' ? '#1fc46c' : tone === 'warn' ? '#e09a1f' : '#c81620';
  return (
    <svg viewBox="0 0 64 64" className="size-16 shrink-0" aria-hidden>
      <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="3" strokeDasharray="176" strokeDashoffset="176" style={{ animation: 'draw .7s var(--ease-out-expo) forwards' }} />
      {tone === 'ok' && <path d="M20 33l8 8 16-17" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset="40" style={{ animation: 'draw .5s .5s var(--ease-out-expo) forwards' }} />}
      {tone === 'warn' && <path d="M32 18v18M32 44v2" stroke={color} strokeWidth="4" strokeLinecap="round" />}
      {tone === 'bad' && <path d="M23 23l18 18M41 23L23 41" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray="30" strokeDashoffset="30" style={{ animation: 'draw .4s .4s forwards' }} />}
      <style>{`@keyframes draw { to { stroke-dashoffset: 0 } }`}</style>
    </svg>
  );
}

/* ------------------------------------------------------------------
   Verify form + result states
   ------------------------------------------------------------------ */
export function VerifyForm({ tone = 'light', withSticker = true }: { tone?: 'light' | 'dark'; withSticker?: boolean }) {
  const [code, setCode] = useState('');
  const [batch, setBatch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) return setError('Enter the code revealed under the scratch panel.');
    setError(null);
    setLoading(true);
    setResult(null);
    const r = await verifyCode(code, batch);
    setLoading(false);
    setResult(r);
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const dark = tone === 'dark';

  return (
    <div className="grid gap-8">
      {withSticker && (
        <div className="max-w-sm">
          <ScratchSticker code={DEMO_CODES.success} onReveal={() => setCode(DEMO_CODES.success)} />
        </div>
      )}
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field
          tone={tone}
          label="Authenticity code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. MB-XXXX-XXXX"
          autoComplete="off"
          spellCheck={false}
          error={error}
          className="font-mono"
        />
        <Field tone={tone} label="Batch number (optional)" value={batch} onChange={(e) => setBatch(e.target.value.toUpperCase())} placeholder="Printed on your tub" autoComplete="off" spellCheck={false} />
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <Button type="submit" size="lg" loading={loading} variant={dark ? 'primary' : 'primary'}>
            {loading ? 'Verifying…' : 'Verify Now'}
          </Button>
          <button type="button" className={cx('inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline', dark ? 'text-bone-200' : 'text-ink-700')} onClick={() => setError('QR scanning needs camera access and the live verification API — not available in this concept build.')}>
            <QrCode className="size-4" aria-hidden /> Scan QR instead
          </button>
        </div>
        <p className={cx('flex flex-wrap items-center gap-2 text-xs sm:col-span-2', dark ? 'text-bone-400' : 'text-ink-500')}>
          <MockTag className={dark ? '' : 'border-amber-700/40 text-amber-800'}>Mock API</MockTag>
          Try <code className="font-mono">{DEMO_CODES.success}</code> (genuine), <code className="font-mono">{DEMO_CODES.used}</code> (already used) or any other code (not found).
        </p>
      </form>

      <div ref={resultRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {result?.status === 'success' && (
          <div className={cx('flex items-center gap-5 rounded-md border p-5', dark ? 'border-proof-400/40 bg-proof-400/10' : 'border-proof-700/30 bg-proof-400/15')}>
            <Seal tone="ok" />
            <div>
              <p className={cx('flex items-center gap-2 text-lg font-bold', dark ? 'text-proof-300' : 'text-proof-700')}>
                <ShieldCheck className="size-5" aria-hidden /> Verified genuine.
              </p>
              <p className="mt-1">This product is authentic MuscleBlaze. Enjoy your gains.</p>
              <Link to="/authenticity#lab-report" className="mt-2 inline-block text-sm font-semibold underline underline-offset-4">
                Read its lab report →
              </Link>
            </div>
          </div>
        )}
        {result?.status === 'already-used' && (
          <div className={cx('flex items-center gap-5 rounded-md border p-5', dark ? 'border-amber-signal/40 bg-amber-signal/10' : 'border-amber-600/30 bg-amber-signal/15')}>
            <Seal tone="warn" />
            <div>
              <p className="flex items-center gap-2 text-lg font-bold">
                <ShieldAlert className="size-5" aria-hidden /> Already verified
              </p>
              <p className="mt-1">
                This code has already been verified {result.count} times. If this is your first check, your product may not be genuine.{' '}
                <Link to="/contact" className="font-semibold underline underline-offset-4">
                  Contact us.
                </Link>
              </p>
            </div>
          </div>
        )}
        {result?.status === 'invalid' && (
          <div className={cx('flex items-center gap-5 rounded-md border p-5', dark ? 'border-blaze-400/40 bg-blaze-500/10' : 'border-blaze-600/30 bg-blaze-500/10')}>
            <Seal tone="bad" />
            <div>
              <p className="flex items-center gap-2 text-lg font-bold">
                <ShieldX className="size-5" aria-hidden /> Code not found
              </p>
              <p className="mt-1">
                We couldn’t find this code. Check for typos or{' '}
                <Link to="/contact" className="font-semibold underline underline-offset-4">
                  reach our support team
                </Link>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Lab report lookup
   ------------------------------------------------------------------ */
export function LabReportLookup({ tone = 'dark' }: { tone?: 'light' | 'dark' }) {
  const [batch, setBatch] = useState('');
  const [state, setState] = useState<{ kind: 'idle' | 'loading' | 'none' | 'error'; report?: undefined } | { kind: 'found'; report: LabReport }>({ kind: 'idle' });
  const dark = tone === 'dark';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (batch.trim().length < 3) return setState({ kind: 'error' });
    setState({ kind: 'loading' });
    const r = await lookupLabReport(batch);
    setState(r ? { kind: 'found', report: r } : { kind: 'none' });
  };

  return (
    <div>
      <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field tone={tone} className="flex-1" label="Batch number" value={batch} onChange={(e) => setBatch(e.target.value.toUpperCase())} placeholder={`e.g. ${DEMO_CODES.batch}`} error={state.kind === 'error' ? 'Enter the batch number printed on your tub.' : null} spellCheck={false} />
        <Button type="submit" size="md" variant={dark ? 'inverse' : 'primary'} loading={state.kind === 'loading'} icon={<FileText className="size-4" />}>
          Get lab report
        </Button>
      </form>
      <div aria-live="polite" className="mt-6">
        {state.kind === 'none' && <p className={dark ? 'text-bone-400' : 'text-ink-600'}>No report found for that batch. Check the number and try again, or contact support.</p>}
        {state.kind === 'found' && (
          <article className={cx('rounded-md border p-5 md:p-6', dark ? 'hairline bg-ink-900' : 'hairline-dark bg-white')}>
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow opacity-60">Third-party lab report</p>
                <h3 className="mt-1 text-lg font-bold">{state.report.product}</h3>
                <p className="font-mono text-sm opacity-70">Batch {state.report.batch}</p>
              </div>
              <MockTag>Sample report</MockTag>
            </header>
            <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-4 border-b border-current/10 pb-2">
                <dt className="opacity-60">Testing lab</dt>
                <dd className="text-right">{state.report.lab ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-current/10 pb-2">
                <dt className="opacity-60">Tested on</dt>
                <dd>{state.report.testedOn ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-current/10 pb-2">
                <dt className="opacity-60">Protein on label</dt>
                <dd className="font-mono">{state.report.proteinLabel} g / scoop</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-current/10 pb-2">
                <dt className="opacity-60">Protein tested</dt>
                <dd className="font-mono">{state.report.proteinTested != null ? `${state.report.proteinTested} g` : '—'}</dd>
              </div>
              {state.report.purityChecks.map((c) => (
                <div key={c.name} className="flex justify-between gap-4 border-b border-current/10 pb-2">
                  <dt className="opacity-60">{c.name}</dt>
                  <dd>{c.result ?? '—'}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs opacity-60">Sample values for demo batch numbers. Live reports and PDF downloads come from the lab-report API once connected.</p>
          </article>
        )}
      </div>
    </div>
  );
}
