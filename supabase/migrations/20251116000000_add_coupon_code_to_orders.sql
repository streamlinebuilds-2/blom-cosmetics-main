-- Add coupon_code column to orders table and update api_create_order RPC
-- This allows tracking which coupon was used for each order

-- 1. Add coupon_code column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS coupon_code text;

-- 2. Create index for faster coupon lookups
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON public.orders(coupon_code);

-- 3. Update the api_create_order RPC to accept coupon_code parameter
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
  p_coupon_code text DEFAULT NULL  -- New parameter for coupon code
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

  -- Insert order with all required fields including coupon_code
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
    coupon_code,  -- New field
    placed_at,
    created_at
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
    p_coupon_code,  -- Save coupon code
    now(),
    now()
  )
  RETURNING id INTO v_order_id;

  -- Insert order items
  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    sku,
    quantity,
    unit_price,
    line_total
  )
  SELECT
    v_order_id,
    CASE
      WHEN item_data->>'product_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      THEN (item_data->>'product_id')::uuid
      ELSE NULL
    END,
    item_data->>'product_name',
    item_data->>'sku',
    (item_data->>'quantity')::int,
    (item_data->>'unit_price')::numeric,
    ((item_data->>'quantity')::int * (item_data->>'unit_price')::numeric)
  FROM jsonb_array_elements(p_items) AS item_data;

  RETURN QUERY SELECT v_order_id, p_order_number, p_m_payment_id, v_total_cents;
END;
$$;

-- 4. Grant execute permissions (maintain existing permissions)
GRANT EXECUTE ON FUNCTION public.api_create_order(text, text, text, text, text, text, jsonb, int, int, int, int, text, jsonb, text, text) TO service_role;

-- 5. Comment for documentation
COMMENT ON COLUMN public.orders.coupon_code IS 'The coupon code used for this order (if any)';
