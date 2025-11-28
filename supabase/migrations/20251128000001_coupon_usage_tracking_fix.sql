-- ================================================
-- COUPON USAGE TRACKING FIX
-- ================================================
-- This migration fixes the issue where single-use coupons
-- can be reused multiple times during checkout validation

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
    
    -- Ensure one validation per token
    UNIQUE(validation_token)
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_coupon_validations_cleanup ON public.coupon_validations(cleanup_at);
CREATE INDEX IF NOT EXISTS idx_coupon_validations_coupon ON public.coupon_validations(coupon_id);

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
    );
    
    -- Delete expired validations
    DELETE FROM public.coupon_validations 
    WHERE cleanup_at <= now() AND used_for_order = false;
END;
$$;

-- 3. Enhanced redeem_coupon function with proper usage tracking
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
  validation_token text
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
BEGIN
  -- Clean up expired validations first
  PERFORM public.cleanup_expired_coupon_validations();

  -- Look up coupon by code
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE upper(code) = upper(p_code)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Coupon not found.', 0, 'none', 0, 0, null, p_validation_token;
    RETURN;
  END IF;

  -- Check if coupon is active
  IF COALESCE(v_coupon.status, 'inactive') <> 'active' THEN
    RETURN QUERY SELECT false, 'Coupon is not active.', 0, 'none', 0, 0, null, p_validation_token;
    RETURN;
  END IF;

  -- Check expiry
  IF v_coupon.valid_until IS NOT NULL AND now() > v_coupon.valid_until THEN
    RETURN QUERY SELECT false, 'Coupon has expired.', 0, 'none', 0, 0, null, p_validation_token;
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
      RETURN QUERY SELECT false, 'Coupon already used.', 0, 'none', 0, 0, null, p_validation_token;
      RETURN;
    END IF;
  END;

  -- Check email lock
  IF v_coupon.locked_email IS NOT NULL AND lower(v_coupon.locked_email) <> lower(p_email) THEN
    RETURN QUERY SELECT false, 'Coupon locked to another email.', 0, 'none', 0, 0, null, p_validation_token;
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
      0, 'none', 0, v_min_order, v_coupon.id, p_validation_token;
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
    RETURN QUERY SELECT false, 'Invalid discount type.', 0, 'none', 0, v_min_order, null, p_validation_token;
    RETURN;
  END IF;

  -- For single-use coupons, mark as used immediately during validation
  IF v_is_single_use THEN
    UPDATE public.coupons
    SET used_count = COALESCE(used_count, 0) + 1
    WHERE id = v_coupon.id;
  END IF;

  -- Record the validation attempt
  INSERT INTO public.coupon_validations (
    coupon_id,
    validation_token,
    email,
    order_total_cents,
    validated_at
  ) VALUES (
    v_coupon.id,
    p_validation_token,
    p_email,
    p_order_total_cents,
    now()
  );

  -- Return success with coupon details
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
    p_validation_token;
END;
$$;

-- 4. Create function to mark validation as completed when order is created
CREATE OR REPLACE FUNCTION public.mark_coupon_validation_completed(
  p_validation_token text,
  p_order_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.coupon_validations
  SET used_for_order = true,
      order_id = p_order_id,
      cleanup_at = now() -- Clean up immediately since order is complete
  WHERE validation_token = p_validation_token;
END;
$$;

-- 5. Updated function to mark coupon as used (now mainly for multi-use coupons)
CREATE OR REPLACE FUNCTION public.mark_coupon_used(p_code text)
RETURNS void
LANGUAGE plpgsql
AS $$
  UPDATE public.coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE upper(code) = upper(p_code);
$$;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.cleanup_expired_coupon_validations() TO service_role;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(text, text, integer, jsonb, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_coupon_validation_completed(text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_coupon_used(text) TO anon, authenticated, service_role;

-- 7. Create cleanup job (runs every 5 minutes)
SELECT cron.schedule(
  'cleanup-expired-coupon-validations',
  '*/5 * * * *',
  'SELECT public.cleanup_expired_coupon_validations();'
);

-- 8. Update existing TEST-DISCOUNT to be single-use if it exists
UPDATE public.coupons 
SET max_uses = 1 
WHERE code = 'TEST-DISCOUNT';

-- Add comments
COMMENT ON FUNCTION public.redeem_coupon IS 'Enhanced coupon validation with proper usage tracking. Single-use coupons are marked as used immediately during validation.';
COMMENT ON FUNCTION public.mark_coupon_validation_completed IS 'Marks a coupon validation as completed when the order is successfully created.';
COMMENT ON TABLE public.coupon_validations IS 'Tracks coupon validation attempts to prevent re-use during checkout. Automatically cleans up after 30 minutes if order is not completed.';