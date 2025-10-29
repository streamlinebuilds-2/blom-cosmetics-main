import type { Handler } from '@netlify/functions';
const API = 'https://api.shiplogic.com/v2';

export const handler: Handler = async (event) => {
  try {
    const ref = event.queryStringParameters?.ref;
    if (!ref) return { statusCode: 400, body: 'ref required' };
    const r = await fetch(`${API}/tracking/shipments?tracking_reference=${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${process.env.SHIPLOGIC_TOKEN!}` }
    });
    const j = await r.json();
    return { statusCode: 200, body: JSON.stringify(j) };
  } catch (e:any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};