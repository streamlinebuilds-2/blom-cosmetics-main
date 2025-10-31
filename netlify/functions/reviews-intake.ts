import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event) => {
  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: CORS_HEADERS, body: 'ok' };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Empty request body' })
      };
    }

    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { product_id, name, rating, title, body } = payload;

    // Validate required fields
    if (!product_id || !name || typeof rating !== 'number') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
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
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'rating must be between 1 and 5' })
      };
    }

    // Validate body is not empty (required by database schema)
    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Review body is required and cannot be empty' })
      };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing Supabase configuration' })
      };
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Get product slug from product_id if it's a UUID, otherwise assume it's already a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(product_id));
    let product_slug = String(product_id);

    if (isUUID) {
      // Fetch product slug from database
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('slug')
        .eq('id', product_id)
        .single();

      if (!productError && productData?.slug) {
        product_slug = productData.slug;
      }
    }

    // Insert review into product_reviews table
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_slug,
        product_id: isUUID ? product_id : null,
        reviewer_name: String(name).trim(),
        reviewer_email: null,
        title: title ? String(title).trim() : null,
        body: String(body).trim(),
        rating: Math.round(rating),
        photos: [],
        is_verified_buyer: false,
        order_id: null
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          error: 'Failed to save review',
          details: error.message 
        })
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: true, id: data?.id })
    };
  } catch (e: any) {
    console.error('Review intake error:', e);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: e.message || 'Unknown error'
      })
    };
  }
};

