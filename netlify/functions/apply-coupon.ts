import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Helper to get Supabase admin client (uses SERVICE_ROLE_KEY)
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Server configuration error: Missing Supabase credentials');
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });
};

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ ok: false, message: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { code, cart, email } = body;
    // Expect: { code: "CODE", cart: [{ product_id, quantity, price }], email?: "user@example.com" }
    // Note: price should be in cents

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, message: 'Coupon code is required' })
      };
    }

    if (!cart || cart.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, message: 'Cart data is required' })
      };
    }

    const supabase = getSupabaseAdmin();
    const now = new Date();

    // 1. Find the coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (couponError || !coupon) {
      console.error('Coupon query error:', couponError);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ ok: false, message: 'Invalid coupon code' })
      };
    }

    // 2. Run all validation checks

    // Check if active
    if (coupon.is_active === false) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, message: 'Coupon is not active' })
      };
    }

    // Check status field if it exists
    if (coupon.status && coupon.status !== 'active') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, message: 'Coupon is not active' })
      };
    }

    // Check if coupon is valid from date
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, message: 'Coupon is not yet valid' })
      };
    }

    // Check if coupon has expired
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, message: 'Coupon has expired' })
      };
    }

    // Check usage limits
    if (coupon.max_uses && (coupon.used_count || 0) >= coupon.max_uses) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, message: 'Coupon has reached its usage limit' })
      };
    }

    // Check email lock (if coupon is locked to specific email)
    if (coupon.locked_email && email) {
      if (coupon.locked_email.toLowerCase() !== email.toLowerCase()) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ ok: false, message: 'This coupon is locked to a different email' })
        };
      }
    } else if (coupon.locked_email && !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, message: 'Email is required for this coupon' })
      };
    }

    // 3. Calculate cart subtotal (price is expected in cents)
    const subtotal_cents = cart.reduce((acc: number, item: any) => {
      const itemPrice = item.price_cents || item.price || 0;
      const quantity = item.quantity || 1;
      return acc + (itemPrice * quantity);
    }, 0);

    // 4. Check Minimum Spend
    const minOrderCents = coupon.min_order_cents || coupon.min_order_total || 0;
    if (minOrderCents && subtotal_cents < minOrderCents) {
      const minSpend = (minOrderCents / 100).toFixed(2);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          ok: false,
          message: `Minimum spend of R${minSpend} required`
        })
      };
    }

    // 5. Check for Excluded Products (if the field exists)
    if (coupon.excluded_product_ids && Array.isArray(coupon.excluded_product_ids)) {
      const cartProductIds = cart.map((item: any) => item.product_id || item.productId || item.id);
      const hasExcludedProduct = cartProductIds.some((id: string) =>
        coupon.excluded_product_ids.includes(id)
      );

      if (hasExcludedProduct) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            ok: false,
            message: 'Coupon is not valid for one or more items in your cart'
          })
        };
      }
    }

    // 6. Calculate the discount
    let discount_cents = 0;

    // Check discount type - support both 'fixed' type and percentage
    if (coupon.type === 'fixed' && coupon.value) {
      // Fixed amount discount (value is in Rands, convert to cents)
      discount_cents = Math.round(coupon.value * 100);
    } else if (coupon.percent || coupon.percent_off || coupon.type === 'percent' || coupon.type === 'percentage') {
      // Percentage discount
      const percentOff = coupon.percent || coupon.percent_off || coupon.value || 0;
      discount_cents = Math.round(subtotal_cents * (percentOff / 100));

      // Check for Max Discount (if the field exists)
      if (coupon.max_discount_cents && discount_cents > coupon.max_discount_cents) {
        discount_cents = coupon.max_discount_cents;
      }
    }

    // Ensure discount isn't more than the total
    if (discount_cents > subtotal_cents) {
      discount_cents = subtotal_cents;
    }

    console.log(`✅ Coupon applied: ${code} | Discount: R${(discount_cents / 100).toFixed(2)} | Subtotal: R${(subtotal_cents / 100).toFixed(2)}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        message: 'Coupon applied successfully',
        coupon_id: coupon.id,
        code: coupon.code,
        discount_cents: discount_cents,
        discount: discount_cents / 100, // Also return in Rands for backward compatibility
        percent: coupon.percent || coupon.percent_off || 0,
        min_order_cents: minOrderCents
      })
    };

  } catch (e: any) {
    console.error('Apply coupon error:', e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, message: e.message || 'Server error' })
    };
  }
};
