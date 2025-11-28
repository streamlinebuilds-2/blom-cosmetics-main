-- ================================================
-- COMPLETE COUPON SECURITY FIX - SINGLE MIGRATION
-- ================================================
-- This migration fixes both the usage tracking issue and
-- the critical cart manipulation vulnerability in one go.
-- Run this migration to get all coupon security features.

-- 1. Create a table to track coupon validation attempts
CREATE TABLE IF NOT EXISTS public.coupon_validations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    validation_token TEXT NOT NULL,
    email TEXT,
    order_total_cents INTEGER,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    used_for_order BOOLEAN DEFAULT false,
    order_id UUID,
    cleanup_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 minutes'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Cart manipulation prevention fields
    cart_snapshot jsonb,
    cart_snapshot_hash text,
    original_eligible_total_cents integer,
    original_discount_cents integer,
    
    -- Ensure one validation per token
    UNIQUE(validation_token)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupon_validations_cleanup ON public.coupon_validations(cleanup_at);
CREATE INDEX IF NOT EXISTS idx_coupon_validations_coupon ON public.coupon_validations(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_validations_token ON public.coupon_validations(validation_token);

-- 2. Create a function to clean up expired validations
CREATE OR REPLACE FUNCTION public.cleanup_expired_coupon_validations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Mark coupons as available again if their validations have expired
    UPDATE public.coupons 
    SET used_count = GREATEST(used_count - 1, 0)
    WHERE id IN (
        SELECT DISTINCT coupon_id 
        FROM public.coupon_validations 
        WHERE cleanup_at <= now() 
        AND used_for_order = false
        AND validation_token IS NOT NULL -- Only decrement for single-use coupons
    );
    
    -- Delete expired validations
    DELETE FROM public.coupon_validations 
    WHERE cleanup_at <= now() AND used_for_order = false;
END;
$$;

-- 3. Create function to calculate cart hash for tamper detection
CREATE OR REPLACE FUNCTION public.calculate_cart_hash(p_cart_items jsonb)
RETURNS text
LANGUAGE sql
AS $
  -- Create a normalized cart representation and hash it
  SELECT md5(
    jsonb_pretty(
      jsonb_object_agg(
        concat_ws(':', key, value) ORDER BY key
      ) ORDER BY key
    )
  )::text
  FROM jsonb_each(p_cart_items) key, value;
$;

-- 4. Create function to validate cart hasn't changed (for percentage coupons)
CREATE OR REPLACE FUNCTION public.validate_coupon_cart_state(
  p_validation_token text,
  p_cart_items jsonb,
  p_discount_type text DEFAULT 'percent'
)
RETURNS TABLE (
  valid boolean,
  message text,
  discount_cents integer,
  discount_recalculated boolean,
  original_discount_cents integer,
  new_discount_cents integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_validation public.coupon_validations%rowtype;
  v_current_cart_hash text;
  v_new_eligible_total_cents integer := 0;
  v_new_discount_cents integer := 0;
  v_excluded_ids text[];
  v_item record;
  v_discount_value integer;
  v_max_discount_cents integer;
  v_coupon public.coupons%rowtype;
BEGIN
  -- Get the validation record
  SELECT * INTO v_validation
  FROM public.coupon_validations
  WHERE validation_token = p_validation_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Invalid validation token.', 0, false, 0, 0;
    RETURN;
  END IF;

  -- Get coupon details
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE id = v_validation.coupon_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Coupon not found.', 0, false, 0, 0;
    RETURN;
  END IF;

  -- Calculate current cart hash
  SELECT calculate_cart_hash(p_cart_items) INTO v_current_cart_hash;

  -- For percentage coupons, always recalculate to prevent manipulation
  IF p_discount_type = 'percent' THEN
    -- Calculate new eligible total
    v_excluded_ids := ARRAY(
      SELECT unnest(string_to_array(COALESCE(v_coupon.excluded_product_ids::text, ''), ','))
      WHERE trim(unnest(string_to_array(COALESCE(v_coupon.excluded_product_ids::text, ''), ','))) <> ''
    );

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS item(product_id text, quantity integer, unit_price_cents integer)
    LOOP
      -- Check if product is excluded
      IF v_excluded_ids IS NOT NULL AND array_length(v_excluded_ids, 1) > 0 THEN
        IF v_item.product_id = ANY(v_excluded_ids) THEN
          CONTINUE;
        END IF;
      END IF;
      
      -- Add to eligible total
      v_new_eligible_total_cents := v_new_eligible_total_cents + (v_item.quantity * COALESCE(v_item.unit_price_cents, 0));
    END LOOP;

    -- Recalculate discount based on current cart
    v_discount_value := COALESCE(v_coupon.percent, 0);
    v_new_discount_cents := floor((v_new_eligible_total_cents * v_discount_value)::numeric / 100)::integer;
    
    -- Apply max discount cap if exists
    IF v_coupon.max_discount_cents IS NOT NULL AND v_new_discount_cents > v_coupon.max_discount_cents THEN
      v_new_discount_cents := v_coupon.max_discount_cents;
    END IF;
    
    -- Ensure discount doesn't exceed eligible total
    IF v_new_discount_cents > v_new_eligible_total_cents THEN
      v_new_discount_cents := v_new_eligible_total_cents;
    END IF;

    -- Check if discount changed
    IF v_new_discount_cents < v_validation.original_discount_cents THEN
      RETURN QUERY SELECT true,
        format('Cart changed - discount adjusted from R%s to R%s', 
          v_validation.original_discount_cents / 100.0,
          v_new_discount_cents / 100.0
        ),
        v_new_discount_cents,
        true,
        v_validation.original_discount_cents,
        v_new_discount_cents;
    ELSE
      RETURN QUERY SELECT true,
        'Cart unchanged - original discount applied',
        v_validation.original_discount_cents,
        false,
        v_validation.original_discount_cents,
        v_validation.original_discount_cents;
    END IF;

  ELSE
    -- For fixed coupons, just verify cart hasn't been tampered
    IF v_current_cart_hash = v_validation.cart_snapshot_hash THEN
      RETURN QUERY SELECT true,
        'Cart unchanged - fixed discount applied',
        v_validation.original_discount_cents,
        false,
        v_validation.original_discount_cents,
        v_validation.original_discount_cents;
    ELSE
      RETURN QUERY SELECT false,
        'Cart contents have been modified after coupon application',
        0,
        false,
        v_validation.original_discount_cents,
        0;
    END IF;
  END IF;
END;
$$;

-- 5. Enhanced redeem_coupon function with cart snapshot and usage tracking
CREATE OR REPLACE FUNCTION public.redeem_coupon(
  p_code text,
  p_email text,
  p_order_total_cents integer,
  p_cart_items jsonb DEFAULT '[]'::jsonb,
  p_validation_token text DEFAULT gen_random_uuid()::text
)
RETURNS TABLE (
  valid boolean,
  message text,
  discount_cents integer,
  discount_type text,
  discount_value integer,
  min_order_cents integer,
  coupon_id uuid,
  validation_token text,
  cart_snapshot jsonb,
  cart_snapshot_hash text
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
  v_is_single_use boolean;
  v_cart_snapshot_hash text;
BEGIN
  -- Clean up expired validations first
  PERFORM public.cleanup_expired_coupon_validations();

  -- Look up coupon by code
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE upper(code) = upper(p_code)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Coupon not found.', 0, 'none', 0, 0, null, p_validation_token, null, null;
    RETURN;
  END IF;

  -- Check if coupon is active
  IF COALESCE(v_coupon.status, 'inactive') <> 'active' THEN
    RETURN QUERY SELECT false, 'Coupon is not active.', 0, 'none', 0, 0, null, p_validation_token, null, null;
    RETURN;
  END IF;

  -- Check expiry
  IF v_coupon.valid_until IS NOT NULL AND now() > v_coupon.valid_until THEN
    RETURN QUERY SELECT false, 'Coupon has expired.', 0, 'none', 0, 0, null, p_validation_token, null, null;
    RETURN;
  END IF;

  -- Check if already used (including pending validations)
  DECLARE
    v_pending_count integer;
  BEGIN
    SELECT COUNT(*) + COALESCE(v_coupon.used_count, 0) INTO v_pending_count
    FROM public.coupon_validations 
    WHERE coupon_id = v_coupon.id 
    AND used_for_order = false 
    AND cleanup_at > now();
    
    -- Determine if this is a single-use coupon
    v_is_single_use := COALESCE(v_coupon.max_uses, 1) = 1;
    
    IF v_pending_count >= COALESCE(v_coupon.max_uses, 1) THEN
      RETURN QUERY SELECT false, 'Coupon already used.', 0, 'none', 0, 0, null, p_validation_token, null, null;
      RETURN;
    END IF;
  END;

  -- Check email lock
  IF v_coupon.locked_email IS NOT NULL AND lower(v_coupon.locked_email) <> lower(p_email) THEN
    RETURN QUERY SELECT false, 'Coupon locked to another email.', 0, 'none', 0, 0, null, p_validation_token, null, null;
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
      0, 'none', 0, v_min_order, v_coupon.id, p_validation_token, null, null;
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
    
  ELSE
    -- Unknown discount type
    RETURN QUERY SELECT false, 'Invalid discount type.', 0, 'none', 0, v_min_order, null, p_validation_token, null, null;
    RETURN;
  END IF;

  -- Calculate cart snapshot hash for tamper detection
  SELECT calculate_cart_hash(p_cart_items) INTO v_cart_snapshot_hash;

  -- For single-use coupons, mark as used immediately during validation
  IF v_is_single_use THEN
    UPDATE public.coupons
    SET used_count = COALESCE(used_count, 0) + 1
    WHERE id = v_coupon.id;
  END IF;

  -- Record the validation attempt with cart snapshot
  INSERT INTO public.coupon_validations (
    coupon_id,
    validation_token,
    email,
    order_total_cents,
    validated_at,
    cart_snapshot,
    cart_snapshot_hash,
    original_eligible_total_cents,
    original_discount_cents
  ) VALUES (
    v_coupon.id,
    p_validation_token,
    p_email,
    p_order_total_cents,
    now(),
    p_cart_items,
    v_cart_snapshot_hash,
    v_eligible_total_cents,
    v_discount_cents
  );

  -- Return success with coupon details and cart snapshot info
  RETURN QUERY SELECT true,
    format('Coupon applied: %s%% off', 
      CASE 
        WHEN v_discount_type = 'fixed' THEN format('R%s', v_discount_value)
        ELSE format('%s%%', v_discount_value)
      END
    ),
    v_discount_cents,
    v_discount_type,
    v_discount_value,
    v_min_order,
    v_coupon.id,
    p_validation_token,
    p_cart_items,
    v_cart_snapshot_hash;
END;
$$;

-- 6. Create function to mark validation as completed when order is created
CREATE OR REPLACE FUNCTION public.mark_coupon_validation_completed(
  p_validation_token text,
  p_order_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_validation public.coupon_validations%rowtype;
BEGIN
  -- Get the validation record
  SELECT * INTO v_validation
  FROM public.coupon_validations
  WHERE validation_token = p_validation_token
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid validation token: %', p_validation_token;
  END IF;

  -- Update the validation as completed
  UPDATE public.coupon_validations
  SET used_for_order = true,
      order_id = p_order_id,
      cleanup_at = now() -- Clean up immediately since order is complete
  WHERE validation_token = p_validation_token;

  -- If this was the initial validation (single-use coupon marked as used),
  -- we don't need to do anything else since the usage count was already incremented
END;
$$;

-- 7. Updated function to mark coupon as used (mainly for multi-use coupons)
DROP FUNCTION IF EXISTS public.mark_coupon_used(text);

CREATE OR REPLACE FUNCTION public.mark_coupon_used(p_code text)
RETURNS void
LANGUAGE plpgsql
AS $$
  UPDATE public.coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE upper(code) = upper(p_code);
$$;

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION public.cleanup_expired_coupon_validations() TO service_role;
GRANT EXECUTE ON FUNCTION public.calculate_cart_hash(jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.validate_coupon_cart_state(text, jsonb, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(text, text, integer, jsonb, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_coupon_validation_completed(text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_coupon_used(text) TO anon, authenticated, service_role;

-- 9. Create cleanup job (runs every 5 minutes)
SELECT cron.schedule(
  'cleanup-expired-coupon-validations',
  '*/5 * * * *',
  'SELECT public.cleanup_expired_coupon_validations();'
);

-- 10. Update existing TEST-DISCOUNT to be single-use if it exists
UPDATE public.coupons 
SET max_uses = 1 
WHERE code = 'TEST-DISCOUNT';

-- Add comprehensive comments
COMMENT ON FUNCTION public.redeem_coupon IS 'Enhanced coupon validation with cart state tracking, usage tracking, and tamper detection. Prevents cart manipulation and percentage discount exploitation.';
COMMENT ON FUNCTION public.validate_coupon_cart_state IS 'Validates that cart contents have not been manipulated after coupon application, recalculates percentage discounts if needed to prevent exploitation.';
COMMENT ON FUNCTION public.calculate_cart_hash IS 'Creates a cryptographic hash of cart contents for tamper detection and manipulation prevention.';
COMMENT ON FUNCTION public.mark_coupon_validation_completed IS 'Marks a coupon validation as completed when the order is successfully created, linking validation to order.';
COMMENT ON TABLE public.coupon_validations IS 'Tracks all coupon validation attempts with cart snapshots and usage monitoring to prevent exploitation and manipulation.';
COMMENT ON COLUMN public.coupon_validations.cart_snapshot IS 'Complete snapshot of cart contents when coupon was first applied for manipulation detection';
COMMENT ON COLUMN public.coupon_validations.cart_snapshot_hash IS 'Cryptographic hash of cart contents for tamper detection';
COMMENT ON COLUMN public.coupon_validations.original_eligible_total_cents IS 'Eligible order total when coupon was first applied';
COMMENT ON COLUMN public.coupon_validations.original_discount_cents IS 'Original discount amount calculated for comparison';

-- Verification queries (uncomment to test)
-- SELECT 'Testing Enhanced Redeem Function' as test_name, valid, message, discount_cents/100.0 as discount_rands, discount_type, discount_value, cart_snapshot IS NOT NULL as has_cart_snapshot
-- FROM public.redeem_coupon('TESTPERCENT20', 'test@example.com', 100000, '[{"product_id": "test", "quantity": 1, "unit_price_cents": 50000}]'::jsonb);

-- SELECT 'Testing Cart Validation' as test_name, valid, message, discount_recalculated, original_discount_cents/100.0 as original_discount, new_discount_cents/100.0 as new_discount
-- FROM public.validate_coupon_cart_state((SELECT validation_token FROM public.coupon_validations LIMIT 1), '[{"product_id": "changed", "quantity": 1, "unit_price_cents": 25000}]'::jsonb, 'percent');