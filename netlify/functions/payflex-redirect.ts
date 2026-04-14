import { Handler } from '@netlify/functions';

const PAYFLEX_AUTH_URL = process.env.PAYFLEX_AUTH_URL || 'https://auth-uat.payflex.co.za/auth/merchant';
const PAYFLEX_API_URL = (process.env.PAYFLEX_API_URL || 'https://api.uat.payflex.co.za').replace(/\/+$/, '');
const PAYFLEX_AUDIENCE = process.env.PAYFLEX_AUDIENCE || 'https://auth-dev.payflex.co.za';
const PAYFLEX_CLIENT_ID = process.env.PAYFLEX_CLIENT_ID || '';
const PAYFLEX_CLIENT_SECRET = process.env.PAYFLEX_CLIENT_SECRET || '';
const SITE_BASE_URL = (process.env.SITE_BASE_URL || process.env.URL || 'https://blom-cosmetics.co.za').replace(/\/+$/, '');
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

export const handler: Handler = async (event) => {
  console.log('=== PAYFLEX REDIRECT DEBUG ===');
  console.log('Environment:', {
    PAYFLEX_CLIENT_ID: PAYFLEX_CLIENT_ID,
    PAYFLEX_CLIENT_SECRET: PAYFLEX_CLIENT_SECRET ? 'SET' : 'MISSING',
    PAYFLEX_API_URL: PAYFLEX_API_URL,
    PAYFLEX_AUTH_URL: PAYFLEX_AUTH_URL,
    PAYFLEX_AUDIENCE: PAYFLEX_AUDIENCE,
    SITE_BASE_URL: SITE_BASE_URL,
  });

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const payload = JSON.parse(event.body || '{}');
    const { order_id, m_payment_id, amount, shipping_amount, consumer, items } = payload;

    if (!order_id || !m_payment_id || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing or invalid fields' }) };
    }

    if (!PAYFLEX_CLIENT_ID || !PAYFLEX_CLIENT_SECRET) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Payflex credentials not configured' }) };
    }

    // 1. Get OAuth token
    const accessToken = await getPayflexToken();

    // 2. Create Payflex order
    const orderBody: Record<string, any> = {
      merchantReference: m_payment_id,
      amount: Number(Number(amount).toFixed(2)),
      taxAmount: 0,
      shippingAmount: Number(Number(shipping_amount || 0).toFixed(2)),
      merchant: {
        redirectConfirmUrl: `${SITE_BASE_URL}/checkout/status?order=${order_id}`,
        redirectCancelUrl: `${SITE_BASE_URL}/checkout/cancel`,
        statusCallbackUrl: `${SITE_BASE_URL}/.netlify/functions/payflex-webhook`
      }
    };

    if (consumer) {
      orderBody.consumer = {
        givenNames: consumer.givenNames || '',
        surname: consumer.surname || '',
        email: consumer.email || '',
        phoneNumber: consumer.phoneNumber || ''
      };
    }

    if (Array.isArray(items) && items.length > 0) {
      orderBody.items = items.map((it: any) => ({
        name: String(it.name || 'Product'),
        sku: String(it.sku || ''),
        quantity: Number(it.quantity || 1),
        price: Number(Number(it.price || 0).toFixed(2))
      }));
    }

    const pfRes = await fetch(`${PAYFLEX_API_URL}/order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderBody)
    });

    if (!pfRes.ok) {
      const errText = await pfRes.text();
      console.error('Payflex order creation failed:', pfRes.status, errText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Payflex error: ${errText}` }) };
    }

    const pfData = await pfRes.json();
    const { orderId: payflexOrderId, redirectUrl } = pfData;

    if (!redirectUrl) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'No redirectUrl from Payflex' }) };
    }

    // 3. Store payflex_order_id + payment_method on Supabase order (best-effort)
    if (SUPABASE_URL && SERVICE_KEY && order_id) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(order_id)}`, {
          method: 'PATCH',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            payflex_order_id: payflexOrderId,
            payment_method: 'payflex',
            updated_at: new Date().toISOString()
          })
        });
      } catch (e) {
        console.warn('Could not update payflex_order_id on order (columns may not exist yet):', e);
      }
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkout_url: redirectUrl, payflex_order_id: payflexOrderId })
    };

  } catch (e: any) {
    console.error('payflex-redirect error:', e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message || 'Checkout error' }) };
  }
};
