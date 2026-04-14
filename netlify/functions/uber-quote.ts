import type { Handler } from '@netlify/functions';

const STORE_LAT = Number(process.env.STORE_LAT ?? -26.1726);
const STORE_LNG = Number(process.env.STORE_LNG ?? 27.7014);
const STORE_RADIUS_KM = Number(process.env.STORE_RADIUS_KM ?? 30);
const STORE_ADDRESS = process.env.STORE_ADDRESS ?? '123 Main Road, Randfontein, 1759';

const UBER_CLIENT_ID = process.env.UBER_DIRECT_CLIENT_ID;
const UBER_CLIENT_SECRET = process.env.UBER_DIRECT_CLIENT_SECRET;
const UBER_CUSTOMER_ID = process.env.UBER_DIRECT_CUSTOMER_ID;
const UBER_SANDBOX = process.env.UBER_SANDBOX === 'true';
const UBER_API_BASE = UBER_SANDBOX ? 'https://sandbox-api.uber.com' : 'https://api.uber.com';
const UBER_AUTH_URL = UBER_SANDBOX
  ? 'https://sandbox-login.uber.com/oauth/v2/token'
  : 'https://login.uber.com/oauth/v2/token';

/** Haversine great-circle distance in km */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getUberToken(): Promise<string> {
  const res = await fetch(UBER_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: UBER_CLIENT_ID!,
      client_secret: UBER_CLIENT_SECRET!,
      grant_type: 'client_credentials',
      scope: 'eats.deliveries',
    }),
  });
  if (!res.ok) throw new Error(`Uber auth failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { lat, lng } = JSON.parse(event.body || '{}');

    if (lat == null || lng == null) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'lat and lng required' }) };
    }

    const distKm = getDistanceKm(STORE_LAT, STORE_LNG, Number(lat), Number(lng));

    if (distKm > STORE_RADIUS_KM) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ available: false, reason: 'outside_radius' }),
      };
    }

    if (!UBER_CLIENT_ID || !UBER_CLIENT_SECRET || !UBER_CUSTOMER_ID) {
      console.warn('Uber Direct env vars not configured — returning mock quote for UI testing');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          available: true,
          fee: 85,
          currency: 'ZAR',
          eta: '45–60 min',
          quoteId: 'mock-quote-test',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        }),
      };
    }

    const token = await getUberToken();

    const quoteRes = await fetch(
      `${UBER_API_BASE}/v1/customers/${UBER_CUSTOMER_ID}/delivery_quotes`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup_address: STORE_ADDRESS,
          pickup_latitude: STORE_LAT,
          pickup_longitude: STORE_LNG,
          dropoff_latitude: Number(lat),
          dropoff_longitude: Number(lng),
        }),
      }
    );

    if (!quoteRes.ok) {
      console.error('Uber quote API failed:', await quoteRes.text());
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ available: false, reason: 'quote_failed' }),
      };
    }

    const quote = await quoteRes.json();

    // Uber Direct returns fee in the currency's smallest unit (cents for ZAR)
    const feeCents = Number(quote.fee ?? quote.total_fee ?? 0);
    const feeRands = feeCents / 100;
    const etaMinutes = quote.duration ? Math.ceil(Number(quote.duration) / 60) : null;
    const etaText = etaMinutes ? `${etaMinutes} min` : 'Same Day';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: true,
        fee: feeRands,
        currency: 'ZAR',
        eta: etaText,
        quoteId: quote.id,
        expiresAt: quote.expires ?? new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      }),
    };
  } catch (e: any) {
    console.error('uber-quote error:', e);
    // Fail silently — existing delivery options still show
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ available: false, reason: 'error' }),
    };
  }
};
