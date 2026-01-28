ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_fulfillment_method_valid;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_fulfillment_method_valid
  CHECK (fulfillment_method IN ('delivery', 'collection', 'pickup', 'digital') OR fulfillment_method IS NULL);
