import type { Handler } from '@netlify/functions';

// Remove a published review by ID or a combination of keys.
// Requires x-review-token header to match N8N_REVIEW_TOKEN.

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    const token = event.headers['x-review-token'] || event.headers['X-Review-Token'];
    const expected = process.env.N8N_REVIEW_TOKEN;
    if (!expected || token !== expected) return { statusCode: 401, body: 'Unauthorized' };

    const body = JSON.parse(event.body || '{}');
    const { id, product_slug, reviewer_name, created_at } = body;

    const supaUrl = process.env.SUPABASE_URL!;
    const srk = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supaUrl || !srk) return { statusCode: 500, body: 'Missing Supabase env' };

    const headers = { apikey: srk, Authorization: `Bearer ${srk}`, 'Content-Type': 'application/json' } as any;

    let url = `${supaUrl}/rest/v1/product_reviews`;
    const params: string[] = [];
    if (id) params.push(`id=eq.${encodeURIComponent(id)}`);
    if (product_slug) params.push(`product_slug=eq.${encodeURIComponent(product_slug)}`);
    if (reviewer_name) params.push(`reviewer_name=eq.${encodeURIComponent(reviewer_name)}`);
    if (created_at) params.push(`created_at=eq.${encodeURIComponent(created_at)}`);

    if (params.length === 0) {
      return { statusCode: 400, body: 'Provide id or (product_slug + reviewer_name) to delete' };
    }

    url += `?${params.join('&')}`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers
    });

    if (!res.ok) {
      const err = await res.text();
      return { statusCode: 502, body: `Supabase error: ${err}` };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};


