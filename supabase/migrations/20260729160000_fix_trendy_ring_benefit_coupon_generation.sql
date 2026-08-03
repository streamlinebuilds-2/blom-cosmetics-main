-- pgcrypto is installed in the extensions schema in production. Fixed-value
-- coupons also require percent to be NULL (the legacy constraint only permits
-- percentage values from 1 to 99).
CREATE OR REPLACE FUNCTION public.grant_trendy_ring_benefit(
  p_order_id text,
  p_buyer_email text
)
RETURNS SETOF public.course_benefits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_email text := lower(trim(p_buyer_email));
  v_purchase public.course_purchases%rowtype;
  v_existing public.course_benefits%rowtype;
  v_coupon_id uuid;
  v_coupon_code text;
  v_white_id uuid;
  v_clear_id uuid;
BEGIN
  IF v_email = '' THEN
    RAISE EXCEPTION 'Buyer email is required';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_email || '|trendy-ring-nail-art-course', 0));

  SELECT cp.* INTO v_purchase
  FROM public.course_purchases cp
  JOIN public.orders o ON o.id = cp.order_id
  WHERE cp.order_id = p_order_id
    AND cp.course_slug = 'trendy-ring-nail-art-course'
    AND lower(cp.buyer_email) = v_email
    AND (
      lower(coalesce(o.status, '')) = 'paid'
      OR lower(coalesce(o.payment_status, '')) IN ('paid', 'complete')
      OR o.paid_at IS NOT NULL
    )
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'A confirmed paid Trendy Ring course purchase was not found';
  END IF;

  SELECT * INTO v_existing
  FROM public.course_benefits
  WHERE lower(buyer_email) = v_email
    AND course_slug = 'trendy-ring-nail-art-course'
  LIMIT 1;

  IF FOUND THEN
    RETURN NEXT v_existing;
    RETURN;
  END IF;

  SELECT id INTO v_white_id
  FROM public.products
  WHERE slug = 'blom-cosmetics-petal-paste-white'
    AND coalesce(is_active, true)
  LIMIT 1;

  SELECT id INTO v_clear_id
  FROM public.products
  WHERE slug = 'blom-cosmetics-petal-paste-clear'
    AND coalesce(is_active, true)
  LIMIT 1;

  IF v_white_id IS NULL OR v_clear_id IS NULL THEN
    RAISE EXCEPTION 'Both Petal Paste products must be active before granting this benefit';
  END IF;

  v_coupon_code := 'RING-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 12));

  INSERT INTO public.coupons (
    code,
    type,
    value,
    percent,
    locked_email,
    min_order_cents,
    max_uses,
    used_count,
    valid_from,
    valid_until,
    status,
    is_active,
    is_single_use,
    included_product_ids,
    notes
  )
  VALUES (
    v_coupon_code,
    'fixed',
    41,
    NULL,
    v_email,
    44000,
    1,
    0,
    now(),
    NULL,
    'active',
    true,
    true,
    ARRAY[v_white_id, v_clear_id],
    'Trendy Ring course benefit: one White + one Clear Petal Paste for R399. No expiry.'
  )
  RETURNING id INTO v_coupon_id;

  INSERT INTO public.course_benefits (
    course_purchase_id,
    order_id,
    course_slug,
    buyer_email,
    coupon_id,
    coupon_code
  )
  VALUES (
    v_purchase.id,
    p_order_id,
    'trendy-ring-nail-art-course',
    v_email,
    v_coupon_id,
    v_coupon_code
  )
  RETURNING * INTO v_existing;

  RETURN NEXT v_existing;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_trendy_ring_benefit(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_trendy_ring_benefit(text, text) TO service_role;
