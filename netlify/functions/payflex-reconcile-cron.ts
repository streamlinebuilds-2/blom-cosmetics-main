import { schedule } from '@netlify/functions';
import { runReconcile, reconcileConfigError } from './_lib/payflex-reconcile-core';

// Hourly safety net for Payflex payments that never reached us.
//
// Discovered 2026-08-11: two orders (BL-MSIF3B9U-5B0CC5 R570, BL-MSG88V28-6FC686
// R575) were Approved at Payflex but sat 'unpaid' and invisible in admin for
// days. payflex-reconcile.ts already knew how to recover them, but it was
// secret-gated with no schedule, so it only ran if somebody called it by hand.
//
// Window is 2 days rather than 1: Payflex can take time to settle, and an
// overlap means a single missed run doesn't lose an order. Fulfilment is
// idempotent (already-paid orders are filtered out of the candidate query).
const WINDOW_DAYS = 2;

const handlerFn = async () => {
  const configError = reconcileConfigError();
  if (configError) {
    console.error('[payflex-reconcile-cron] skipped:', configError);
    return { statusCode: 200, body: configError };
  }

  try {
    const result = await runReconcile({ days: WINDOW_DAYS, dryRun: false, notify: true });
    if (result.recovered.length > 0 || result.errors.length > 0) {
      console.log('[payflex-reconcile-cron]', JSON.stringify(result));
    }
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (e: any) {
    console.error('[payflex-reconcile-cron] failed:', e?.message || e);
    return { statusCode: 200, body: e?.message || String(e) };
  }
};

export const handler = schedule('0 * * * *', handlerFn);
