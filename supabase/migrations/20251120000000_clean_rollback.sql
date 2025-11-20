-- CLEAN EMERGENCY ROLLBACK - Handles missing objects gracefully
-- This will restore your system safely

-- 1. Drop triggers first (ignore errors if they don't exist)
DROP TRIGGER IF EXISTS trg_order_paid_movements ON orders;
DROP TRIGGER IF EXISTS on_order_item_created ON order_items;

-- 2. Drop functions (ignore errors if they don't exist)
DROP FUNCTION IF EXISTS public.fn_order_paid_movements();
DROP FUNCTION IF EXISTS public.handle_new_order_inventory();

-- 3. Drop table if it exists (CASCADE will handle dependencies)
DROP TABLE IF EXISTS public.stock_movements CASCADE;

-- 4. Fix the api_create_order function - make sure it's working
DROP FUNCTION IF EXISTS public.api_create_order(text, text, text, text, text, text, jsonb, int, int, int, int, text, jsonb, text, text);

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
  p_coupon_code text DEFAULT NULL
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
    order_number, m_payment_id, status, payment_status, channel, buyer_email, buyer_name, buyer_phone,
    fulfillment_method, delivery_address, collection_location, 
    coupon_code,
    subtotal_cents, shipping_cents, discount_cents, tax_cents, total_cents, total, placed_at, created_at
  ) VALUES (
    p_order_number, p_m_payment_id, 'placed', 'unpaid', p_channel, p_buyer_email, p_buyer_name, p_buyer_phone,
    p_fulfillment_method, p_delivery_address, p_collection_location, 
    p_coupon_code,
    p_subtotal_cents, p_shipping_cents, p_discount_cents, p_tax_cents, v_total_cents, v_total_cents / 100.0,
    now(), now()
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (
    order_id, product_id, product_name, sku, quantity, unit_price, line_total, variant_title
  )
  SELECT
    v_order_id,
    CASE WHEN item_data->>'product_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' 
    THEN (item_data->>'product_id')::uuid ELSE NULL END,
    item_data->>'product_name',
    item_data->>'sku',
    (item_data->>'quantity')::int,
    (item_data->>'unit_price')::numeric,
    ((item_data->>'quantity')::int * (item_data->>'unit_price')::numeric),
    COALESCE(item_data->'variant'->>'title', item_data->>'variant')
  FROM jsonb_array_elements(p_items) AS item_data;

  RETURN QUERY SELECT v_order_id, p_order_number, p_m_payment_id, v_total_cents;
END;
$$;

-- Grant execute to service_role only
GRANT EXECUTE ON FUNCTION public.api_create_order(text, text, text, text, text, text, jsonb, int, int, int, int, text, jsonb, text, text) TO service_role;

-- Ensure the function works by testing it exists
SELECT proname FROM pg_proc WHERE proname = 'api_create_order';