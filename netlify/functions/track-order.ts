import { Handler } from '@netlify/functions';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export const handler: Handler = async (event) => {
  try {
    const id = event.queryStringParameters?.m_payment_id;
    if (!id) return { statusCode: 400, body: 'Missing m_payment_id' };
    if (!SUPABASE_URL || !SRK) return { statusCode: 500, body: 'Supabase not configured' };

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?select=merchant_payment_id,status,total_amount,created_at,shipping_info&merchant_payment_id=eq.${encodeURIComponent(id)}&limit=1`,
      { headers: { apikey: SRK, Authorization: `Bearer ${SRK}` } }
    );
    if (!res.ok) return { statusCode: res.status, body: await res.text() };
    const data = await res.json();
    const order = data?.[0];
    if (!order) return { statusCode: 404, body: 'Order not found' };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    };
  } catch (e: any) {
    return { statusCode: 500, body: `Track error: ${e.message}` };
  }
};


