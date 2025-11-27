-- ================================================
-- COMPLETE COUPON SYSTEM FIX - UNIFIED MIGRATION
-- ================================================
-- This migration fixes all coupon system issues:
-- 1. Database schema consistency
-- 2. Fixed vs percentage discount logic
-- 3. Usage tracking
-- 4. Product exclusions
-- 5. Proper currency handling (Rands vs cents)

-- First, let's create a comprehensive coupon validation function
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
  v_discount_cents integer := 0;
  v_discount_type text;
  v_discount_value integer;
  v_min_order integer;
  v_eligible_total_cents integer := 0;
  v_excluded_total_cents integer := 0;
  v_item record;
  v_excluded_ids text[];
BEGIN
  -- Look up coupon by code
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE upper(code) = upper(p_code)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Coupon not found.', 0, 'none', 0, 0, null;
    RETURN;
  END IF;

  -- Check if coupon is active
  IF COALESCE(v_coupon.status, 'inactive') <> 'active' THEN
    RETURN QUERY SELECT false, 'Coupon is not active.', 0, 'none', 0, 0, null;
    RETURN;
  END IF;

  -- Check expiry
  IF v_coupon.valid_until IS NOT NULL AND now() > v_coupon.valid_until THEN
    RETURN QUERY SELECT false, 'Coupon has expired.', 0, 'none', 0, 0, null;
    RETURN;
  END IF;

  -- Check if used up
  IF COALESCE(v_coupon.used_count, 0) >= COALESCE(v_coupon.max_uses, 1) THEN
    RETURN QUERY SELECT false, 'Coupon already used.', 0, 'none', 0, 0, null;
    RETURN;
  END IF;

  -- Check email lock
  IF v_coupon.locked_email IS NOT NULL AND lower(v_coupon.locked_email) <> lower(p_email) THEN
    RETURN QUERY SELECT false, 'Coupon locked to another email.', 0, 'none', 0, 0, null;
    RETURN;
  END IF;

  -- Calculate eligible total considering product exclusions
  -- Convert excluded IDs to text array for easy lookup
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
        -- Add to excluded total
        v_excluded_total_cents := v_excluded_total_cents + (v_item.quantity * COALESCE(v_item.unit_price_cents, 0));
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

  -- Get minimum order amount
  v_min_order := COALESCE(v_coupon.min_order_cents, 50000); -- Default R500
  v_min_order := COALESCE(v_min_order, 0); -- Handle NULL
  
  IF v_eligible_total_cents < v_min_order THEN
    RETURN QUERY SELECT false, 
      format('Order must be at least R%s (excluding restricted items)', v_min_order / 100), 
      0, 'none', 0, v_min_order, v_coupon.id;
    RETURN;
  END IF;

  -- Determine discount type and calculate
  v_discount_type := COALESCE(v_coupon.type, 'percent'); -- Default to percent if type not set
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
      v_min_order,
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
      v_min_order,
      v_coupon.id;
      
  ELSE
    -- Unknown discount type
    RETURN QUERY SELECT false, 'Invalid discount type.', 0, 'none', 0, v_min_order, null;
    RETURN;
  END IF;
END;
$$;

-- Function to mark coupon as used
CREATE OR REPLACE FUNCTION public.mark_coupon_used(p_code text)
RETURNS void
LANGUAGE plpgsql
AS $$
  UPDATE public.coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE upper(code) = upper(p_code);
$$;

