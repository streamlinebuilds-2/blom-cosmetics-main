-- Create the CORRECT stock_movements table to match your trigger functions
-- This matches what fn_order_paid_movements and handle_new_order_inventory expect

-- Create stock movements table with all required columns
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