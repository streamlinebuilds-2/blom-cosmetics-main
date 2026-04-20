import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const PF_ENV = String(process.env.PAYFAST_ENV || 'live').toLowerCase();
const PF_BASE = PF_ENV === 'sandbox' ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za';
const SITE_BASE_URL = (process.env.SITE_BASE_URL || process.env.URL || 'https://blom-cosmetics.co.za').replace(/\/+$/, '');
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Module-level singletons — reused across warm invocations (avoids re-init cost)
const serviceClient = SUPABASE_URL && SERVICE_KEY ? createClient(SUPABASE_URL, SERVICE_KEY) : null;
const anonClient = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ---- PayFast helpers (mirrored from payfast-redirect.ts) ----

function encPF(v: unknown) {
  return encodeURIComponent(String(v ?? '').trim())
    .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+')
    .replace(/%[0-9a-f]{2}/g, m => m.toUpperCase());
}

const CHECKOUT_SIGNATURE_FIELD_ORDER = [
  'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
  'name_first', 'name_last', 'email_address', 'cell_number', 'm_payment_id',
  'amount', 'item_name', 'item_description',
  'custom_int1', 'custom_int2', 'custom_int3', 'custom_int4', 'custom_int5',
  'custom_str1', 'custom_str2', 'custom_str3', 'custom_str4', 'custom_str5',
  'email_confirmation', 'confirmation_address', 'payment_method',
  'subscription_type', 'billing_date', 'recurring_amount', 'frequency', 'cycles'
] as const;

function sortKeysForPayFast(keys: string[]) {
  const priority = new Map<string, number>();
  for (let i = 0; i < CHECKOUT_SIGNATURE_FIELD_ORDER.length; i++) priority.set(CHECKOUT_SIGNATURE_FIELD_ORDER[i], i);
  return [...keys].sort((a, b) => {
    const pa = priority.get(a), pb = priority.get(b);
    if (pa === undefined && pb === undefined) return a.localeCompare(b);
    if (pa === undefined) return 1;
    if (pb === undefined) return -1;
    return pa - pb;
  });
}

function htmlAutoPost(action: string, fields: Record<string, string>) {
  const inputs = Object.entries(fields)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}">`)
    .join('\n    ');
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Redirecting to PayFast...</title></head>
<body onload="document.forms[0].submit()">
  <form action="${action}" method="post" accept-charset="utf-8">
    ${inputs}
    <p>Redirecting to PayFast... <button type="submit">Click here if not redirected</button></p>
  </form>
