ALTER TABLE public.course_purchases
ALTER COLUMN order_id SET NOT NULL;

ALTER TABLE public.course_purchases
DROP CONSTRAINT IF EXISTS course_purchases_order_id_course_slug_key;

ALTER TABLE public.course_purchases
ADD CONSTRAINT course_purchases_order_id_course_slug_key UNIQUE (order_id, course_slug);

ALTER TABLE public.course_purchases
DROP CONSTRAINT IF EXISTS course_purchases_order_id_fkey;

ALTER TABLE public.course_purchases
ADD CONSTRAINT course_purchases_order_id_fkey
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.course_purchases
DROP CONSTRAINT IF EXISTS course_purchases_balance_order_id_fkey;

ALTER TABLE public.course_purchases
ADD CONSTRAINT course_purchases_balance_order_id_fkey
FOREIGN KEY (balance_order_id) REFERENCES public.orders(id) ON DELETE SET NULL;
