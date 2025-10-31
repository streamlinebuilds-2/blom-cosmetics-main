import type { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { product_id, name, rating, title, body } = payload;

    // Validate required fields
    if (!product_id || !name || typeof rating !== 'number') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Missing required fields',
          details: `product_id: ${!!product_id}, name: ${!!name}, rating: ${typeof rating}`
        })
      };
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'rating must be between 1 and 5' })
      };
    }

    // Validate body is not empty (required by database schema)
    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Review body is required and cannot be empty' })
      };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing Supabase configuration' })
      };
    }

    // Get product slug from product_id if it's a UUID, otherwise assume it's already a slug
    // For simplicity, if product_id looks like a UUID, we'll need to fetch the slug
    // Otherwise, treat it as a slug directly
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product_id);
    let product_slug = product_id;

    if (isUUID) {
      // Fetch product slug from database
      const productRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${product_id}&select=slug`, {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`
        }
      });
      if (productRes.ok) {
        const products = await productRes.json();
        if (products.length > 0) {
          product_slug = products[0].slug;
        }
      }
    }

    // Insert review into product_reviews table
    const reviewPayload = {
      product_slug,
      product_id: isUUID ? product_id : null,
      reviewer_name: name.trim(),
      reviewer_email: null,
      title: title ? title.trim() : null,
      body: body.trim(),
      rating: Math.round(rating),
      photos: [],
      is_verified_buyer: false,
      order_id: null
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/product_reviews`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(reviewPayload)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Supabase error:', err);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to save review', details: err })
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, id: Array.isArray(data) ? data[0]?.id : data?.id })
    };
  } catch (e: any) {
    console.error('Review intake error:', e);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message || 'Internal server error' })
    };
  }
};

