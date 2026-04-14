import type { Handler } from '@netlify/functions';
import { enrollCourse } from './_lib/enroll-helper';

const PAYFLEX_AUTH_URL = process.env.PAYFLEX_AUTH_URL || 'https://auth-uat.payflex.co.za/auth/merchant';
const PAYFLEX_API_URL = (process.env.PAYFLEX_API_URL || 'https://api.uat.payflex.co.za').replace(/\/+$/, '');
const PAYFLEX_AUDIENCE = process.env.PAYFLEX_AUDIENCE || 'https://auth-dev.payflex.co.za';
const PAYFLEX_CLIENT_ID = process.env.PAYFLEX_CLIENT_ID || '';
const PAYFLEX_CLIENT_SECRET = process.env.PAYFLEX_CLIENT_SECRET || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SITE = (process.env.SITE_URL || process.env.SITE_BASE_URL || 'https://blom-cosmetics.co.za').replace(/\/$/, '');
const N8N_WEBHOOK_URL = 'https://dockerfile-1n82.onrender.com/webhook/notify-order';

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

async function verifyPayflexOrder(payflexOrderId: string): Promise<{ orderStatus: string; merchantReference: string } | null> {
  try {
    const token = await getPayflexToken();
    const res = await fetch(`${PAYFLEX_API_URL}/order/${encodeURIComponent(payflexOrderId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function bookUberDelivery(quoteId: string, order: any) {
  const clientId = process.env.UBER_DIRECT_CLIENT_ID;
  const clientSecret = process.env.UBER_DIRECT_CLIENT_SECRET;
  const customerId = process.env.UBER_DIRECT_CUSTOMER_ID;
  const storeLat = Number(process.env.STORE_LAT ?? -26.1726);
  const storeLng = Number(process.env.STORE_LNG ?? 27.7014);
  const storeAddress = process.env.STORE_ADDRESS ?? '123 Main Road, Randfontein, 1759';
  const storePhone = process.env.STORE_PHONE ?? '';
  const sandbox = process.env.UBER_SANDBOX === 'true';
  const uberApiBase = sandbox ? 'https://sandbox-api.uber.com' : 'https://api.uber.com';
  const uberAuthUrl = sandbox
    ? 'https://sandbox-login.uber.com/oauth/v2/token'
    : 'https://login.uber.com/oauth/v2/token';

  if (!clientId || !clientSecret || !customerId) {
    console.warn('Uber Direct not configured — skipping delivery booking');
    return;
  }

  const tokenRes = await fetch(uberAuthUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials', scope: 'eats.deliveries' })
  });
  if (!tokenRes.ok) throw new Error(`Uber auth failed: ${await tokenRes.text()}`);
  const { access_token } = await tokenRes.json();

  const addr = order.delivery_address || {};
  const dropoffAddress = [addr.street_address, addr.local_area, addr.city, addr.code].filter(Boolean).join(', ');

  const deliveryRes = await fetch(`${uberApiBase}/v1/customers/${customerId}/deliveries`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quote_id: quoteId,
      pickup: { name: 'BLOM Cosmetics', address: storeAddress, location: { lat: storeLat, lng: storeLng }, contact: { name: 'BLOM Cosmetics', phone: storePhone } },
      dropoff: {
        name: order.customer_name || '',
        address: dropoffAddress,
        location: { lat: addr.lat, lng: addr.lng },
        contact: { name: order.customer_name || '', phone: order.customer_mobile || '' }
      },
      manifest_items: [{ name: `BLOM Order ${order.order_number || order.m_payment_id}`, quantity: 1 }]
    })
  });

  if (!deliveryRes.ok) throw new Error(`Uber delivery creation failed: ${await deliveryRes.text()}`);
  const delivery = await deliveryRes.json();
  console.log('✅ Uber delivery booked:', delivery.id, delivery.tracking_url);

  if (SUPABASE_URL && SERVICE_KEY && delivery.id) {
    await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
      method: 'PATCH',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_address: { ...addr, uber_delivery_id: delivery.id, uber_tracking_url: delivery.tracking_url ?? null }, updated_at: new Date().toISOString() })
    });
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const data = JSON.parse(event.body || '{}');
    const payflexOrderId = data.orderId || data.order_id;
    const merchantReference = data.merchantReference || data.merchant?.merchantReference;

    console.log('=== PAYFLEX WEBHOOK RECEIVED ===');
    console.log('Payflex orderId:', payflexOrderId);
    console.log('merchantReference:', merchantReference);
    console.log('Raw status:', data.orderStatus);

    if (!SUPABASE_URL || !SERVICE_KEY) return { statusCode: 500, body: 'Server config missing' };

    // Verify by calling Payflex API directly (no webhook signature)
    let orderStatus = data.orderStatus;
    if (payflexOrderId && PAYFLEX_CLIENT_ID) {
      const verified = await verifyPayflexOrder(payflexOrderId);
      if (verified) {
        orderStatus = verified.orderStatus;
        console.log('✅ Verified status from Payflex API:', orderStatus);
      } else {
        console.warn('⚠️ Could not verify with Payflex API, using webhook payload status');
      }
    }

    // Find the order by merchantReference (= m_payment_id we set when creating the order)
    // This avoids depending on the payflex_order_id column existing yet
    const orParam = merchantReference
      ? encodeURIComponent(`(m_payment_id.eq.${merchantReference},merchant_payment_id.eq.${merchantReference})`)
      : null;

    if (!orParam) {
      console.error('No merchantReference in webhook payload — cannot find order');
      return { statusCode: 200, body: 'Missing merchantReference — acknowledged' };
    }

    const ordRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?or=${orParam}&select=*`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    });
    const orders = await ordRes.json();
    const order = orders?.[0];

    if (!order) {
      console.error('Order not found. payflexOrderId:', payflexOrderId, 'merchantReference:', merchantReference);
      return { statusCode: 200, body: 'Order not found — acknowledged' };
    }

    // Handle non-approved statuses
    if (orderStatus !== 'Approved') {
      console.log(`Payflex status ${orderStatus} — marking order as cancelled`);
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
        method: 'PATCH',
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', payment_status: 'failed', updated_at: new Date().toISOString() })
      });
      return { statusCode: 200, body: 'Payment declined recorded' };
    }

    // Already paid — idempotent
    if (order.status === 'paid') {
      console.log('Order already paid, skipping:', order.id);
      return { statusCode: 200, body: 'Already paid' };
    }

    console.log(`Processing Payflex payment for ${order.id}...`);

    // A) Mark as paid
    await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
      method: 'PATCH',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid', payment_status: 'paid', paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    });

    // B) Increment coupon usage
    if (order.coupon_code) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_coupon_usage`, {
          method: 'POST',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_code: order.coupon_code })
        });
      } catch (e) { console.error('Coupon increment error:', e); }
    }

    // C) Generate invoice
    try {
      const baseUrl = (process.env.URL || process.env.SITE_URL || SITE).replace(/\/$/, '');
      const invRes = await fetch(`${baseUrl}/.netlify/functions/invoice-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ m_payment_id: order.m_payment_id })
      });
      if (invRes.ok) console.log('✅ Invoice generated');
      else console.error('❌ Invoice generation failed:', await invRes.text());
    } catch (e) { console.error('Invoice trigger error:', e); }

    // D) Deduct stock
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/process_order_stock_deduction`, {
        method: 'POST',
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_order_id: order.id })
      });
      console.log('✅ Stock deducted');
    } catch (e) { console.error('Stock deduction error:', e); }

    // D2) Update amount_paid_cents on course purchases
    try {
      const amountCents = order.total_cents ?? Math.round(Number(order.total || 0) * 100);
      const cpCheckRes = await fetch(
        `${SUPABASE_URL}/rest/v1/course_purchases?order_id=eq.${encodeURIComponent(order.id)}&select=id&limit=1`,
        { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
      );
      if (cpCheckRes.ok) {
        const cps = await cpCheckRes.json();
        if (Array.isArray(cps) && cps.length > 0 && Number.isFinite(amountCents) && amountCents > 0) {
          await fetch(`${SUPABASE_URL}/rest/v1/course_purchases?order_id=eq.${encodeURIComponent(order.id)}`, {
            method: 'PATCH',
            headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount_paid_cents: amountCents })
          });
        }
      }
    } catch (e) { console.error('Course purchase amount update error:', e); }

    // E) Notify N8N
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
      console.log('✅ N8N notified');
    } catch (e) { console.error('N8N notification error:', e); }

    // F) Book Uber delivery if applicable
    const uberQuoteId = order.delivery_address?.uber_quote_id;
    if (uberQuoteId) {
      try {
        await bookUberDelivery(uberQuoteId, order);
      } catch (e) { console.error('Uber delivery booking failed:', e); }
    }

    // G) Course enrollments
    try {
      const cpRes = await fetch(
        `${SUPABASE_URL}/rest/v1/course_purchases?order_id=eq.${encodeURIComponent(order.id)}&select=course_slug,invitation_status,buyer_email,buyer_name,buyer_phone`,
        { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
      );
      const coursePurchases = cpRes.ok ? await cpRes.json() : [];
      if (Array.isArray(coursePurchases) && coursePurchases.length > 0) {
        for (const cp of coursePurchases) {
          const status = String(cp?.invitation_status || '').toLowerCase();
          if (status === 'sent' || status === 'redeemed') continue;
          const buyerEmail = String(order.buyer_email || cp.buyer_email || '').trim();
          const courseSlug = String(cp.course_slug || '');
          if (!buyerEmail || !courseSlug) continue;
          try {
            await enrollCourse({ orderId: order.id, courseSlug, buyerEmail, buyerName: order.buyer_name || cp.buyer_name, buyerPhone: order.buyer_phone || cp.buyer_phone });
          } catch (e) { console.error('Course enrollment error:', courseSlug, e); }
        }
      }
    } catch (e) { console.error('Course purchases error:', e); }

    return { statusCode: 200, body: 'Success' };

  } catch (e: any) {
    console.error('payflex-webhook error:', e);
    return { statusCode: 500, body: e.message };
  }
};
