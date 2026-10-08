import { wait } from './mock';

/** NEWSLETTER SERVICE — MOCK. Nothing is sent; replace with the ESP endpoint. */
export async function subscribe(email: string) {
  await wait(800);
  if (email.toLowerCase().endsWith('@example.invalid')) throw new Error('rejected');
  return { ok: true };
}

export const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
