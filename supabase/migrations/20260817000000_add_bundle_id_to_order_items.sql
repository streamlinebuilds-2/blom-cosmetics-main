-- Link bundle line items to the `bundles` table.
--
-- Bundles created via the admin bundle editor live ONLY in `bundles` and are never
-- mirrored into `products`. `order_items.product_id` has a FK to products(id), so a
-- bundle id written there fails with 23503 (order_items_product_id_fkey). Bundle line
-- items therefore persist with product_id = NULL, which leaves them unlinked to anything
-- by id and invisible to any report that joins order_items -> products.
--
-- This adds a parallel nullable bundle_id. After this migration every order_items row is
-- one of: a product (product_id set), a bundle (bundle_id set), or a course (both null).

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS bundle_id uuid REFERENCES public.bundles(id);

COMMENT ON COLUMN public.order_items.bundle_id IS
  'Bundle this line item was sold as, when the item came from the `bundles` table rather than `products`. Mutually exclusive with product_id.';

CREATE INDEX IF NOT EXISTS idx_order_items_bundle_id
  ON public.order_items (bundle_id)
  WHERE bundle_id IS NOT NULL;

-- Recreate api_create_order so it persists bundle_id.
--
-- The signature is UNCHANGED from 20260128103010_update_api_create_order_add_order_kind.sql
-- (16 args, incl. p_order_kind). p_items is jsonb, so carrying a new `bundle_id` key needs
-- no signature change -- deliberately no DROP FUNCTION here, so no new overload is created.
CREATE OR REPLACE FUNCTION public.api_create_order(
  p_order_number text,
  p_m_payment_id text,
  p_buyer_email text,
  p_buyer_name text,
  p_buyer_phone text,
  p_channel text,
  p_items jsonb,
  p_subtotal_cents int,
  p_shipping_cents int,
  p_discount_cents int,
  p_tax_cents int,
  p_fulfillment_method text,
  p_delivery_address jsonb,
  p_collection_location text,
  p_coupon_code text DEFAULT NULL,
  p_order_kind text DEFAULT 'product'
)
RETURNS TABLE (
  order_id uuid,
  order_number text,
  m_payment_id text,
  total_cents int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_total_cents int;
BEGIN
  v_total_cents := p_subtotal_cents + p_shipping_cents + p_tax_cents - p_discount_cents;

  INSERT INTO public.orders (
    order_number,
    m_payment_id,
    status,
    payment_status,
    channel,
    buyer_email,
    buyer_name,
    buyer_phone,
    fulfillment_method,
    delivery_address,
    collection_location,
    subtotal_cents,
    shipping_cents,
    discount_cents,
    tax_cents,
    total_cents,
    total,
    placed_at,
    created_at,
    order_kind
  ) VALUES (
    p_order_number,
    p_m_payment_id,
    'placed',
    'unpaid',
    p_channel,
    p_buyer_email,
    p_buyer_name,
    p_buyer_phone,
    p_fulfillment_method,
    p_delivery_address,
    p_collection_location,
    p_subtotal_cents,
    p_shipping_cents,
    p_discount_cents,
    p_tax_cents,
    v_total_cents,
    v_total_cents / 100.0,
    now(),
    now(),
    p_order_kind
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (
    order_id,
    product_id,
    bundle_id,
    product_name,
    sku,
    quantity,
    unit_price,
    line_total,
    variant_title
  )
  SELECT
    v_order_id,
    CASE
      WHEN item_data->>'product_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      THEN (item_data->>'product_id')::uuid
      ELSE NULL
    END,
    CASE
      WHEN item_data->>'bundle_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      THEN (item_data->>'bundle_id')::uuid
      ELSE NULL
    END,
    item_data->>'product_name',
    item_data->>'sku',
    (item_data->>'quantity')::int,
    (item_data->>'unit_price')::numeric,
    ((item_data->>'quantity')::int * (item_data->>'unit_price')::numeric),
    COALESCE(
      item_data->'variant'->>'title',
      item_data->>'variant'
    )
  FROM jsonb_array_elements(p_items) AS item_data;

  RETURN QUERY SELECT v_order_id, p_order_number, p_m_payment_id, v_total_cents;
END;
$$;

GRANT EXECUTE ON FUNCTION public.api_create_order(text, text, text, text, text, text, jsonb, int, int, int, int, text, jsonb, text, text, text) TO service_role;

-- PostgREST only exposes an embedded resource (order_items -> bundles) once it has
-- picked up the new foreign key. Without this reload, admin-analytics-advanced.ts fails
-- with "Could not find a relationship between order_items and bundles".
NOTIFY pgrst, 'reload schema';
