-- Create stock_movements table in public schema (same as products)
-- This is required for the seed script to work

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  delta integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements(created_at);

-- Enable RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then create new ones
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