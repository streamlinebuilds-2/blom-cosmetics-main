-- Fix redeem_coupon to work with product subtotal (excluding shipping)
-- Returns clear error when order < R500
-- Enforces single-use, email locking, expiry, and minimum order

-- Ensure orders table has coupon_code column (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'coupon_code'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN coupon_code text;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.redeem_coupon(
  p_code text,
  p_email text,
  p_product_subtotal_cents integer
)
RETURNS TABLE (
  valid boolean,
  message text,
  discount_cents integer,
  percent integer,
  min_order_cents integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  c record;
BEGIN
  -- Look up coupon by code
  SELECT
    id, code, percent, used_count, max_uses,
    valid_from, valid_until, min_order_cents,
    is_active, is_single_use, locked_email
  INTO c
  FROM public.coupons
  WHERE code = p_code;

  IF c.id IS NULL THEN
    RETURN QUERY SELECT false, 'Coupon not found.', 0, NULL, NULL;
    RETURN;
  END IF;

  IF COALESCE(c.is_active, true) = false THEN
    RETURN QUERY SELECT false, 'Coupon is not active.', 0, c.percent, c.min_order_cents;
    RETURN;
  END IF;

  IF c.valid_from IS NOT NULL AND now() < c.valid_from THEN
    RETURN QUERY SELECT false, 'Coupon not yet valid.', 0, c.percent, c.min_order_cents;
    RETURN;
  END IF;

  IF c.valid_until IS NOT NULL AND now() > c.valid_until THEN
    RETURN QUERY SELECT false, 'Coupon has expired.', 0, c.percent, c.min_order_cents;
    RETURN;
  END IF;

  -- single-use / usage limit
  IF c.max_uses IS NOT NULL AND c.used_count >= c.max_uses THEN
    RETURN QUERY SELECT false, 'Coupon has already been used.', 0, c.percent, c.min_order_cents;
    RETURN;
  END IF;

  -- optional email lock
  IF c.locked_email IS NOT NULL AND lower(c.locked_email) <> lower(p_email) THEN
    RETURN QUERY SELECT false, 'This code is locked to a different email.', 0, c.percent, c.min_order_cents;
    RETURN;
  END IF;

  -- minimum order (product subtotal only, excluding shipping)
  IF p_product_subtotal_cents < COALESCE(c.min_order_cents, 50000) THEN
    RETURN QUERY SELECT false, 'Order must be over R500 (product total, excl. shipping).', 0, c.percent, c.min_order_cents;
    RETURN;
  END IF;

  -- OK – compute discount
  -- percent is 1..90 (assumed enforced by table constraint)
  RETURN QUERY SELECT
    true,
    'Coupon applied.',
    FLOOR((p_product_subtotal_cents * c.percent) / 100.0)::int,
    c.percent,
    COALESCE(c.min_order_cents, 50000);
END;
$$;

-- Ensure mark_coupon_used function exists
CREATE OR REPLACE FUNCTION public.mark_coupon_used(p_code text)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = p_code;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.redeem_coupon(text, text, integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_coupon_used(text) TO anon, authenticated, service_role;

