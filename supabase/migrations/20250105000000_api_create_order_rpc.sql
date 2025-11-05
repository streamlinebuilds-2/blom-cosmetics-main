-- Create RPC for order creation (bypasses check constraints via SECURITY DEFINER)
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
  p_collection_location text
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
  r jsonb;
BEGIN
  v_total_cents := p_subtotal_cents + p_shipping_cents + p_tax_cents - p_discount_cents;
  
  -- Insert order with all required fields
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
    created_at
  ) VALUES (
    p_order_number,
    p_m_payment_id,
    'unpaid',  -- Start as unpaid
    'unpaid',  -- Payment status
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
    (r->>'product_id')::uuid,
    r->>'product_name',
    r->>'sku',
    (r->>'quantity')::int,
    (r->>'unit_price')::numeric,
    ((r->>'quantity')::int * (r->>'unit_price')::numeric)
  FROM jsonb_array_elements(p_items) r;
  
  RETURN QUERY SELECT v_order_id, p_order_number, p_m_payment_id, v_total_cents;
END;
$$;

-- Grant execute to service_role only (not anon)
GRANT EXECUTE ON FUNCTION public.api_create_order(text, text, text, text, text, text, jsonb, int, int, int, int, text, jsonb, text) TO service_role;

