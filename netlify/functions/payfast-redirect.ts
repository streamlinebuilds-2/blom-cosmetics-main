import { Handler } from '@netlify/functions';
import crypto from 'crypto';

const PF_BASE = process.env.PAYFAST_MODE === 'live' 
  ? 'https://www.payfast.co.za' 
  : 'https://sandbox.payfast.co.za';
const RETURN_URL = `${process.env.URL}/payment-success`;
const CANCEL_URL = `${process.env.URL}/payment-cancelled`;
const NOTIFY_URL = process.env.N8N_ITN_URL || '';

// PayFast encoding (space -> +, uppercase hex)
function encPF(v: unknown) {
  const enc = encodeURIComponent(String(v ?? ''));
  return enc.replace(/%20/g, '+').replace(/%[0-9a-f]{2}/g, m => m.toUpperCase());
}

// Build signature over sorted key=value and append &passphrase=...
function signPayfast(filteredParams: Record<string, any>, passphrase?: string) {
  const keys = Object.keys(filteredParams).sort();
  const qs = keys.map(k => `${k}=${encPF(filteredParams[k])}`).join('&');
  const base = passphrase ? `${qs}&passphrase=${encPF(passphrase)}` : qs;
  const sig = crypto.createHash('md5').update(base).digest('hex');

  // TEMP LOGS (remove after success)
  console.log('PF merchant:', process.env.PAYFAST_MERCHANT_ID);
  console.log('PF passphrase length:', (process.env.PAYFAST_PASSPHRASE || '').length);
  console.log('PF baseString:', base);
  console.log('PF signature length:', sig.length, 'signature:', sig);

  return { signature: sig, base };
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
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.warn('Supabase not configured, skipping order upsert');
    return;
  }

  const orderData = {
    merchant_payment_id,
    status: 'pending',
    total: amount,
    currency,
    customer_email: email || null,
    customer_name: name || null,
    items: items || [],
    shipping_info: shippingInfo || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const r = await fetch(`${supabaseUrl}/rest/v1/orders`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation'
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

    // 2) Build ONE params object, filter empties, sign THAT exact set, and post THAT exact set
    const params = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,      // 10042668
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,    // da7qpwl4xiggc
      return_url: RETURN_URL,
      cancel_url: CANCEL_URL,
      notify_url: NOTIFY_URL,
      m_payment_id,                                      // from your payload
      amount: amountNum.toFixed(2),                      // string with 2 decimals
      item_name,
      email_address: payload.email_address,
      name_first: payload.name_first,
      name_last: payload.name_last
    };

    // Remove empty/undefined ONLY ONCE, then reuse the same object for signing AND posting
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && String(v) !== '')
    );

    // Compute signature over filtered set (sorted), with passphrase
    const { signature } = signPayfast(filtered, process.env.PAYFAST_PASSPHRASE);

    // Include signature as another field (PayFast expects it in the form)
    filtered.signature = signature;

    // Return HTML that auto-POSTs the exact same fields you signed
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: htmlAutoPost(`${PF_BASE}/eng/process`, filtered)
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
