-- Fix signup coupons to automatically create welcome coupons for new users
-- This ensures every new signup gets a welcome discount coupon

-- First, let's create a function to generate unique coupon codes
CREATE OR REPLACE FUNCTION public.generate_welcome_coupon_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_code text;
  v_exists boolean := true;
BEGIN
  -- Generate a unique code: BLOM + MMMDD + random 4 chars
  WHILE v_exists LOOP
    v_code := 'BLOM' || to_char(now(), 'MMDD') || '-' || 
              upper(substr(encode(gen_random_bytes(2),'hex'),1,4));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM public.coupons WHERE code = v_code
    ) INTO v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- Update handle_new_user_signup to create welcome coupons
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_coupon_code text;
  v_welcome_coupon_id uuid;
BEGIN
  -- 1. Create contact record (existing functionality)
  INSERT INTO public.contacts (
    user_id, 
    email, 
    full_name, 
    phone,
    name, -- Required NOT NULL field
    message, -- Required NOT NULL field  
    status, -- Required NOT NULL field
    source, -- Required NOT NULL field
    subscribed -- Required NOT NULL field
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), 
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'), -- name
    'User signup', -- message
    'active', -- status  
    'website', -- source
    true -- subscribed
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    last_login_at = now();

  -- 2. Create welcome coupon for the new user
  -- Generate unique coupon code
  SELECT public.generate_welcome_coupon_code() INTO v_coupon_code;
  
  -- Create the welcome coupon (R250 fixed discount)
  INSERT INTO public.coupons (
    code,
    type,           -- 'fixed' discount type
    value,          -- R250 (fixed amount)
    percent,        -- Keep for compatibility
    locked_email,   -- Email-locked to new user
    min_order_cents, -- R500 minimum order
    max_uses,       -- Single use only
    used_count,
    valid_from,
    valid_until,
    status,
    is_active,
    is_single_use
  ) VALUES (
    v_coupon_code,
    'fixed',        -- Fixed discount type
    250,            -- R250 off
    25,             -- Also set percent for compatibility (25% of R1000)
    lower(NEW.email), -- Lock to user's email
    50000,          -- R500 minimum order
    1,              -- Single use only
    0,              -- Not used yet
    now(),          -- Valid from now
    now() + interval '30 days', -- Valid for 30 days
    'active',       -- Active status
    true,           -- Active flag
    true            -- Single-use flag
  );
  
  -- Log the coupon creation (optional - could be used for email sending)
  INSERT INTO public.coupon_activity_log (
    coupon_code,
    user_email,
    action,
    created_at,
    metadata
  ) VALUES (
    v_coupon_code,
    lower(NEW.email),
    'created_welcome',
    now(),
    json_build_object('user_id', NEW.id, 'signup_email', lower(NEW.email))
  ) ON CONFLICT DO NOTHING;
  
  -- You could add email sending logic here using n8n webhook
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a table to track coupon activity (optional)
CREATE TABLE IF NOT EXISTS public.coupon_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code text NOT NULL,
  user_email text,
  action text NOT NULL, -- 'created_welcome', 'redeemed', 'expired'
  created_at timestamptz DEFAULT now(),
  metadata jsonb,
  CONSTRAINT unique_log_action UNIQUE (coupon_code, action, created_at)
);

-- Enable RLS
ALTER TABLE public.coupon_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policy for activity log
CREATE POLICY "Activity log readable by authenticated users"
  ON public.coupon_activity_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service can insert activity log"
  ON public.coupon_activity_log FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create function to get user's welcome coupon
CREATE OR REPLACE FUNCTION public.get_user_welcome_coupon(p_user_email text)
RETURNS TABLE (
  code text,
  type text,
  value integer,
  percent integer,
  min_order_cents integer,
  valid_until timestamptz,
  discount_amount_rands numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.code,
    c.type,
    c.value,
    c.percent,
    c.min_order_cents,
    c.valid_until,
    CASE 
      WHEN c.type = 'fixed' THEN c.value::numeric
      WHEN c.type = 'percent' THEN (c.percent / 100.0 * 1000)::numeric -- Estimate based on R1000 order
      ELSE 0
    END as discount_amount_rands
  FROM public.coupons c
  WHERE c.locked_email = lower(p_user_email)
    AND c.is_active = true
    AND c.status = 'active'
    AND (c.max_uses IS NULL OR c.used_count < c.max_uses)
    AND (c.valid_until IS NULL OR c.valid_until > now())
    AND c.is_single_use = true
  LIMIT 1;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.generate_welcome_coupon_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user_signup() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_welcome_coupon(text) TO authenticated, service_role;

-- Create a view to easily see welcome coupons
CREATE OR REPLACE VIEW public.welcome_coupons AS
SELECT 
  c.code,
  c.locked_email as user_email,
  c.type,
  c.value,
  c.percent,
  c.min_order_cents / 100.0 as min_order_rands,
  c.used_count,
  c.max_uses,
  c.valid_from,
  c.valid_until,
  c.status,
  CASE 
    WHEN c.valid_until < now() THEN 'expired'
    WHEN c.used_count >= c.max_uses THEN 'used'
    WHEN c.status <> 'active' THEN 'inactive'
    ELSE 'active'
  END as current_status
FROM public.coupons c
WHERE c.is_single_use = true
  AND c.locked_email IS NOT NULL
ORDER BY c.created_at DESC;

-- Grant view permissions
GRANT SELECT ON public.welcome_coupons TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.handle_new_user_signup() IS 'Creates contact and welcome coupon for new users';
COMMENT ON FUNCTION public.generate_welcome_coupon_code() IS 'Generates unique welcome coupon codes';
COMMENT ON FUNCTION public.get_user_welcome_coupon(text) IS 'Retrieves a users welcome coupon';
COMMENT ON VIEW public.welcome_coupons IS 'Shows all welcome coupons created for new users';fir the products when you scroll throught them make sure the images are linked to