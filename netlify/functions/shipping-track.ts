import type { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const SHIP_BASE = process.env.SHIPLOGIC_BASE || 'https://api.shiplogic.com';
const SHIP_TOKEN = process.env.SHIPLOGIC_TOKEN!;

export const handler: Handler = async (event) => {
  try {
    const ref = event.queryStringParameters?.ref;
    if (!ref) return { statusCode: 400, body: 'Missing ref' };

    const res = await fetch(`${SHIP_BASE}/v2/tracking/shipments?tracking_reference=${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${SHIP_TOKEN}` }
    });
    if (!res.ok) return { statusCode: res.status, body: await res.text() };

    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (e: any) {
    return { statusCode: 500, body: e.message };
  }
};
