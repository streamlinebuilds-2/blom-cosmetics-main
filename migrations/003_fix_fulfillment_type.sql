-- Migration: Fix fulfillment_type field to match fulfillment_method
-- Created: 2025-11-12
-- Purpose: Ensure fulfillment_type is set for admin app compatibility

-- ============================================================================
-- STEP 1: Sync existing orders - copy fulfillment_method to fulfillment_type
-- ============================================================================

UPDATE orders
SET fulfillment_type = fulfillment_method
WHERE fulfillment_type IS NULL
  AND fulfillment_method IS NOT NULL;

-- ============================================================================
-- STEP 2: Update api_create_order RPC to set both fields
-- ============================================================================

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
    fulfillment_type,        -- NEW: Also set fulfillment_type
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
    'placed',
    'unpaid',
    p_channel,
    p_buyer_email,
    p_buyer_name,
    p_buyer_phone,
    p_fulfillment_method,
    p_fulfillment_method,    -- NEW: Set fulfillment_type = fulfillment_method
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

  -- Insert order items (allow NULL product_id when not a valid UUID)
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

-- Grant execute to service_role only (not anon)
GRANT EXECUTE ON FUNCTION public.api_create_order(text, text, text, text, text, text, jsonb, int, int, int, int, text, jsonb, text) TO service_role;

-- ============================================================================
-- STEP 3: Add trigger to keep fields in sync
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_fulfillment_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Keep fulfillment_type in sync with fulfillment_method
  IF NEW.fulfillment_method IS NOT NULL AND (NEW.fulfillment_type IS NULL OR OLD.fulfillment_method != NEW.fulfillment_method) THEN
    NEW.fulfillment_type = NEW.fulfillment_method;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_fulfillment_type ON orders;
CREATE TRIGGER trigger_sync_fulfillment_type
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION sync_fulfillment_type();

-- ============================================================================
-- Complete!
-- ============================================================================

COMMENT ON COLUMN orders.fulfillment_type IS 'Fulfillment type (delivery, collection) - kept in sync with fulfillment_method for admin app compatibility';
COMMENT ON COLUMN orders.fulfillment_method IS 'Fulfillment method (delivery, collection) - primary field used by system';
