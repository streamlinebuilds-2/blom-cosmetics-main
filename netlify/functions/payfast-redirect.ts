import { Handler } from '@netlify/functions';
import crypto from 'crypto';

// FIXED VERSION - Correct signature order for PayFast

// Always use live endpoint
const PF_BASE = 'https://www.payfast.co.za';
const SITE_BASE_URL = (process.env.SITE_BASE_URL || process.env.URL || 'https://blom-cosmetics.co.za').replace(/\/+$/, '');
const CANCEL_URL = `${SITE_BASE_URL}/checkout/cancel`;
// CRITICAL: This must match what PayFast is configured to send to
const NOTIFY_URL = `${SITE_BASE_URL}/.netlify/functions/payfast-itn`;

// PHP-style urlencode for PayFast: spaces -> +, and encode ! ' ( ) *
function encPF(v: unknown) {
  return encodeURIComponent(String(v ?? ''))
    .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+');
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
    delivery_address: shippingInfo?.method === 'door-to-door' ? {
      street_address: shippingInfo?.ship_to_street ?? null,
      local_area: shippingInfo?.ship_to_suburb ?? null,
      city: shippingInfo?.ship_to_city ?? null,
      zone: shippingInfo?.ship_to_zone ?? null,
      code: shippingInfo?.ship_to_postal_code ?? null,
      country: shippingInfo?.ship_to_country ?? null,
      lat: shippingInfo?.ship_to_lat ?? null,
      lng: shippingInfo?.ship_to_lng ?? null
    } : null,
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

    // 2) Build PayFast redirect with CORRECT signature order
    // CRITICAL: PayFast validates signature in THIS EXACT ORDER
    // Use order_id from payload if available, otherwise use m_payment_id
    const orderId = payload.order_id || m_payment_id;
    const RETURN_URL = `${SITE_BASE_URL}/checkout/status?order=${orderId}`;
    
    const fields: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID || '',
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || '',
      return_url: RETURN_URL,
      cancel_url: CANCEL_URL,
      notify_url: NOTIFY_URL,
      m_payment_id,
      amount: amountStr,
      item_name
    };

    // PayFast signature order - MUST be in this exact sequence
    const signatureOrder = [
      'merchant_id',
      'merchant_key',
      'return_url',
      'cancel_url',
      'notify_url',
      'm_payment_id',
      'amount',
      'item_name'
    ];

    // Build signature string
    const parts: string[] = [];
    for (const key of signatureOrder) {
      const val = fields[key];
      if (val !== undefined && val !== null && String(val) !== '') {
        parts.push(`${key}=${encPF(val)}`);
      }
    }
    
    let baseString = parts.join('&');
    
    // Add passphrase if configured
    if (process.env.PAYFAST_PASSPHRASE) {
      baseString += `&passphrase=${encPF(process.env.PAYFAST_PASSPHRASE)}`;
    }
    
    // Generate MD5 signature
    const signature = crypto.createHash('md5').update(baseString).digest('hex');

    // Debug logging (remove in production)
    console.log('PayFast Signature Debug:');
    console.log('- Merchant ID:', process.env.PAYFAST_MERCHANT_ID);
    console.log('- Amount:', amountStr);
    console.log('- m_payment_id:', m_payment_id);
    console.log('- Signature length:', signature.length);
    console.log('- Base string:', baseString.substring(0, 200) + '...');

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
