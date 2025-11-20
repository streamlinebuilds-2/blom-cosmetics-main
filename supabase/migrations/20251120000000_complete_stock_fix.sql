-- Complete fix: Create proper stock_movements table and corrected trigger functions

-- Create stock_movements table with ALL required columns
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  sku text,
  delta integer NOT NULL,
  change_amount integer,
  reason text NOT NULL,
  variant_name text,
  quantity_change integer,
  related_order_id uuid,
  reference_id text,
  order_id text, -- This is what handle_new_order_inventory expects
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reason ON public.stock_movements(reason);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements(created_at);

-- Enable RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create new ones
DROP POLICY IF EXISTS "Stock movements viewable by authenticated users" ON public.stock_movements;
DROP POLICY IF EXISTS "Stock movements manageable by authenticated users" ON public.stock_movements;

CREATE POLICY "Stock movements viewable by authenticated users"
  ON public.stock_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stock movements manageable by authenticated users"
  ON public.stock_movements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fix fn_order_paid_movements
CREATE OR REPLACE FUNCTION public.fn_order_paid_movements()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.stock_movements(product_id, sku, delta, change_amount, reason, related_order_id, created_by)
  SELECT 
    oi.product_id, 
    COALESCE(oi.sku, p.sku, ''), 
    -oi.quantity, 
    -oi.quantity, 
    'sale', 
    NEW.id, 
    NULL
  FROM public.order_items oi
  JOIN public.products p ON p.id = oi.product_id
  WHERE oi.order_id = NEW.id 
    AND oi.product_id IS NOT NULL
    AND (p.product_type IS NULL OR p.product_type != 'course');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix handle_new_order_inventory  
CREATE OR REPLACE FUNCTION public.handle_new_order_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct stock from product (use correct column name)
    UPDATE public.products
    SET stock_quantity = COALESCE(stock_quantity, 0) - NEW.quantity
    WHERE id = NEW.product_id;

    -- Log the movement with correct column names
    INSERT INTO public.stock_movements (product_id, delta, reason, order_id, created_at)
    VALUES (
        NEW.product_id, 
        -(NEW.quantity), 
        'sale', 
        (SELECT order_number FROM public.orders WHERE id = NEW.order_id),
        now()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the triggers
DROP TRIGGER IF EXISTS trg_order_paid_movements ON orders;
CREATE TRIGGER trg_order_paid_movements
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION fn_order_paid_movements();

DROP TRIGGER IF EXISTS on_order_item_created ON order_items;
CREATE TRIGGER on_order_item_created
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_order_inventory();