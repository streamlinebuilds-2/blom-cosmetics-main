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

    // Query the coupons table directly
    const { data: coupons, error: queryError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'active')
      .eq('is_active', true)
      .single();

    if (queryError || !coupons) {
      console.error('Coupon query error:', queryError);
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, reason: 'Invalid or inactive coupon code' })
      };
    }

    // Check if coupon has expired
    if (coupons.valid_to && new Date(coupons.valid_to) < new Date()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, reason: 'Coupon has expired' })
      };
    }

    // Check if coupon is valid from date
    if (coupons.valid_from && new Date(coupons.valid_from) > new Date()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, reason: 'Coupon is not yet valid' })
      };
    }

    // Check usage limits
    if (coupons.usage_limit && coupons.used_count >= coupons.usage_limit) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, reason: 'Coupon usage limit exceeded' })
      };
    }

    // Calculate cart subtotal
    const cartSubtotal = cart.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Check minimum order total
    if (coupons.min_order_total && cartSubtotal < coupons.min_order_total) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          ok: false, 
          reason: `Minimum order total of R${(coupons.min_order_total / 100).toFixed(2)} required` 
        })
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupons.type === 'percent' || coupons.percent_off) {
      // Percentage discount
      const percentOff = coupons.percent_off || coupons.value || 0;
      discountAmount = (cartSubtotal * percentOff) / 100;
    } else if (coupons.type === 'fixed') {
      // Fixed amount discount
      discountAmount = coupons.value || 0;
    }

    console.log(`✅ Coupon applied: ${code} | Discount: R${(discountAmount).toFixed(2)} | Subtotal: R${(cartSubtotal).toFixed(2)}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        ok: true,
        coupon_id: coupons.id,
        code: coupons.code,
        discount: discountAmount,
        percent_off: coupons.percent_off || 0,
        reason: 'Coupon applied successfully'
      })
    };

  } catch (error: any) {
    console.error('Apply coupon function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Internal server error: ' + error.message })
    };
  }
};