-- Ensure all required columns exist in coupons table
DO $$
BEGIN
  -- Add type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.coupons ADD COLUMN type text DEFAULT 'percent' CHECK (type IN ('percent', 'fixed'));
    UPDATE public.coupons SET type = 'percent' WHERE type IS NULL;
  ELSE
    -- Ensure existing coupons have proper type
    UPDATE public.coupons SET type = 'percent' WHERE type IS NULL OR type = 'percentage';
  END IF;

  -- Add value column if it doesn't exist (for fixed discounts)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' AND column_name = 'value'
  ) THEN
    ALTER TABLE public.coupons ADD COLUMN value integer;
  END IF;

  -- Add max_discount_cents column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' AND column_name = 'max_discount_cents'
  ) THEN
    ALTER TABLE public.coupons ADD COLUMN max_discount_cents integer;
  END IF;

  -- Add locked_email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' AND column_name = 'locked_email'
  ) THEN
    ALTER TABLE public.coupons ADD COLUMN locked_email text;
    -- Migrate existing email column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'email') THEN
      UPDATE public.coupons SET locked_email = email WHERE locked_email IS NULL;
      DROP COLUMN IF EXISTS public.coupons.email;
    END IF;
  END IF;

  -- Add excluded_product_ids column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' AND column_name = 'excluded_product_ids'
  ) THEN
    ALTER TABLE public.coupons ADD COLUMN excluded_product_ids text[];
  END IF;

  -- Ensure is_active column exists and is properly set
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.coupons ADD COLUMN is_active boolean DEFAULT true;
    UPDATE public.coupons SET is_active = (status = 'active') WHERE is_active IS NULL;
  END IF;

  -- Update status based on is_active if needed
  UPDATE public.coupons 
  SET status = CASE 
    WHEN is_active = true THEN 'active'
    ELSE 'inactive'
  END
  WHERE status IS NULL OR status <> CASE 
    WHEN is_active = true THEN 'active'
    ELSE 'inactive'
  END;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.redeem_coupon(text, text, integer, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_coupon_used(text) TO anon, authenticated, service_role;

-- Add comments for documentation
COMMENT ON FUNCTION public.redeem_coupon IS 'Validates and calculates coupon discounts. Supports both fixed (Rands) and percentage discount types with product exclusions.';
COMMENT ON FUNCTION public.mark_coupon_used IS 'Increments the usage count for a coupon when it is redeemed.';
COMMENT ON COLUMN public.coupons.type IS 'Discount type: "percent" for percentage or "fixed" for fixed amount';
COMMENT ON COLUMN public.coupons.value IS 'For fixed discounts: amount in Rands (e.g., 250 = R250). For percentage: use percent column instead.';
COMMENT ON COLUMN public.coupons.max_discount_cents IS 'Maximum discount amount in cents for percentage discounts (optional)';
COMMENT ON COLUMN public.coupons.locked_email IS 'Email address that can use this coupon (null for any email)';
COMMENT ON COLUMN public.coupons.excluded_product_ids IS 'Array of product IDs that cannot be discounted with this coupon';

-- Create test coupons for verification
-- Test 1: Fixed discount coupon (R250 off)
INSERT INTO public.coupons (
  code,
  type,
  value,
  min_order_cents,
  max_uses,
  used_count,
  valid_from,
  valid_until,
  status,
  is_active,
  locked_email
) VALUES (
  'TESTFIXED250',
  'fixed',
  250,
  50000,
  100,
  0,
  now(),
  now() + interval '30 days',
  'active',
  true,
  null
) ON CONFLICT (code) DO UPDATE SET
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  min_order_cents = EXCLUDED.min_order_cents,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active;

-- Test 2: Percentage discount coupon (20% off)
INSERT INTO public.coupons (
  code,
  type,
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
) VALUES (
  'TESTPERCENT20',
  'percent',
  20,
  50000,
  100,
  0,
  now(),
  now() + interval '30 days',
  'active',
  true,
  null,
  50000 -- Max R500 discount
) ON CONFLICT (code) DO UPDATE SET
  type = EXCLUDED.type,
  percent = EXCLUDED.percent,
  min_order_cents = EXCLUDED.min_order_cents,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  max_discount_cents = EXCLUDED.max_discount_cents;

-- Test verification queries (these should be run manually to verify the system works)
-- SELECT 'Testing Fixed Discount' as test_name, valid, message, discount_cents/100.0 as discount_rands, discount_type, discount_value 
-- FROM public.redeem_coupon('TESTFIXED250', 'test@example.com', 100000, '[]'::jsonb);
-- 
-- SELECT 'Testing Percentage Discount' as test_name, valid, message, discount_cents/100.0 as discount_rands, discount_type, discount_value 
-- FROM public.redeem_coupon('TESTPERCENT20', 'test@example.com', 100000, '[]'::jsonb);
-- 
-- SELECT 'Testing Below Minimum' as test_name, valid, message, discount_cents/100.0 as discount_rands, discount_type, discount_value 
-- FROM public.redeem_coupon('TESTFIXED250', 'test@example.com', 30000, '[]'::jsonb);

-- Clean up test coupons when done (optional)
-- DELETE FROM public.coupons WHERE code IN ('TESTFIXED250', 'TESTPERCENT20');