/*
  # Create Stock Movements Table

  This migration creates the stock_movements table that tracks all inventory changes
  for products. This is required for the seed script and order processing.

  ## Table Structure
  - id (uuid, primary key) - Unique identifier
  - product_id (uuid, foreign key) - Reference to products
  - delta (integer) - Stock change (+/- amount)
  - reason (text) - Reason for the movement (e.g., 'seed import', 'order', 'restock')
  - order_id (uuid, nullable) - Reference to orders if movement is order-related
  - created_at (timestamptz) - Movement timestamp
  - created_by (uuid, nullable) - User who made the change
*/

-- Create stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_order_id ON stock_movements(order_id);

-- Enable RLS on stock movements table
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stock movements
CREATE POLICY "Stock movements are viewable by authenticated users"
  ON stock_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stock movements can be managed by authenticated users"
  ON stock_movements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update stock quantity when movements are added
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the product's inventory_quantity based on the delta
  UPDATE products 
  SET inventory_quantity = COALESCE(inventory_quantity, 0) + NEW.delta,
      updated_at = now()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update stock when movements are added
DROP TRIGGER IF EXISTS trg_update_stock_on_movement ON stock_movements;
CREATE TRIGGER trg_update_stock_on_movement
  AFTER INSERT ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();