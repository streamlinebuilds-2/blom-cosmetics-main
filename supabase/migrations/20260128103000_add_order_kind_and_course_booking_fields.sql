ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS order_kind text;

UPDATE public.orders
SET order_kind = 'product'
WHERE order_kind IS NULL;

ALTER TABLE public.orders
ALTER COLUMN order_kind SET DEFAULT 'product';

ALTER TABLE public.orders
ALTER COLUMN order_kind SET NOT NULL;

ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_order_kind_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_order_kind_check CHECK (order_kind IN ('product', 'course'));

ALTER TABLE public.course_purchases
ADD COLUMN IF NOT EXISTS amount_owed_cents int;

ALTER TABLE public.course_purchases
ADD COLUMN IF NOT EXISTS balance_order_id text;

ALTER TABLE public.course_purchases
DROP CONSTRAINT IF EXISTS course_purchases_invitation_status_check;

ALTER TABLE public.course_purchases
ADD CONSTRAINT course_purchases_invitation_status_check
CHECK (invitation_status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text, 'redeemed'::text, 'expired'::text]));
