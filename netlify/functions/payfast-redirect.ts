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
function signPayfast(params: Record<string, any>, passphrase?: string) {
  // Include only fields that have a non-empty value (PayFast requirement)
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && String(v) !== '');
  const keys = entries.map(([k]) => k).sort();
  const qs = keys.map(k => `${k}=${encPF(params[k])}`).join('&');
  const base = passphrase ? `${qs}&passphrase=${encPF(passphrase)}` : qs;
  
  // Uncomment to debug in logs if needed:
  // console.log('PF baseString:', base);
  
  return { 
    signature: crypto.createHash('md5').update(base).digest('hex'), 
    base 
  };
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
    const body = JSON.parse(event.body || '{}');
    
    const amount = Number(body.amount);
    const item_name = String(body.item_name || 'BLOM Order');
    const m_payment_id = String(body.m_payment_id || `BLOM-${Date.now()}`);
    const email = body.email_address ? String(body.email_address) : undefined;
    const name = body.name_first || body.name_last
      ? `${body.name_first ?? ''}${body.name_last ? ' ' + body.name_last : ''}`.trim()
      : undefined;
    
    if (!Number.isFinite(amount) || amount <= 0) {
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
        amount, 
        currency: 'ZAR', 
        email, 
        name,
        items: body.items,
        shippingInfo: body.shippingInfo
      });
    } catch (e) {
      console.error('Order upsert failed:', e);
      // Continue anyway - we can create order via ITN webhook
    }

    // 2) Build PayFast params - only include non-empty values
    const params: Record<string, any> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: RETURN_URL,
      cancel_url: CANCEL_URL,
      notify_url: NOTIFY_URL,
      m_payment_id,
      amount: amount.toFixed(2),  // Use 'amount' for the form (not amount_gross)
      item_name,
      // Optional customer fields - only include if not empty
      email_address: email,
      name_first: body.name_first,
      name_last: body.name_last,
      cell_number: body.cell_number
    };

    // 3) Compute signature (only includes non-empty fields)
    const { signature } = signPayfast(params, process.env.PAYFAST_PASSPHRASE);

    // 4) Build HTML auto-POST form (instead of JSON redirect)
    function htmlAutoPost(action: string, fields: Record<string, any>) {
      const inputs = Object.entries(fields)
        .filter(([, v]) => v !== undefined && v !== null && String(v) !== '')
        .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}">`)
        .join('\n');

      return `<!doctype html>
<html><head><meta charset="utf-8"><title>Redirecting…</title></head>
<body onload="document.forms[0].submit();">
  <p>Redirecting to PayFast…</p>
  <form action="${action}" method="post" accept-charset="utf-8">
    ${inputs}
  </form>
</body></html>`;
    }

    // Include the same fields you signed (non-empty), plus signature
    const formFields = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: RETURN_URL,
      cancel_url: CANCEL_URL,
      notify_url: NOTIFY_URL,
      m_payment_id,
      amount: amount.toFixed(2),
      item_name,
      email_address: email,
      name_first: body.name_first,
      name_last: body.name_last,
      cell_number: body.cell_number,
      signature  // ← your 32-char MD5 hex
    };

    // Respond with HTML (not JSON / not 303)
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/html; charset=utf-8'
      },
      body: htmlAutoPost(`${PF_BASE}/eng/process`, formFields)
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
