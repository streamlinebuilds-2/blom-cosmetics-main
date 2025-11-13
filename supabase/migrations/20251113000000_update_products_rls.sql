-- Update RLS policy for products to allow public read access
-- This ensures that published products are viewable by everyone

-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Active products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Public can read active products" ON products;

-- Create new policy that checks both is_active and status
CREATE POLICY "Public can read published products"
ON products FOR SELECT
TO anon, authenticated
USING (
  is_active = true AND
  status IN ('active', 'published')
);

-- Ensure RLS is enabled on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Add index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
