-- Atomically claim a course-purchase notification before creating or sending
-- an Academy invite. PayFast can call the enrolment path more than once at the
-- same time, so a plain read-before-send check is not sufficient.
ALTER TABLE public.course_purchases
DROP CONSTRAINT IF EXISTS course_purchases_invitation_status_check;

ALTER TABLE public.course_purchases
ADD CONSTRAINT course_purchases_invitation_status_check
CHECK (
  invitation_status = ANY (
    ARRAY[
      'pending'::text,
      'processing'::text,
      'sent'::text,
      'failed'::text,
      'redeemed'::text,
      'expired'::text
    ]
  )
);

CREATE OR REPLACE FUNCTION public.claim_course_invitation_delivery(
  p_order_id text,
  p_course_slug text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_purchase public.course_purchases%ROWTYPE;
BEGIN
  SELECT *
  INTO v_purchase
  FROM public.course_purchases
  WHERE order_id = p_order_id
    AND course_slug = p_course_slug
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_purchase.invitation_status IN ('sent', 'redeemed') THEN
    RETURN false;
  END IF;

  IF v_purchase.invitation_status = 'processing'
    AND v_purchase.invited_at >= now() - interval '10 minutes' THEN
    RETURN false;
  END IF;

  UPDATE public.course_purchases
  SET invitation_status = 'processing',
      invited_at = now()
  WHERE id = v_purchase.id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_course_invitation_delivery(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_course_invitation_delivery(text, text) FROM anon;
REVOKE ALL ON FUNCTION public.claim_course_invitation_delivery(text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_course_invitation_delivery(text, text) TO service_role;

COMMENT ON FUNCTION public.claim_course_invitation_delivery(text, text)
IS 'Atomically claims one course invite delivery; permits retry after a 10-minute processing timeout.';
