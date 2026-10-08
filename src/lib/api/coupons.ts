import { wait } from './mock';

/** COUPON SERVICE — MOCK. "DEMO10" applies 10% off so the flow can be shown. */
export async function applyCoupon(code: string): Promise<{ ok: true; pct: number; code: string } | { ok: false }> {
  await wait(600);
  return code.trim().toUpperCase() === 'DEMO10' ? { ok: true, pct: 10, code: 'DEMO10' } : { ok: false };
}
