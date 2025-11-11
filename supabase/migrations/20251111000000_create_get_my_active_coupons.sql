-- Migration: Create RPC function to fetch active coupons for logged-in user
-- This function finds coupons where locked_email matches the user's email,
-- they haven't been used, are active, and haven't expired.

CREATE OR REPLACE FUNCTION get_my_active_coupons()
RETURNS SETOF coupons
LANGUAGE sql
SECURITY DEFINER -- Important: to read the coupons table
AS $$
  SELECT *
  FROM public.coupons
  WHERE
    locked_email = (auth.jwt() ->> 'email') AND
    used_count < max_uses AND
    COALESCE(status, 'inactive') = 'active' AND
    valid_until > now();
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_my_active_coupons() TO authenticated;
