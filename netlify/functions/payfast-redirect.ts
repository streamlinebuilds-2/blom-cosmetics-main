import { Handler } from '@netlify/functions';
import crypto from 'crypto';

const PF_BASE = 'https://www.payfast.co.za';
const SITE_BASE_URL = process.env.SITE_BASE_URL || process.env.URL || '';
const RETURN_URL = `${SITE_BASE_URL}/checkout/status`;
const CANCEL_URL = `${SITE_BASE_URL}/checkout/cancel`;
const NOTIFY_URL = process.env.PAYFAST_NOTIFY_URL || '';

function encPF(v: unknown) {
  return encodeURIComponent(String(v ?? ''))
    .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+');
}

async function upsertOrder({ merchant_payment_id, amount, currency, email, name, items, shippingInfo }: any) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.warn('Supabase not configured');
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
  };

  await fetch(`${supabaseUrl}/rest/v1/orders?on_conflict=merchant_payment_id`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(orderData)
  });
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const payload = JSON.parse(event.body || '{}');
    
    const amountNum = Number(payload.amount);
    const amountStr = amountNum.toFixed(2);
    const item_name = String(payload.item_name || 'BLOM Order');
    const m_payment_id = String(payload.m_payment_id || `BLOM-${Date.now()}`);
    
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid amount' }) };
    }

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
    }

    // Build fields - start with required
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

    // Add optional fields if present
    if (payload.name_first) fields.name_first = String(payload.name_first);
    if (payload.name_last) fields.name_last = String(payload.name_last);
    if (payload.email_address) fields.email_address = String(payload.email_address);
    if (payload.custom_str1) fields.custom_str1 = String(payload.custom_str1);

    // Signature order with optional fields
    const signatureOrder = [
      'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
      'name_first', 'name_last', 'email_address',
      'm_payment_id', 'amount', 'item_name', 'custom_str1'
    ];

    const parts: string[] = [];
    for (const key of signatureOrder) {
      const val = fields[key];
      if (val !== undefined && val !== null && String(val) !== '') {
        parts.push(`${key}=${encPF(val)}`);
      }
    }
    
    let baseString = parts.join('&');
    if (process.env.PAYFAST_PASSPHRASE) {
      baseString += `&passphrase=${encPF(process.env.PAYFAST_PASSPHRASE)}`;
    }
    
    const signature = crypto.createHash('md5').update(baseString).digest('hex');
    fields.signature = signature;

    function htmlAutoPost(action: string, fields: Record<string, any>) {
      const inputs = Object.entries(fields).map(([k, v]) =>
        `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}">`
      ).join('\n    ');
      
      return `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting...</title></head><body onload="document.forms[0].submit()"><form action="${action}" method="post">${inputs}<p>Redirecting... <button type="submit">Click if not redirected</button></p></form></body></html>`;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: htmlAutoPost(`${PF_BASE}/eng/process`, fields)
    };

  } catch (e: any) {
    console.error('PayFast error:', e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
