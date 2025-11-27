-- COMPLETE FIX: Stock Deduction When Orders Are Paid
-- This migration properly implements stock deduction on payment confirmation

-- First, ensure we have the stock_movements table with proper structure
DROP TABLE IF EXISTS public.stock_movements CASCADE;
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  order_id text REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE CASCADE,
  delta integer NOT NULL, -- Positive for stock increase, negative for decrease
  reason text NOT NULL, -- 'sale', 'restock', 'adjustment', etc.
  reference text, -- External reference (order number, etc.)
  metadata jsonb, -- Additional data
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_variant_id ON public.stock_movements(variant_id);
CREATE INDEX idx_stock_movements_order_id ON public.stock_movements(order_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at);
CREATE INDEX idx_stock_movements_reason ON public.stock_movements(reason);

-- Enable RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Stock movements viewable by authenticated users"
  ON public.stock_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stock movements manageable by authenticated users"
  ON public.stock_movements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update product stock when stock movements are added
CREATE OR REPLACE FUNCTION public.update_product_stock_from_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Update product inventory_quantity
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products 
    SET 
      inventory_quantity = COALESCE(inventory_quantity, 0) + NEW.delta,
      updated_at = now()
    WHERE id = NEW.product_id;
  END IF;
  
  -- Update variant inventory if variant_id is provided
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE public.product_variants
    SET 
      inventory_quantity = COALESCE(inventory_quantity, 0) + NEW.delta,
      updated_at = now()
    WHERE id = NEW.variant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update stock when movements are added
DROP TRIGGER IF EXISTS trg_update_stock_from_movement ON public.stock_movements;
CREATE TRIGGER trg_update_stock_from_movement
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_stock_from_movement();

-- Function to create stock movements when order is marked as paid
CREATE OR REPLACE FUNCTION public.create_stock_movements_for_paid_order()
RETURNS TRIGGER AS $$
DECLARE
  order_item RECORD;
  product_record public.products%ROWTYPE;
  variant_record public.product_variants%ROWTYPE;
BEGIN
  -- Only process if order status changed to 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    
    -- Process each order item
    FOR order_item IN 
      SELECT oi.*, p.product_type, p.sku as product_sku
      FROM public.order_items oi
      LEFT JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = NEW.id
    LOOP
      -- Skip courses and digital products
      IF order_item.product_type = 'course' THEN
        CONTINUE;
      END IF;
      
      -- Get product and variant information
      SELECT * INTO product_record FROM public.products WHERE id = order_item.product_id;
      
      -- Find variant if variant_title is specified
      IF order_item.variant_title IS NOT NULL THEN
        SELECT * INTO variant_record 
        FROM public.product_variants 
        WHERE product_id = order_item.product_id 
          AND title = order_item.variant_title
          AND is_active = true
        LIMIT 1;
      END IF;
      
      -- Create stock movement record
      INSERT INTO public.stock_movements (
        product_id,
        variant_id,
        order_id,
        order_item_id,
        delta,
        reason,
        reference,
        metadata
      ) VALUES (
        order_item.product_id,
        variant_record.id,
        NEW.id,
        order_item.id,
        -order_item.quantity, -- Negative to decrease stock
        'sale',
        NEW.order_number,
        jsonb_build_object(
          'product_name', order_item.product_name,
          'variant_title', order_item.variant_title,
          'unit_price', order_item.unit_price,
          'payment_status', NEW.payment_status,
          'buyer_email', NEW.buyer_email
        )
      );
      
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS trg_create_stock_movements_on_paid_order ON public.orders;
CREATE TRIGGER trg_create_stock_movements_on_paid_order
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.create_stock_movements_for_paid_order();

-- Function to validate stock availability before creating orders
CREATE OR REPLACE FUNCTION public.validate_stock_availability()
RETURNS TRIGGER AS $$
DECLARE
  product_record public.products%ROWTYPE;
  variant_record public.product_variants%ROWTYPE;
