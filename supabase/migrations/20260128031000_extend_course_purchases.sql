ALTER TABLE public.course_purchases
  ADD COLUMN IF NOT EXISTS course_title text;

ALTER TABLE public.course_purchases
  ADD COLUMN IF NOT EXISTS course_type text;

ALTER TABLE public.course_purchases
  ADD COLUMN IF NOT EXISTS selected_package text;

ALTER TABLE public.course_purchases
  ADD COLUMN IF NOT EXISTS selected_date text;

ALTER TABLE public.course_purchases
  ADD COLUMN IF NOT EXISTS amount_paid_cents integer;

ALTER TABLE public.course_purchases
  ADD COLUMN IF NOT EXISTS payment_kind text;

ALTER TABLE public.course_purchases
  ADD COLUMN IF NOT EXISTS details jsonb;

ALTER TABLE public.course_purchases
  DROP CONSTRAINT IF EXISTS course_purchases_payment_kind_check;

ALTER TABLE public.course_purchases
  ADD CONSTRAINT course_purchases_payment_kind_check
  CHECK (payment_kind IN ('full', 'deposit') OR payment_kind IS NULL);
