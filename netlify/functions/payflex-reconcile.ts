import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { enrollCourse } from './_lib/enroll-helper';

const PAYFLEX_AUTH_URL = process.env.PAYFLEX_AUTH_URL || 'https://auth-uat.payflex.co.za/auth/merchant';
const PAYFLEX_API_URL = (process.env.PAYFLEX_API_URL || 'https://api.uat.payflex.co.za').replace(/\/+$/, '');
const PAYFLEX_AUDIENCE = process.env.PAYFLEX_AUDIENCE || 'https://auth-dev.payflex.co.za';
const IS_UAT = PAYFLEX_API_URL.includes('uat');
const PAYFLEX_CLIENT_ID = process.env.PAYFLEX_CLIENT_ID || '';
const PAYFLEX_CLIENT_SECRET = process.env.PAYFLEX_CLIENT_SECRET || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SITE = (process.env.SITE_URL || process.env.SITE_BASE_URL || 'https://blom-cosmetics.co.za').replace(/\/$/, '');
const N8N_WEBHOOK_URL = 'https://dockerfile-1n82.onrender.com/webhook/notify-order';
const RECONCILE_SECRET = process.env.PAYFLEX_RECONCILE_SECRET || '';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function getPayflexToken(): Promise<string> {
  const res = await fetch(PAYFLEX_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: PAYFLEX_CLIENT_ID,
      client_secret: PAYFLEX_CLIENT_SECRET,
      audience: PAYFLEX_AUDIENCE,
      grant_type: 'client_credentials'
    })
  });
  if (!res.ok) throw new Error(`Payflex auth failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function verifyPayflexOrder(token: string, payflexOrderId: string): Promise<string | null> {
  const res = await fetch(`${PAYFLEX_API_URL}/order/${encodeURIComponent(payflexOrderId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.orderStatus || null;
}

async function runFulfilment(order: any, notify: boolean) {
  const orderId = order.id;
  const now = new Date().toISOString();

  await supabase.from('orders').update({
    status: 'paid',
    payment_status: 'paid',
    paid_at: now,
    updated_at: now
  }).eq('id', orderId);

  if (order.coupon_code) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_coupon_usage`, {
        method: 'POST',
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_code: order.coupon_code })
      });
    } catch (e) { console.error('[reconcile] coupon error:', e); }
  }

  try {
    const invRes = await fetch(`${SITE}/.netlify/functions/invoice-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ m_payment_id: order.m_payment_id })
    });
    if (!invRes.ok) console.error('[reconcile] invoice failed:', await invRes.text());
  } catch (e) { console.error('[reconcile] invoice error:', e); }

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/process_order_stock_deduction`, {
      method: 'POST',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_order_id: orderId })
    });
  } catch (e) { console.error('[reconcile] stock error:', e); }

  let coursePurchases: any[] = [];
  try {
    const { data: cps } = await supabase
      .from('course_purchases')
      .select('id,course_slug,invitation_status,buyer_email,buyer_name,buyer_phone')
      .eq('order_id', orderId);
    coursePurchases = cps || [];
    const amountCents = order.total_cents ?? Math.round(Number(order.total || 0) * 100);
    if (coursePurchases.length > 0 && Number.isFinite(amountCents) && amountCents > 0) {
      await supabase.from('course_purchases').update({ amount_paid_cents: amountCents }).eq('order_id', orderId);
    }
  } catch (e) { console.error('[reconcile] course purchases query error:', e); }

  if (notify) {
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          order_number: order.order_number,
          customer_name: order.buyer_name,
          customer_email: order.buyer_email,
          customer_phone: order.buyer_phone,
          total_amount: order.total || (order.total_cents ? order.total_cents / 100 : 0),
          payment_status: 'PAID'
        })
      });
    } catch (e) { console.error('[reconcile] n8n error:', e); }
  }

  if (coursePurchases.length > 0) {
    try {
      for (const cp of coursePurchases) {
        const status = String(cp?.invitation_status || '').toLowerCase();
        if (status === 'sent' || status === 'redeemed') continue;
        const buyerEmail = String(order.buyer_email || cp.buyer_email || '').trim();
        const courseSlug = String(cp.course_slug || '');
        if (!buyerEmail || !courseSlug) continue;
        try {
          await enrollCourse({ orderId, courseSlug, buyerEmail, buyerName: order.buyer_name || cp.buyer_name, buyerPhone: order.buyer_phone || cp.buyer_phone });
        } catch (e) { console.error('[reconcile] enroll error:', courseSlug, e); }
      }
    } catch (e) { console.error('[reconcile] enrollment loop error:', e); }
  }
}

function isAuthorized(event: any): boolean {
  if (!RECONCILE_SECRET) return false;
  const provided = event.headers?.['x-reconcile-secret'] || event.headers?.['X-Reconcile-Secret'] || event.queryStringParameters?.secret;
  return provided === RECONCILE_SECRET;
}

export const handler: Handler = async (event) => {
  if (!isAuthorized(event)) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { statusCode: 500, body: 'Server config missing' };
  }
  if (!PAYFLEX_CLIENT_ID || !PAYFLEX_CLIENT_SECRET) {
    return { statusCode: 500, body: 'Payflex credentials missing' };
  }

  const q = event.queryStringParameters || {};
  const days = Math.min(Math.max(Number(q.days) || 7, 1), 30);
  const dryRun = q.dryRun === '1' || q.dryRun === 'true';
  const notify = q.notify !== '0' && q.notify !== 'false';

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidates, error } = await supabase
    .from('orders')
    .select('id,order_number,m_payment_id,payflex_order_id,buyer_email,buyer_name,buyer_phone,total,total_cents,coupon_code,delivery_address,status,payment_status,created_at')
    .eq('payment_method', 'payflex')
    .neq('payment_status', 'paid')
    .gte('created_at', since)
    .not('payflex_order_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return { statusCode: 500, body: `DB error: ${error.message}` };
  }

  const token = await getPayflexToken();

  const recovered: any[] = [];
  const stillUnpaid: any[] = [];
  const errors: any[] = [];

  const verified = await Promise.all(
    (candidates || []).map(async (order) => {
      try {
        return { order, status: await verifyPayflexOrder(token, order.payflex_order_id) };
      } catch (e: any) {
        return { order, error: e?.message };
      }
    })
  );

  for (const v of verified) {
    if ('error' in v && v.error) { errors.push({ id: v.order.id, error: v.error }); continue; }
    const { order, status } = v as { order: any; status: string | null };
    if (status === 'Approved') {
      if (dryRun || IS_UAT) {
        recovered.push({ id: order.id, m_payment_id: order.m_payment_id, payflex_status: status, skipped: dryRun ? 'dryRun' : 'uat' });
        continue;
      }
      try {
        await runFulfilment(order, notify);
        recovered.push({ id: order.id, m_payment_id: order.m_payment_id, payflex_status: status });
      } catch (e: any) {
        errors.push({ id: order.id, error: e?.message });
      }
    } else {
      stillUnpaid.push({ id: order.id, m_payment_id: order.m_payment_id, payflex_status: status });
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      checked: candidates?.length || 0,
      windowDays: days,
      dryRun,
      notify,
      recovered,
      stillUnpaid: stillUnpaid.length,
      errors
    })
  };
};
