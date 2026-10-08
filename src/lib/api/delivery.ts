import { wait } from './mock';

/**
 * DELIVERY / PINCODE SERVICE — MOCK
 * Any valid 6-digit Indian pincode returns a date 3 days out; the demo
 * pincode 999999 returns "not serviceable" so that state can be exercised.
 */
export type PincodeResult = { ok: true; date: Date; express: boolean } | { ok: false };

export const DEMO_UNSERVICEABLE = '999999';

export const isValidPincode = (p: string) => /^[1-9][0-9]{5}$/.test(p);

export async function checkPincode(pin: string): Promise<PincodeResult> {
  await wait(650);
  if (pin === DEMO_UNSERVICEABLE) return { ok: false };
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return { ok: true, date, express: false };
}
