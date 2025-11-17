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
    const { code, cart } = JSON.parse(event.body || '{}');

    if (!code || !cart) {
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

    // 1. Fetch Coupon Data
    const { data: coupon, error: queryError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (queryError || !coupon) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, reason: 'Invalid or inactive coupon code' })
      };
    }

    // 2. Validate Dates & Limits
    const now = new Date();
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, reason: 'Coupon has expired' }) };
    }
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, reason: 'Coupon is not yet valid' }) };
    }
    if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, reason: 'Coupon usage limit exceeded' }) };
    }

    // 3. Calculate Totals (Handling Excluded Products)
    let cartTotalRands = 0;
    let eligibleTotalRands = 0;

    // Normalize excluded IDs to a set of strings for easy lookup
    const excludedIds = new Set((coupon.excluded_product_ids || []).map((id: any) => String(id)));

    cart.forEach((item: any) => {
      const itemPrice = Number(item.price); // Price in Rands (e.g., 140)
      const itemQty = Number(item.quantity);
      const lineTotal = itemPrice * itemQty;

      cartTotalRands += lineTotal;

      // Check if item is excluded (check both 'id' and 'product_id' to be safe)
      const itemId = String(item.id || '');
      const prodId = String(item.product_id || ''); // If cart uses product_id

      if (!excludedIds.has(itemId) && !excludedIds.has(prodId)) {
        eligibleTotalRands += lineTotal;
      }
    });

    // 4. Check Minimum Order (Convert Rands to Cents for comparison)
    // DB stores min_order in CENTS (e.g., 50000 for R500)
    const eligibleTotalCents = Math.round(eligibleTotalRands * 100);
    const minOrderCents = coupon.min_order_cents || coupon.min_order_total || 0; // Check both column names

    if (minOrderCents > 0 && eligibleTotalCents < minOrderCents) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          reason: `Order must be over R${(minOrderCents / 100).toFixed(0)} (excluding restricted items)`
        })
      };
    }

    // 5. Calculate Discount (In Cents)
    let discountCents = 0;

    if (coupon.type === 'fixed') {
      // Fixed amount: coupon.value is likely in Rands (e.g. 50)
      // We convert it to cents
      discountCents = Math.round(Number(coupon.value) * 100);
    }
    else if (coupon.type === 'percent' || coupon.percent_off) {
      // Percentage: coupon.value is e.g. 10 for 10%
      const percent = Number(coupon.value || coupon.percent_off || 0);
      discountCents = Math.round(eligibleTotalCents * (percent / 100));

      // Apply Max Discount Cap (if exists)
      const maxDiscountCents = coupon.max_discount_cents || 0;
      if (maxDiscountCents > 0 && discountCents > maxDiscountCents) {
        discountCents = maxDiscountCents;
      }
    }

    // Safety: Discount cannot exceed the eligible total
    if (discountCents > eligibleTotalCents) {
      discountCents = eligibleTotalCents;
    }

    // 6. Return Success
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        ok: true,
        coupon_id: coupon.id,
        code: coupon.code,
        // Frontend expects discount in Rands
        discount: discountCents / 100,
        // Also send cents just in case
        discount_cents: discountCents,
        reason: 'Coupon applied successfully'
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
