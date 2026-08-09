import { Handler } from '@netlify/functions';
import crypto from 'crypto';

// FIXED VERSION - Correct signature order for PayFast

const PF_ENV = String(process.env.PAYFAST_ENV || 'live').toLowerCase();
const PF_BASE = PF_ENV === 'sandbox' ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za';
const SITE_BASE_URL = (process.env.SITE_BASE_URL || process.env.URL || 'https://blom-cosmetics.co.za').replace(/\/+$/, '');
const CANCEL_URL = `${SITE_BASE_URL}/checkout/cancel`;
// CRITICAL: This must match what PayFast is configured to send to
const NOTIFY_URL = `${SITE_BASE_URL}/.netlify/functions/payfast-itn`;

// PHP-style urlencode for PayFast: spaces -> +, and encode ! ' ( ) *
function encPF(v: unknown) {
  return encodeURIComponent(String(v ?? '').trim())
    .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+')
    .replace(/%[0-9a-f]{2}/g, m => m.toUpperCase());
}

const CHECKOUT_SIGNATURE_FIELD_ORDER = [
  'merchant_id',
  'merchant_key',
  'return_url',
  'cancel_url',
  'notify_url',
  'name_first',
  'name_last',
  'email_address',
  'cell_number',
  'm_payment_id',
  'amount',
  'item_name',
  'item_description',
  'custom_int1',
  'custom_int2',
  'custom_int3',
  'custom_int4',
  'custom_int5',
  'custom_str1',
  'custom_str2',
  'custom_str3',
  'custom_str4',
  'custom_str5',
  'email_confirmation',
  'confirmation_address',
  'payment_method',
  'subscription_type',
  'billing_date',
  'recurring_amount',
  'frequency',
  'cycles'
] as const;

function sortKeysForPayFast(keys: string[]) {
  const priority = new Map<string, number>();
  for (let i = 0; i < CHECKOUT_SIGNATURE_FIELD_ORDER.length; i += 1) priority.set(CHECKOUT_SIGNATURE_FIELD_ORDER[i], i);
  return [...keys].sort((a, b) => {
    const pa = priority.get(a);
    const pb = priority.get(b);
    if (pa === undefined && pb === undefined) return a.localeCompare(b);
    if (pa === undefined) return 1;
    if (pb === undefined) return -1;
    return pa - pb;
  });
}

async function loadOrder(orderId: string, merchantPaymentId: string) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Server order configuration is unavailable');
  }

  const referenceFilter = encodeURIComponent(
    `(m_payment_id.eq.${merchantPaymentId},merchant_payment_id.eq.${merchantPaymentId})`
  );
  const response = await fetch(
    `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&or=${referenceFilter}&select=id,m_payment_id,merchant_payment_id,total_cents,total,shipping_cents&limit=1`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  if (!response.ok) throw new Error('Unable to verify the order total');
  const rows = await response.json();
  const order = Array.isArray(rows) ? rows[0] : null;
  if (!order) throw new Error('Order and payment reference do not match');
  return order;
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const item_name = String(payload.item_name || 'BLOM Order');
    const orderId = String(payload.order_id || '');
    const m_payment_id = String(payload.m_payment_id || '');

    if (!orderId || !m_payment_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'A valid order and payment reference are required' })
      };
    }

    const order = await loadOrder(orderId, m_payment_id);
    const totalCents = Number(order.total_cents ?? Math.round(Number(order.total || 0) * 100));
    if (!Number.isFinite(totalCents) || totalCents <= 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'The stored order total is invalid' })
      };
    }
    const amountStr = (totalCents / 100).toFixed(2);

    // Build PayFast redirect from the server-authoritative order total.
    const RETURN_URL = `${SITE_BASE_URL}/checkout/status?order=${orderId}`;
    
    const merchantId = PF_ENV === 'sandbox' ? process.env.PAYFAST_SANDBOX_MERCHANT_ID : process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = PF_ENV === 'sandbox' ? process.env.PAYFAST_SANDBOX_MERCHANT_KEY : process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = PF_ENV === 'sandbox' ? process.env.PAYFAST_SANDBOX_PASSPHRASE : process.env.PAYFAST_PASSPHRASE;

    if (!merchantId || !merchantKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'PayFast merchant credentials not configured' })
      };
    }

    const fields: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: RETURN_URL,
      cancel_url: CANCEL_URL,
      notify_url: NOTIFY_URL,
      m_payment_id,
      amount: amountStr,
      item_name,
      custom_str1: m_payment_id
    };

    const passthroughKeys = [
      'email_address',
      'name_first',
      'name_last',
      'custom_str2',
      'custom_str3',
      'custom_str4'
    ] as const;

    for (const k of passthroughKeys) {
      if (payload?.[k] !== undefined && payload?.[k] !== null && String(payload[k]) !== '') {
        fields[k] = String(payload[k]);
      }
    }
    
    const signatureKeys = Object.keys(fields).filter((k) => {
      const val = fields[k];
      return val !== undefined && val !== null && String(val).trim() !== '' && k !== 'signature';
    });
    const orderedKeys = sortKeysForPayFast(signatureKeys);
    const baseStringParts = orderedKeys.map((k) => `${k}=${encPF(fields[k])}`);
    let baseString = baseStringParts.join('&');
    
    // Add passphrase if configured
    if (passphrase) {
      baseString += `&passphrase=${encPF(passphrase)}`;
    }
    
    // Generate MD5 signature
    const signature = crypto.createHash('md5').update(baseString).digest('hex');

    // Add signature to fields
    fields.signature = signature;

    // 3) Generate HTML form that auto-submits
    function htmlAutoPost(action: string, fields: Record<string, any>) {
      const inputs = Object.entries(fields).map(([k, v]) =>
        `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}">`
      ).join('\n    ');
      
      return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to PayFast...</title>
</head>
<body onload="document.forms[0].submit()">
  <form action="${action}" method="post" accept-charset="utf-8">
    ${inputs}
    <p>Redirecting to PayFast... <button type="submit">Click here if not redirected</button></p>
  </form>
</body>
</html>`;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: htmlAutoPost(`${PF_BASE}/eng/process`, fields)
    };

  } catch (e: any) {
    console.error('PayFast redirect error:', e);
    return { 
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message || 'Checkout error' }) 
    };
  }
};
