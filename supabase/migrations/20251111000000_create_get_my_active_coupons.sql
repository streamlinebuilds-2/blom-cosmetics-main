-- Migration: Create RPC function to fetch active coupons for logged-in user
-- This function finds coupons where email_locked matches the user's email,
-- they haven't been used, are active, and haven't expired.

CREATE OR REPLACE FUNCTION get_my_active_coupons()
RETURNS SETOF coupons
LANGUAGE sql
SECURITY DEFINER -- Important: to read the coupons table
AS $$
  SELECT *
  FROM public.coupons
  WHERE
    email_locked = (auth.jwt() ->> 'email') AND
    used_count < max_uses AND
    active = true AND
    valid_until > now();
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_my_active_coupons() TO authenticated;
