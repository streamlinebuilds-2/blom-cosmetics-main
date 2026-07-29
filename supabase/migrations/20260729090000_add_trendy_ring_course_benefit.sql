-- Trendy Ring Nail Art Course and its one-per-customer Petal Paste benefit.
-- This migration is intentionally idempotent and does not publish the course.

INSERT INTO public.courses (
  title,
  slug,
  description,
  price,
  image_url,
  duration,
  level,
  template_key,
  course_type,
  is_active
)
VALUES (
  'Trendy Ring Nail Art Course',
  'trendy-ring-nail-art-course',
  'Master modern ring nail trends, placement, balance and client-ready design techniques in four self-paced video lessons.',
  650,
  'https://res.cloudinary.com/dnlgohkcc/image/upload/v1785314350/Trendy-Ring-Cover_mdc3dy.jpg',
  'Self-Paced',
  'Beginner to Pro',
  'online',
  'online',
  false
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  duration = EXCLUDED.duration,
  level = EXCLUDED.level,
  template_key = EXCLUDED.template_key,
  course_type = EXCLUDED.course_type;

CREATE TABLE IF NOT EXISTS public.course_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_purchase_id uuid NOT NULL REFERENCES public.course_purchases(id) ON DELETE CASCADE,
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  buyer_email text NOT NULL,
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE RESTRICT,
  coupon_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'eligible'
    CHECK (status IN ('eligible', 'claimed', 'redeemed', 'revoked')),
  claimed_user_id uuid,
  claimed_at timestamptz,
  redeemed_order_id text REFERENCES public.orders(id) ON DELETE SET NULL,
  redeemed_at timestamptz,
  revoked_at timestamptz,
  revoke_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS course_benefits_one_per_email_course
  ON public.course_benefits (lower(buyer_email), course_slug);

CREATE INDEX IF NOT EXISTS course_benefits_course_purchase_id_idx
  ON public.course_benefits (course_purchase_id);

CREATE INDEX IF NOT EXISTS course_benefits_coupon_code_idx
  ON public.course_benefits (upper(coupon_code));

ALTER TABLE public.course_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.course_benefits IS
  'Server-managed post-purchase benefits for paid course students. No anon/authenticated table access; customer access is through authenticated server functions.';

CREATE OR REPLACE FUNCTION public.grant_trendy_ring_benefit(
  p_order_id text,
  p_buyer_email text
)
RETURNS SETOF public.course_benefits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    0,
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

CREATE OR REPLACE FUNCTION public.sync_course_benefit_from_coupon()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redeemed_order_id text;
BEGIN
  IF coalesce(NEW.used_count, 0) > coalesce(OLD.used_count, 0) THEN
    SELECT o.id INTO v_redeemed_order_id
    FROM public.orders o
    WHERE upper(o.coupon_code) = upper(NEW.code)
    ORDER BY o.paid_at DESC NULLS LAST, o.created_at DESC
    LIMIT 1;

    UPDATE public.course_benefits
    SET
      status = 'redeemed',
      redeemed_order_id = coalesce(NEW.order_id, v_redeemed_order_id),
      redeemed_at = coalesce(NEW.redeemed_at, now()),
      updated_at = now()
    WHERE coupon_id = NEW.id
      AND status IN ('eligible', 'claimed');
  ELSIF NEW.is_active = false AND OLD.is_active IS DISTINCT FROM false THEN
    UPDATE public.course_benefits
    SET
      status = 'revoked',
      revoked_at = now(),
      revoke_reason = coalesce(revoke_reason, 'Coupon deactivated'),
      updated_at = now()
    WHERE coupon_id = NEW.id
      AND status IN ('eligible', 'claimed');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_course_benefit_from_coupon_trigger ON public.coupons;
CREATE TRIGGER sync_course_benefit_from_coupon_trigger
AFTER UPDATE OF used_count, is_active ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.sync_course_benefit_from_coupon();

CREATE OR REPLACE FUNCTION public.revoke_unused_course_benefit_on_refund()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(coalesce(NEW.status, '')) IN ('refunded', 'chargeback', 'charged_back')
     OR lower(coalesce(NEW.payment_status, '')) IN ('refunded', 'chargeback', 'charged_back') THEN
    UPDATE public.coupons c
    SET is_active = false
    FROM public.course_benefits cb
    WHERE cb.order_id = NEW.id
      AND cb.coupon_id = c.id
      AND cb.status IN ('eligible', 'claimed');

    UPDATE public.course_benefits
    SET
      status = 'revoked',
      revoked_at = now(),
      revoke_reason = 'Course order refunded or charged back',
      updated_at = now()
    WHERE order_id = NEW.id
      AND status IN ('eligible', 'claimed');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS revoke_unused_course_benefit_on_refund_trigger ON public.orders;
CREATE TRIGGER revoke_unused_course_benefit_on_refund_trigger
AFTER UPDATE OF status, payment_status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.revoke_unused_course_benefit_on_refund();

-- Existing account UI omitted coupons without an expiry. Keep email matching
-- case-insensitive and allow permanent, unused benefits to appear.
CREATE OR REPLACE FUNCTION public.get_my_active_coupons()
RETURNS SETOF public.coupons
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.*
  FROM public.coupons c
  WHERE lower(c.locked_email) = lower(auth.jwt() ->> 'email')
    AND coalesce(c.used_count, 0) < coalesce(c.max_uses, 1)
    AND coalesce(c.status, 'inactive') = 'active'
    AND coalesce(c.is_active, true)
    AND (c.valid_until IS NULL OR c.valid_until > now());
$$;

REVOKE ALL ON FUNCTION public.get_my_active_coupons() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_active_coupons() TO authenticated;
