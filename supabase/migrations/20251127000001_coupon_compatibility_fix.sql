-- ================================================
-- COUPON SYSTEM UPDATE - COMPATIBILITY FIX
-- ================================================
-- This migration updates functions to work with the validate_coupon approach
-- Run this ONLY if you need to create test coupons or update the existing functions

-- Step 1: Update redeem_coupon to use the same logic as validate_coupon
CREATE OR REPLACE FUNCTION public.redeem_coupon(
  p_code text,
  p_email text,
  p_order_total_cents integer,
  p_cart_items jsonb DEFAULT '[]'::jsonb
)
RETURNS TABLE (
  valid boolean,
  message text,
  discount_cents integer,
  discount_type text,
  discount_value integer,
  min_order_cents integer,
  coupon_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon public.coupons%rowtype;
  v_validation_result record;
  v_discount_cents integer := 0;
  v_discount_type text;
  v_discount_value integer;
  v_eligible_total_cents integer := 0;
  v_item record;
  v_excluded_ids text[];
BEGIN
  -- First validate the coupon using the existing validate_coupon function
  SELECT * INTO v_validation_result
  FROM public.validate_coupon(p_code, p_order_total_cents, '{}'::uuid[])
  LIMIT 1;

  -- If validation fails, return the error
  IF NOT v_validation_result.valid THEN
    RETURN QUERY SELECT 
      false, 
      v_validation_result.error_message, 
      0, 
      'none', 
      0, 
      v_validation_result.min_order_cents, 
      null;
    RETURN;
  END IF;

  -- Get the coupon data
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE id = v_validation_result.coupon_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Coupon not found', 0, 'none', 0, 0, null;
    RETURN;
  END IF;

  -- Calculate eligible total considering product exclusions
  v_excluded_ids := ARRAY(
    SELECT unnest(string_to_array(COALESCE(v_coupon.excluded_product_ids::text, ''), ','))
    WHERE trim(unnest(string_to_array(COALESCE(v_coupon.excluded_product_ids::text, ''), ','))) <> ''
  );

  -- Process cart items if provided
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS item(product_id text, quantity integer, unit_price_cents integer)
  LOOP
    -- Check if product is excluded
    IF v_excluded_ids IS NOT NULL AND array_length(v_excluded_ids, 1) > 0 THEN
      IF v_item.product_id = ANY(v_excluded_ids) THEN
        CONTINUE;
      END IF;
    END IF;
    
    -- Add to eligible total
    v_eligible_total_cents := v_eligible_total_cents + (v_item.quantity * COALESCE(v_item.unit_price_cents, 0));
  END LOOP;

  -- If no cart items provided, use the order total directly
  IF p_cart_items = '[]'::jsonb OR jsonb_typeof(p_cart_items) IS NULL THEN
    v_eligible_total_cents := p_order_total_cents;
  END IF;

  -- Determine discount type and calculate
  v_discount_type := COALESCE(v_coupon.type, 'percent');
  v_discount_value := CASE 
    WHEN v_discount_type = 'fixed' THEN COALESCE(v_coupon.value, 0)
    ELSE COALESCE(v_coupon.percent, 0)
  END;

  -- Calculate discount based on type using eligible total
  IF v_discount_type = 'fixed' THEN
    -- Fixed discount: value is in Rands, convert to cents
    v_discount_cents := (v_discount_value * 100)::integer;
    
    -- Ensure discount doesn't exceed eligible total
    IF v_discount_cents > v_eligible_total_cents THEN
      v_discount_cents := v_eligible_total_cents;
    END IF;
    
    RETURN QUERY SELECT true,
      format('Coupon applied: R%s off', v_discount_value),
      v_discount_cents,
      v_discount_type,
      v_discount_value,
      v_validation_result.min_order_cents,
      v_coupon.id;
      
  ELSIF v_discount_type = 'percent' THEN
    -- Percentage discount: calculate percentage of eligible total
    v_discount_cents := floor((v_eligible_total_cents * v_discount_value)::numeric / 100)::integer;
    
    -- Apply max discount cap if exists
    IF v_coupon.max_discount_cents IS NOT NULL AND v_discount_cents > v_coupon.max_discount_cents THEN
      v_discount_cents := v_coupon.max_discount_cents;
    END IF;
    
    -- Ensure discount doesn't exceed eligible total
    IF v_discount_cents > v_eligible_total_cents THEN
      v_discount_cents := v_eligible_total_cents;
    END IF;
    
    RETURN QUERY SELECT true,
      format('Coupon applied: %s%% off', v_discount_value),
      v_discount_cents,
      v_discount_type,
      v_discount_value,
      v_validation_result.min_order_cents,
      v_coupon.id;
  ELSE
    RETURN QUERY SELECT false, 'Invalid discount type', 0, 'none', 0, 0, null;
    RETURN;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.redeem_coupon(text, text, integer, jsonb) TO anon, authenticated, service_role;

-- Create test coupons for verification (only if they don't exist)
INSERT INTO public.coupons (
  code,
  type,
  value,
  percent,
  min_order_cents,
  max_uses,
  used_count,
  valid_from,
  valid_until,
  status,
  is_active,
  locked_email,
  max_discount_cents
) VALUES 
  (
    'TESTFIXED250',
    'fixed',
    250,
    null,
    50000,
    100,
    0,
    now(),
    now() + interval '30 days',
    'active',
    true,
    null,
    null
  ),
  (
    'TESTPERCENT20',
    'percent',
    null,
    20,
    50000,
    100,
    0,
    now(),
    now() + interval '30 days',
    'active',
    true,
    null,
    50000
  )
ON CONFLICT (code) DO UPDATE SET
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  percent = EXCLUDED.percent,
  min_order_cents = EXCLUDED.min_order_cents,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  max_discount_cents = EXCLUDED.max_discount_cents;

-- Add comments
COMMENT ON FUNCTION public.redeem_coupon IS 'Redeem coupon with validation and cart item processing. Uses validate_coupon for validation and calculates discount based on eligible items.';
COMMENT ON FUNCTION public.mark_coupon_used IS 'Mark coupon as used, returns boolean indicating success';
COMMENT ON FUNCTION public.validate_coupon IS 'Validate coupon without applying discount, returns detailed validation results';

-- Test queries (uncomment to verify)
-- SELECT 'Testing Fixed Discount' as test_name, * FROM redeem_coupon('TESTFIXED250', 'test@example.com', 100000, '[]'::jsonb);
-- SELECT 'Testing Percentage Discount' as test_name, * FROM redeem_coupon('TESTPERCENT20', 'test@example.com', 100000, '[]'::jsonb);