</body>
</html>`;
}

// ---- Payflex helpers (mirrored from payflex-redirect.ts) ----

const PAYFLEX_AUTH_URL = process.env.PAYFLEX_AUTH_URL || 'https://auth-uat.payflex.co.za/auth/merchant';
const PAYFLEX_API_URL = (process.env.PAYFLEX_API_URL || 'https://api.uat.payflex.co.za').replace(/\/+$/, '');
const PAYFLEX_AUDIENCE = process.env.PAYFLEX_AUDIENCE || 'https://auth-dev.payflex.co.za';
const PAYFLEX_CLIENT_ID = process.env.PAYFLEX_CLIENT_ID || '';
const PAYFLEX_CLIENT_SECRET = process.env.PAYFLEX_CLIENT_SECRET || '';

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

// ---- Handler ----

export const handler: Handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const body = JSON.parse(event.body || '{}');
    const { order_id, buyer_email: requestEmail } = body;

    if (!order_id) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing order_id' }) };
    }

    if (!serviceClient) {
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server configuration error' }) };
    }

    // Fetch order using service role (bypasses RLS)
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .select('id, m_payment_id, order_number, status, payment_status, payment_method, total, total_cents, shipping_cents, buyer_email, buyer_name, user_id')
      .eq('id', order_id)
      .maybeSingle();

    if (orderError || !order) {
      return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: 'Order not found' }) };
    }

    // Authorization: verify JWT or match guest email
    let authorized = false;
    const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (jwt && anonClient) {
      const { data: { user } } = await anonClient.auth.getUser(jwt);
      if (user) {
        authorized = order.user_id === user.id || order.buyer_email?.toLowerCase() === user.email?.toLowerCase();
      }
    }

    if (!authorized && requestEmail && order.buyer_email) {
      authorized = requestEmail.toLowerCase().trim() === order.buyer_email.toLowerCase().trim();
    }

    if (!authorized) {
      return { statusCode: 403, headers: corsHeaders, body: JSON.stringify({ error: 'Not authorized' }) };
    }

    // Guards
    if (order.payment_status === 'paid' || order.status === 'paid') {
      return { statusCode: 409, headers: corsHeaders, body: JSON.stringify({ error: 'Order is already paid' }) };
    }
    if (order.status === 'cancelled') {
      return { statusCode: 409, headers: corsHeaders, body: JSON.stringify({ error: 'Cancelled orders cannot be retried' }) };
    }

    const totalCents = order.total_cents ?? Math.round(Number(order.total || 0) * 100);
    const amountRands = totalCents / 100;
    const m_payment_id = order.m_payment_id || order.id;
    const method = (order.payment_method || 'payfast').toLowerCase();

    // ---- Payflex retry ----
    if (method === 'payflex') {
      if (!PAYFLEX_CLIENT_ID || !PAYFLEX_CLIENT_SECRET) {
        return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Payflex not configured' }) };
      }

      const accessToken = await getPayflexToken();

      const orderBody: Record<string, any> = {
        merchantReference: m_payment_id,
        amount: Number(amountRands.toFixed(2)),
        taxAmount: 0,
        shippingAmount: Number(((order.shipping_cents ?? 0) / 100).toFixed(2)),
        merchant: {
          redirectConfirmUrl: `${SITE_BASE_URL}/checkout/status?order=${order.id}`,
          redirectCancelUrl: `${SITE_BASE_URL}/checkout/cancel`,
          statusCallbackUrl: `${SITE_BASE_URL}/.netlify/functions/payflex-webhook`
        }
      };

      if (order.buyer_name) {
        const parts = order.buyer_name.split(' ');
        orderBody.consumer = {
          givenNames: parts[0] || '',
          surname: parts.slice(1).join(' ') || '',
          email: order.buyer_email || '',
          phoneNumber: ''
        };
      }

      const pfxRes = await fetch(`${PAYFLEX_API_URL}/order`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(orderBody)
      });

      if (!pfxRes.ok) {
        const errText = await pfxRes.text();
        console.error('Payflex order error:', errText);
        return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: `Payflex error: ${errText}` }) };
      }

      const pfxData = await pfxRes.json();
      const { orderId: payflexOrderId, redirectUrl } = pfxData;

      if (!redirectUrl) {
        return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: 'No redirectUrl from Payflex' }) };
      }

      if (payflexOrderId) {
        await serviceClient.from('orders').update({ payflex_order_id: payflexOrderId }).eq('id', order.id);
      }

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'payflex', checkout_url: redirectUrl })
      };
    }

    // ---- PayFast retry ----
    const merchantId = PF_ENV === 'sandbox' ? process.env.PAYFAST_SANDBOX_MERCHANT_ID : process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = PF_ENV === 'sandbox' ? process.env.PAYFAST_SANDBOX_MERCHANT_KEY : process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = PF_ENV === 'sandbox' ? process.env.PAYFAST_SANDBOX_PASSPHRASE : process.env.PAYFAST_PASSPHRASE;

    if (!merchantId || !merchantKey) {
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'PayFast credentials not configured' }) };
    }

    const amountStr = amountRands.toFixed(2);
    const RETURN_URL = `${SITE_BASE_URL}/checkout/status?order=${order.id}`;
    const CANCEL_URL = `${SITE_BASE_URL}/checkout/cancel`;
    const NOTIFY_URL = `${SITE_BASE_URL}/.netlify/functions/payfast-itn`;

    const fields: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: RETURN_URL,
      cancel_url: CANCEL_URL,
      notify_url: NOTIFY_URL,
      m_payment_id,
      amount: amountStr,
      item_name: `BLOM Order ${m_payment_id}`,
      custom_str1: m_payment_id
    };

    if (order.buyer_email) fields['email_address'] = order.buyer_email;
    if (order.buyer_name) {
      const parts = order.buyer_name.split(' ');
      fields['name_first'] = parts[0] || '';
      const lastName = parts.slice(1).join(' ');
      if (lastName) fields['name_last'] = lastName;
    }

    const signatureKeys = Object.keys(fields).filter(k => {
      const val = fields[k];
      return val !== undefined && val !== null && String(val).trim() !== '' && k !== 'signature';
    });
    const orderedKeys = sortKeysForPayFast(signatureKeys);
    let baseString = orderedKeys.map(k => `${k}=${encPF(fields[k])}`).join('&');
    if (passphrase) baseString += `&passphrase=${encPF(passphrase)}`;
    fields['signature'] = crypto.createHash('md5').update(baseString).digest('hex');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: htmlAutoPost(`${PF_BASE}/eng/process`, fields)
    };

  } catch (e: any) {
    console.error('retry-payment error:', e);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e.message || 'Retry failed' }) };
  }
};