BEGIN
  -- Check product stock if product_id is provided
  IF NEW.product_id IS NOT NULL THEN
    SELECT * INTO product_record FROM public.products WHERE id = NEW.product_id;
    
    IF product_record.track_inventory = true THEN
      -- For products without specific variants
      IF NEW.variant_title IS NULL AND product_record.inventory_quantity < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product %: available %, requested %', 
          product_record.name, product_record.inventory_quantity, NEW.quantity;
      END IF;
    END IF;
  END IF;
  
  -- Check variant stock if variant is specified
  IF NEW.variant_title IS NOT NULL AND NEW.product_id IS NOT NULL THEN
    SELECT * INTO variant_record 
    FROM public.product_variants 
    WHERE product_id = NEW.product_id 
      AND title = NEW.variant_title
      AND is_active = true;
    
    IF variant_record.track_inventory = true THEN
      IF variant_record.inventory_quantity < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for variant %: available %, requested %', 
          variant_record.title, variant_record.inventory_quantity, NEW.quantity;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate stock before order creation
DROP TRIGGER IF EXISTS trg_validate_stock_availability ON public.order_items;
CREATE TRIGGER trg_validate_stock_availability
  BEFORE INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_stock_availability();

-- Function to get stock movement summary for analytics
CREATE OR REPLACE FUNCTION public.get_stock_movement_summary(
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_product_id uuid DEFAULT NULL
)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  total_sold bigint,
  total_received bigint,
  net_movement bigint,
  current_stock integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    COALESCE(SUM(CASE WHEN sm.delta < 0 THEN -sm.delta ELSE 0 END), 0) as total_sold,
    COALESCE(SUM(CASE WHEN sm.delta > 0 THEN sm.delta ELSE 0 END), 0) as total_received,
    COALESCE(SUM(sm.delta), 0) as net_movement,
    p.inventory_quantity as current_stock
  FROM public.products p
  LEFT JOIN public.stock_movements sm ON sm.product_id = p.id
    AND (p_start_date IS NULL OR sm.created_at >= p_start_date)
    AND (p_end_date IS NULL OR sm.created_at <= p_end_date)
    AND (p_product_id IS NULL OR sm.product_id = p_product_id)
  GROUP BY p.id, p.name, p.inventory_quantity
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_stock_movement_summary TO authenticated;

-- Create view for easy stock analytics
CREATE OR REPLACE VIEW public.stock_analytics AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.inventory_quantity,
  p.track_inventory,
  COUNT(DISTINCT sm.order_id) as total_orders,
  COALESCE(SUM(CASE WHEN sm.reason = 'sale' THEN -sm.delta ELSE 0 END), 0) as total_sold_units,
  COALESCE(SUM(CASE WHEN sm.reason = 'sale' THEN (-sm.delta * sm.metadata->>'unit_price')::numeric ELSE 0 END), 0) as total_sales_value,
  COALESCE(SUM(CASE WHEN sm.delta > 0 THEN sm.delta ELSE 0 END), 0) as total_restocked,
  COALESCE(SUM(sm.delta), 0) as net_stock_movement,
  MAX(sm.created_at) as last_movement_date
FROM public.products p
LEFT JOIN public.stock_movements sm ON sm.product_id = p.id
GROUP BY p.id, p.name, p.sku, p.inventory_quantity, p.track_inventory
ORDER BY p.name;

-- Grant access to the view
GRANT SELECT ON public.stock_analytics TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION public.create_stock_movements_for_paid_order() IS 'Creates stock movements when an order status changes to paid';
COMMENT ON FUNCTION public.validate_stock_availability() IS 'Validates stock availability before creating order items';
COMMENT ON FUNCTION public.get_stock_movement_summary() IS 'Returns stock movement analytics for reporting';
COMMENT ON VIEW public.stock_analytics IS 'Comprehensive stock and sales analytics view';