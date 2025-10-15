import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const q = String(event.queryStringParameters?.q || '').trim();
    if (!q || q.length < 2) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([])
      };
    }

    // Search Supabase za_postal_codes table
    const url = `${process.env.SUPABASE_URL}/rest/v1/za_postal_codes`
      + `?or=(suburb.ilike.*${encodeURIComponent(q)}*,city.ilike.*${encodeURIComponent(q)}*)`
      + `&select=suburb,city,province,postal_code`
      + `&limit=25`;

    const response = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: text })
      };
    }

    const rows = await response.json();
    
    // Deduplicate suburb+city combos and keep a nice display string
    const seen = new Set<string>();
    const list = rows.filter((row: any) => {
      const key = `${row.suburb}|${row.city}|${row.province}|${row.postal_code}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      },
      body: JSON.stringify(list)
    };

  } catch (error: any) {
    console.error('Postal search error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
