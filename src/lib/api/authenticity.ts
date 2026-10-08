import { wait } from './mock';

/**
 * AUTHENTICITY + LAB REPORT SERVICE — MOCK
 * Replace with the real verification endpoint. Demo codes:
 *   MB-DEMO-0001  → verified genuine
 *   MB-DEMO-USED  → already verified [N] times
 *   anything else → not found
 * Batch numbers starting "B-DEMO" return a placeholder lab report.
 */
export type VerifyResult =
  | { status: 'success' }
  | { status: 'already-used'; count: number }
  | { status: 'invalid' };

export const DEMO_CODES = { success: 'MB-DEMO-0001', used: 'MB-DEMO-USED', batch: 'B-DEMO-01' };

export async function verifyCode(code: string, _batch?: string): Promise<VerifyResult> {
  await wait(1100);
  const c = code.trim().toUpperCase();
  if (c === DEMO_CODES.success) return { status: 'success' };
  if (c === DEMO_CODES.used) return { status: 'already-used', count: 3 };
  return { status: 'invalid' };
}

export interface LabReport {
  batch: string;
  product: string;
  lab: string | null;
  testedOn: string | null;
  proteinLabel: number | null;
  proteinTested: number | null;
  purityChecks: { name: string; result: string | null }[];
  reportUrl: string | null;
}

export async function lookupLabReport(batch: string): Promise<LabReport | null> {
  await wait(900);
  const b = batch.trim().toUpperCase();
  if (!b.startsWith('B-DEMO')) return null;
  // Every field below is a placeholder until the lab-report API is connected.
  return {
    batch: b,
    product: 'Biozyme Performance Whey Protein',
    lab: null,
    testedOn: null,
    proteinLabel: 25,
    proteinTested: null,
    purityChecks: [
      { name: 'Protein content vs label', result: null },
      { name: 'Heavy metals', result: null },
      { name: 'Banned substances', result: null },
      { name: 'Amino spiking', result: null },
    ],
    reportUrl: null,
  };
}
