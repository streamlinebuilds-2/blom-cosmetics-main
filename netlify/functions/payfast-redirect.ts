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
function payfastSignature(params: Record<string, any>, passphrase?: string) {
  const keys = Object.keys(params).sort();
  const qs = keys.map(k => `${k}=${encPF(params[k])}`).join('&');
  const base = passphrase ? `${qs}&passphrase=${encPF(passphrase)}` : qs;
  return crypto.createHash('md5').update(base).digest('hex');
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

    // 2) Build PayFast params
    const params: Record<string, any> = {
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
      name_last: body.name_last
    };

    // Remove undefined/null values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === null) {
        delete params[key];
      }
    });

    // 3) Compute signature
    const signature = payfastSignature(params, process.env.PAYFAST_PASSPHRASE);

    // 4) Build redirect URL
    const qs = Object.keys(params).sort().map(k => `${k}=${encPF(params[k])}`).join('&');
    const redirectUrl = `${PF_BASE}/eng/process?${qs}&signature=${signature}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ redirectUrl, orderId: m_payment_id })
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
