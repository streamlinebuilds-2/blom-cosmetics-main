-- The White Petal Paste product was renamed from "white" to "milky-white".
-- Keep the paid-course benefit grant and every existing course-offer coupon
-- linked to the current product record.
DO $$
DECLARE
  v_definition text;
BEGIN
  SELECT pg_get_functiondef('public.grant_trendy_ring_benefit(text,text)'::regprocedure)
  INTO v_definition;

  IF position('blom-cosmetics-petal-paste-white' IN v_definition) > 0 THEN
    EXECUTE replace(
      v_definition,
      'blom-cosmetics-petal-paste-white',
      'blom-cosmetics-petal-paste-milky-white'
    );
  END IF;
END;
$$;

UPDATE public.coupons AS coupon
SET included_product_ids = ARRAY[
  (SELECT id FROM public.products WHERE slug = 'blom-cosmetics-petal-paste-milky-white' LIMIT 1),
  (SELECT id FROM public.products WHERE slug = 'blom-cosmetics-petal-paste-clear' LIMIT 1)
]
FROM public.course_benefits AS benefit
WHERE coupon.id = benefit.coupon_id
  AND benefit.course_slug = 'trendy-ring-nail-art-course'
  AND EXISTS (
    SELECT 1 FROM public.products WHERE slug = 'blom-cosmetics-petal-paste-milky-white'
  )
  AND EXISTS (
    SELECT 1 FROM public.products WHERE slug = 'blom-cosmetics-petal-paste-clear'
  );
