-- Restore 'placed' to orders_status_check constraint.
-- The api_create_order RPC inserts orders with status='placed' but this value
-- was missing from the constraint, causing all checkouts to fail with a 23514 error.
ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
  status = ANY (ARRAY[
    'placed'::text,
    'pending'::text,
    'paid'::text,
    'processing'::text,
    'packed'::text,
    'out_for_delivery'::text,
    'delivered'::text,
    'ready_for_collection'::text,
    'collected'::text,
    'cancelled'::text
  ])
);
