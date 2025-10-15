import type { Handler } from '@netlify/functions';

const SHIP_BASE = process.env.SHIPLOGIC_BASE || 'https://api.shiplogic.com';
const SHIP_TOKEN = process.env.SHIPLOGIC_TOKEN!;

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Build query string from all query parameters
    const queryParams = new URLSearchParams();
    if (event.queryStringParameters) {
      Object.entries(event.queryStringParameters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
    }

    const queryString = queryParams.toString();
    const url = `${SHIP_BASE}/pickup-points${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${SHIP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: await response.text()
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      },
      body: JSON.stringify(data)
    };

  } catch (error: any) {
    console.error('Pickup points API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
