-- Create function to generate welcome coupon for Beauty Club signup
-- This function creates a coupon specifically for Beauty Club members

CREATE OR REPLACE FUNCTION public.create_beauty_club_welcome_coupon(p_email text)
RETURNS TABLE (
  code text,
  type text,
  value integer,
  percent integer,
  min_order_cents integer,
  discount_amount_rands numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coupon_code text;
  v_exists boolean := true;
BEGIN
  -- Generate unique coupon code for Beauty Club members
  -- Format: BLOMC + MMMDD + random 4 chars
  WHILE v_exists LOOP
    v_coupon_code := 'BLOMC' || to_char(now(), 'MMDD') || '-' || 
                     upper(substr(encode(gen_random_bytes(2),'hex'),1,4));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM public.coupons WHERE code = v_coupon_code
    ) INTO v_exists;
  END LOOP;
  
  -- Create the Beauty Club welcome coupon
  INSERT INTO public.coupons (
    code,
    type,           -- 'fixed' discount type
    value,          -- R250 (fixed amount)
    percent,        -- Keep for compatibility
    locked_email,   -- Email-locked to Beauty Club member
    min_order_cents, -- R500 minimum order
    max_uses,       -- Single use only
    used_count,
    valid_from,
    valid_until,
    status,
    is_active,
    is_single_use,
    description     -- Add description for Beauty Club
  ) VALUES (
    v_coupon_code,
    'fixed',        -- Fixed discount type
    250,            -- R250 off
    25,             -- Also set percent for compatibility (25% of R1000)
    lower(p_email), -- Lock to member's email
    50000,          -- R500 minimum order
    1,              -- Single use only
    0,              -- Not used yet
    now(),          -- Valid from now
    now() + interval '60 days', -- Valid for 60 days for Beauty Club members
    'active',       -- Active status
    true,           -- Active flag
    true,           -- Single-use flag
    'Beauty Club Welcome Discount - Get 10% off your first order!' -- Description
  );
  
  -- Log the coupon creation
  INSERT INTO public.coupon_activity_log (
    coupon_code,
    user_email,
    action,
    created_at,
    metadata
  ) VALUES (
    v_coupon_code,
    lower(p_email),
    'created_beauty_club_welcome',
    now(),
    json_build_object('email', lower(p_email), 'source', 'beauty_club_signup')
  ) ON CONFLICT DO NOTHING;
  
  -- Return the created coupon details
  RETURN QUERY
  SELECT 
    c.code,
    c.type,
    c.value,
    c.percent,
    c.min_order_cents,
    c.value::numeric as discount_amount_rands
  FROM public.coupons c
  WHERE c.code = v_coupon_code;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_beauty_club_welcome_coupon(text) TO service_role;

-- Add comment
COMMENT ON FUNCTION public.create_beauty_club_welcome_coupon IS 'Creates a welcome coupon for Beauty Club signup members';