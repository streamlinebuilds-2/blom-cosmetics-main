import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { code, customerId, cart } = JSON.parse(event.body || '{}');

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: 'Coupon code is required' })
      };
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: 'Server configuration error' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the apply_coupon RPC function
    const { data, error } = await supabase.rpc('apply_coupon', {
      p_code: code,
      p_customer_id: customerId || null,
      p_cart: cart || []
    });

    if (error) {
      console.error('Coupon application error:', error);
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: error.message })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Apply coupon function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Internal server error' })
    };
  }
};
