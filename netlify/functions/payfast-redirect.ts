import { Handler } from '@netlify/functions';
import crypto from 'crypto';

// Env configuration per spec
const PF_BASE = process.env.PAYFAST_BASE || 'https://www.payfast.co.za';
const SITE_BASE_URL = process.env.SITE_BASE_URL || process.env.URL || '';
const RETURN_URL = `${SITE_BASE_URL}/payment-success`;
const CANCEL_URL = `${SITE_BASE_URL}/payment-cancelled`;
const NOTIFY_URL = process.env.N8N_ITN_URL || '';

// PHP-style urlencode for PayFast: spaces -> +, and encode ! ' ( ) *
function encPF(v: unknown) {
  return encodeURIComponent(String(v ?? ''))
    .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+');
}

// Build signature using documentation order (not sorting)
function signPayfastInOrder(fields: Record<string, any>, passphrase?: string) {
  // Documentation order per spec
  const order = [
    'merchant_id','merchant_key','return_url','cancel_url','notify_url',
    'name_first','name_last','email_address','cell_number',
    'm_payment_id','amount','item_name','item_description',
    'custom_int1','custom_int2','custom_int3','custom_int4','custom_int5',
    'custom_str1','custom_str2','custom_str3','custom_str4','custom_str5',
    'email_confirmation','confirmation_address','payment_method'
  ];

  const parts: string[] = [];
  for (const key of order) {
    const val = (fields as any)[key];
    if (val !== undefined && val !== null && String(val) !== '') {
      parts.push(`${key}=${encPF(val)}`);
    }
  }

  let base = parts.join('&');
  if (passphrase) {
    base += `&passphrase=${encPF(passphrase)}`;
  }

  const signature = crypto.createHash('md5').update(base).digest('hex');

  // TEMP LOGS (remove after success)
  console.log('PF merchant:', process.env.PAYFAST_MERCHANT_ID);
  console.log('Sig len:', signature.length);
  console.log('PF baseString:', base);

  return { signature, base };
}

async function upsertOrder({ 
  merchant_payment_id, 
  amount, 
  currency, 
  email, 
  name,
  items,
  shippingInfo
}: {
  merchant_payment_id: string;
  amount: number;
  currency: string;
  email?: string;
  name?: string;
  items?: any[];
  shippingInfo?: any;
}) {
  // Upsert order to Supabase using service_role key
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.warn('Supabase not configured, skipping order upsert');
    return;
  }

  const orderData = {
    merchant_payment_id,
    status: 'pending',
    total_amount: Number(amount).toFixed(2),
    currency,
    customer_email: email ?? null,
    customer_name: name ?? null,
    customer_mobile: shippingInfo?.phone ?? null,
    shipping_method: shippingInfo?.method ?? null,
    shipping_cost: shippingInfo?.cost ?? 0,
    // Door-to-door delivery fields
    ship_to_street: shippingInfo?.ship_to_street ?? null,
    ship_to_suburb: shippingInfo?.ship_to_suburb ?? null,
    ship_to_city: shippingInfo?.ship_to_city ?? null,
    ship_to_zone: shippingInfo?.ship_to_zone ?? null,
    ship_to_postal_code: shippingInfo?.ship_to_postal_code ?? null,
    ship_to_country: shippingInfo?.ship_to_country ?? null,
    ship_to_lat: shippingInfo?.ship_to_lat ?? null,
    ship_to_lng: shippingInfo?.ship_to_lng ?? null,
    // Locker/Kiosk delivery fields
    locker_id: shippingInfo?.locker_id ?? null,
    locker_name: shippingInfo?.locker_name ?? null,
    locker_street: shippingInfo?.locker_street ?? null,
    locker_suburb: shippingInfo?.locker_suburb ?? null,
    locker_city: shippingInfo?.locker_city ?? null,
    locker_zone: shippingInfo?.locker_zone ?? null,
    locker_postal_code: shippingInfo?.locker_postal_code ?? null,
    locker_country: shippingInfo?.locker_country ?? null,
    locker_lat: shippingInfo?.locker_lat ?? null,
    locker_lng: shippingInfo?.locker_lng ?? null,
    locker_provider: shippingInfo?.locker_provider ?? null,
    updated_at: new Date().toISOString()
  } as Record<string, any>;

  const r = await fetch(`${supabaseUrl}/rest/v1/orders?on_conflict=merchant_payment_id`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(orderData)
  });

  if (!r.ok) {
    const txt = await r.text();
    console.error(`Supabase upsert order failed: ${r.status} ${txt}`);
    throw new Error(`Failed to create order: ${r.status}`);
  }
}

export const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
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
    
    const amountNum = Number(payload.amount);
    const amountStr = Number(payload.amount).toFixed(2);
    const item_name = String(payload.item_name || 'BLOM Order');
    const m_payment_id = String(payload.m_payment_id || `BLOM-${Date.now()}`);
    
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return { 
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid amount' }) 
      };
    }

    // 1) Store order in Supabase
    try {
      await upsertOrder({ 
        merchant_payment_id: m_payment_id, 
        amount: amountNum, 
        currency: 'ZAR', 
        email: payload.email_address,
        name: payload.name_first || payload.name_last
          ? `${payload.name_first ?? ''}${payload.name_last ? ' ' + payload.name_last : ''}`.trim()
          : undefined,
        items: payload.items,
        shippingInfo: payload.shippingInfo
      });
    } catch (e) {
      console.error('Order upsert failed:', e);
      // Continue anyway - we can create order via ITN webhook
    }

    // Helper: HTML auto-submit form
    function htmlAutoPost(action: string, fields: Record<string, any>) {
      const inputs = Object.entries(fields).map(([k, v]) =>
        `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}">`
      ).join('\n');
      return `<!doctype html><meta charset="utf-8"><title>Redirecting…</title>
<body onload="document.forms[0].submit()">
  <form action="${action}" method="post" accept-charset="utf-8">
    ${inputs}
  </form>
</body>`;
    }

    // 2) Minimal hosted-form fields and signing in documentation order (no sorting)
    const fields: Record<string, any> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: RETURN_URL,
      cancel_url: CANCEL_URL,
      notify_url: NOTIFY_URL,
      m_payment_id,
      amount: amountStr,
      item_name
    };

    const order = [
      'merchant_id','merchant_key','return_url','cancel_url','notify_url',
      'm_payment_id','amount','item_name'
    ];

    const parts: string[] = [];
    for (const key of order) {
      const val = (fields as any)[key];
      if (val !== undefined && val !== null && String(val) !== '') {
        parts.push(`${key}=${encPF(val)}`);
      }
    }
    let baseString = parts.join('&');
    if (process.env.PAYFAST_PASSPHRASE) {
      baseString += `&passphrase=${encPF(process.env.PAYFAST_PASSPHRASE)}`;
    }
    const signature = crypto.createHash('md5').update(baseString).digest('hex');

    // TEMP debug logs
    console.log('PF merchant:', process.env.PAYFAST_MERCHANT_ID);
    console.log('Sig len:', signature.length);
    console.log('PF baseString:', baseString);

    fields.signature = signature;

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
