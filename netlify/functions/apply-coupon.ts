import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: 'Method not allowed' })
    };
  }

  try {
    const { code, cart, email } = JSON.parse(event.body || '{}');

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: 'Coupon code is required' })
      };
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: 'Server configuration error' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Convert cart items to the format expected by the new redeem_coupon function
    let cartItemsForValidation: Array<{product_id: string, quantity: number, unit_price_cents: number}> = [];
    let productSubtotalCents = 0;

    if (Array.isArray(cart) && cart.length > 0) {
      cartItemsForValidation = cart.map((item: any) => {
        const unitPriceCents = Math.round(Number(item.price || 0) * 100);
        const quantity = Number(item.quantity || 1);
        const lineTotalCents = unitPriceCents * quantity;
        productSubtotalCents += lineTotalCents;

        return {
          product_id: String(item.product_id || item.id || ''),
          quantity: quantity,
          unit_price_cents: unitPriceCents
        };
      });
    }

    // Use redeem_coupon RPC function
    console.log('🔍 Validating coupon:', {
      code: code.toUpperCase(),
      email: email || '',
      subtotal_cents: productSubtotalCents
    });

    const { data: couponResult, error } = await supabase.rpc('redeem_coupon', {
      p_code: code.toUpperCase(),
      p_email: email || '',
      p_order_total_cents: productSubtotalCents
    });

    if (error) {
      console.error('❌ Coupon RPC error:', error);
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: 'Coupon validation failed' })
      };
    }

    // The RPC returns an array with one row
    const result = Array.isArray(couponResult) ? couponResult[0] : couponResult;

    if (!result || !result.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          ok: false, 
          error: result?.message || 'Invalid coupon code',
          code: code.toUpperCase()
        })
      };
    }

    // Success - return coupon details with validation token
    const discountRands = Number(result.discount_cents) / 100;
    const validationToken = result.validation_token;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: true,
        coupon_id: result.coupon_id,
        code: code.toUpperCase(),
        discount: discountRands,
        discount_cents: result.discount_cents,
        discount_type: result.discount_type,
        discount_value: result.discount_value,
        message: result.message,
        min_order_cents: result.min_order_cents,
        validation_token: validationToken // Frontend should store this and send with order creation
      })
    };

  } catch (error: any) {
    console.error('Apply coupon error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Server error' })
    };
  }
};
