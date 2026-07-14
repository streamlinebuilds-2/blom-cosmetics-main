import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Scheduled reconciler for Avané's 30th Birthday bundle (5-glitter, 30% off, one day only).
//
// The storefront trusts the DB price, so this function is the single mechanism that turns the
// flash sale on and off. It runs every 10 minutes and reconciles the bundle row against the promo
// window — no manual midnight action required. It is idempotent (only writes when something differs).
//
// Timestamps MUST match src/config/birthdayPromo.ts so the DB price flips at the same instant the
// on-page surfaces (hero slide, popup, countdown) do.
//
// NOTE: this is a one-off launch mechanism. Remove the function (and its schedule) after 16 July 2026.

const LAUNCH_MS = new Date('2026-07-15T00:00:00+02:00').getTime();
const EXPIRY_MS = new Date('2026-07-16T00:00:00+02:00').getTime();
const BUNDLE_SLUG = '30th-birthday-glitter-bundle';
const DISCOUNTED_CENTS = 52500; // 30% off
const FULL_CENTS = 75000; // 5 x R150

interface DesiredState {
  status: 'draft' | 'active';
  is_active: boolean;
  price_cents: number;
  phase: 'pre-launch' | 'live' | 'expired';
}

function desiredFor(nowMs: number): DesiredState {
  if (nowMs < LAUNCH_MS) return { status: 'draft', is_active: false, price_cents: DISCOUNTED_CENTS, phase: 'pre-launch' };
  if (nowMs < EXPIRY_MS) return { status: 'active', is_active: true, price_cents: DISCOUNTED_CENTS, phase: 'live' };
  return { status: 'active', is_active: true, price_cents: FULL_CENTS, phase: 'expired' };
}

const handlerFn = async () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('birthday-bundle-reconcile: missing Supabase env');
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Server configuration error' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const want = desiredFor(Date.now());

  const { data: bundle, error: readErr } = await supabase
    .from('bundles')
    .select('id, status, is_active, price_cents')
    .eq('slug', BUNDLE_SLUG)
    .maybeSingle();

  if (readErr || !bundle) {
    console.error('birthday-bundle-reconcile: bundle not found', readErr);
    return { statusCode: 404, body: JSON.stringify({ ok: false, error: 'Bundle not found' }) };
  }

  const needsUpdate =
    bundle.status !== want.status ||
    bundle.is_active !== want.is_active ||
    Number(bundle.price_cents) !== want.price_cents;

  if (!needsUpdate) {
    return { statusCode: 200, body: JSON.stringify({ ok: true, phase: want.phase, changed: false }) };
  }

  const { error: updateErr } = await supabase
    .from('bundles')
    .update({
      status: want.status,
      is_active: want.is_active,
      price_cents: want.price_cents,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bundle.id);

  if (updateErr) {
    console.error('birthday-bundle-reconcile: update failed', updateErr);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Update failed' }) };
  }

  console.log(`birthday-bundle-reconcile: phase=${want.phase} price_cents=${want.price_cents} status=${want.status}`);
  return { statusCode: 200, body: JSON.stringify({ ok: true, phase: want.phase, changed: true }) };
};

export const handler = schedule('*/10 * * * *', handlerFn);
