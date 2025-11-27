-- SIMPLIFIED STOCK DEDUCTION MIGRATION
-- Only creates what's needed for stock deduction when orders are paid

-- 1. Create stock_movements table
DROP TABLE IF EXISTS public.stock_movements CASCADE;
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  order_id text REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE CASCADE,
  delta integer NOT NULL, -- Positive for stock increase, negative for decrease
  reason text NOT NULL, -- 'sale', 'restock', 'adjustment', etc.
  reference text,
  metadata jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_variant_id ON public.stock_movements(variant_id);
CREATE INDEX idx_stock_movements_order_id ON public.stock_movements(order_id);

-- Enable RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Stock movements viewable by authenticated users"
  ON public.stock_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stock movements manageable by authenticated users"
  ON public.stock_movements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Function to update stock when movement is created
CREATE OR REPLACE FUNCTION public.update_product_stock_from_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Update product stock_on_hand
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products 
    SET 
      stock_on_hand = COALESCE(stock_on_hand, 0) + NEW.delta,
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

-- Create trigger for stock updates
DROP TRIGGER IF EXISTS trg_update_stock_from_movement ON public.stock_movements;
CREATE TRIGGER trg_update_stock_from_movement
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_stock_from_movement();

-- 3. Function to create stock movements when order is paid
CREATE OR REPLACE FUNCTION public.create_stock_movements_for_paid_order()
RETURNS TRIGGER AS $$
DECLARE
  order_item RECORD;
  product_record public.products%ROWTYPE;
  variant_record public.product_variants%ROWTYPE;
  variant_id uuid;
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
      
      -- Initialize variant_id as null
      variant_id := NULL;
      
      -- Find variant if variant_title is specified
      IF order_item.variant_title IS NOT NULL THEN
        SELECT id INTO variant_id
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
        variant_id,
        NEW.id,
        order_item.id,
        -order_item.quantity, -- Negative to decrease stock
        'sale',
        COALESCE(NEW.order_number, NEW.id::text),
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

-- 4. Create trigger for order status changes
DROP TRIGGER IF EXISTS trg_create_stock_movements_on_paid_order ON public.orders;
CREATE TRIGGER trg_create_stock_movements_on_paid_order
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.create_stock_movements_for_paid_order();

-- 5. Simple view for stock analytics (no complex calculations)
CREATE OR REPLACE VIEW public.stock_analytics AS
SELECT 
  p.id,
  p.name,
  p.sku,
  COALESCE(p.stock_on_hand, 0) as current_stock,
  COALESCE(p.stock_reserved, 0) as reserved_stock,
  COALESCE(p.stock_available, 0) as available_stock,
  CASE WHEN p.stock_type = 'tracked' OR p.stock_type IS NULL THEN true ELSE false END as track_inventory,
  COUNT(DISTINCT sm.order_id) as total_orders,
  COALESCE(SUM(CASE WHEN sm.reason = 'sale' THEN -sm.delta ELSE 0 END), 0) as total_sold_units,
  COALESCE(SUM(sm.delta), 0) as net_stock_movement,
  MAX(sm.created_at) as last_movement_date
FROM public.products p
LEFT JOIN public.stock_movements sm ON sm.product_id = p.id
GROUP BY p.id, p.name, p.sku, p.stock_on_hand, p.stock_reserved, p.stock_available, p.stock_type
ORDER BY p.name;

-- Grant access to the view
GRANT SELECT ON public.stock_analytics TO authenticated;

-- Add comments
COMMENT ON TABLE public.stock_movements IS 'Tracks all stock movements (sales, restocks, adjustments)';
COMMENT ON FUNCTION public.create_stock_movements_for_paid_order() IS 'Creates stock movements when an order status changes to paid';
COMMENT ON VIEW public.stock_analytics IS 'Basic stock and sales analytics view';