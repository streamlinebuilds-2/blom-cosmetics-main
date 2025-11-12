-- Migration: Add NOT NULL constraints and data validation to orders table
-- Created: 2025-11-12
-- Purpose: Ensure data integrity for order records

-- ============================================================================
-- STEP 1: Add NOT NULL constraints on critical fields
-- ============================================================================

-- Add NOT NULL constraint for buyer_email (all real orders must have email)
ALTER TABLE orders
  ALTER COLUMN buyer_email SET NOT NULL;

-- Add NOT NULL constraint for buyer_name (all real orders must have name)
ALTER TABLE orders
  ALTER COLUMN buyer_name SET NOT NULL;

-- Add NOT NULL constraint for order_number (every order must have a unique number)
ALTER TABLE orders
  ALTER COLUMN order_number SET NOT NULL;

-- Add NOT NULL constraint for status
ALTER TABLE orders
  ALTER COLUMN status SET NOT NULL;

-- Add default value for payment_status and make it NOT NULL
ALTER TABLE orders
  ALTER COLUMN payment_status SET DEFAULT 'unpaid';

UPDATE orders SET payment_status = 'unpaid' WHERE payment_status IS NULL;

ALTER TABLE orders
  ALTER COLUMN payment_status SET NOT NULL;

-- ============================================================================
-- STEP 2: Add CHECK constraints for data validation
-- ============================================================================

-- Ensure total is positive or zero (or NULL for cancelled orders)
ALTER TABLE orders
  ADD CONSTRAINT orders_total_valid
  CHECK (total >= 0 OR status = 'cancelled');

-- Ensure total_cents matches total (total_cents = total * 100)
ALTER TABLE orders
  ADD CONSTRAINT orders_total_cents_matches
  CHECK (total_cents = (total * 100)::integer OR total_cents IS NULL);

-- Ensure status has valid values
ALTER TABLE orders
  ADD CONSTRAINT orders_status_valid
  CHECK (status IN ('pending', 'placed', 'paid', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'));

-- Ensure payment_status has valid values
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_valid
  CHECK (payment_status IN ('unpaid', 'paid', 'partially_paid', 'refunded', 'failed'));

-- Ensure fulfillment_method has valid values (when not NULL)
ALTER TABLE orders
  ADD CONSTRAINT orders_fulfillment_method_valid
  CHECK (fulfillment_method IN ('delivery', 'collection', 'pickup') OR fulfillment_method IS NULL);

-- Ensure paid_at is set when payment_status is 'paid'
-- This is a soft constraint - we'll create a trigger for this

-- ============================================================================
-- STEP 3: Add indexes for performance
-- ============================================================================

-- Index on order_number for quick lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Index on buyer_email for customer order history
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON orders(buyer_email);

-- Index on status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Index on m_payment_id for payment gateway lookups
CREATE INDEX IF NOT EXISTS idx_orders_m_payment_id ON orders(m_payment_id);

-- Compound index for common queries
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- ============================================================================
-- STEP 4: Create trigger to sync payment_status with paid_at
-- ============================================================================

-- Function to automatically set paid_at when payment_status changes to 'paid'
CREATE OR REPLACE FUNCTION sync_order_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment_status changed to 'paid' and paid_at is NULL, set it to now
  IF NEW.payment_status = 'paid' AND NEW.paid_at IS NULL THEN
    NEW.paid_at = NOW();
  END IF;

  -- If payment_status is 'paid', ensure status is also 'paid'
  IF NEW.payment_status = 'paid' AND NEW.status != 'paid' THEN
    NEW.status = 'paid';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_sync_payment_status ON orders;
CREATE TRIGGER trigger_sync_payment_status
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION sync_order_payment_status();

-- ============================================================================
-- STEP 5: Add unique constraint on order_number
-- ============================================================================

-- Ensure order numbers are unique
ALTER TABLE orders
  ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);

-- ============================================================================
-- STEP 6: Comments for documentation
-- ============================================================================

COMMENT ON COLUMN orders.buyer_email IS 'Customer email address - required for all orders';
COMMENT ON COLUMN orders.buyer_name IS 'Customer full name - required for all orders';
COMMENT ON COLUMN orders.order_number IS 'Unique order reference number shown to customer';
COMMENT ON COLUMN orders.status IS 'Order fulfillment status (pending, placed, paid, packed, shipped, delivered, cancelled, refunded)';
COMMENT ON COLUMN orders.payment_status IS 'Payment processing status (unpaid, paid, partially_paid, refunded, failed)';
COMMENT ON COLUMN orders.fulfillment_method IS 'How the order will be fulfilled (delivery, collection, pickup)';
COMMENT ON COLUMN orders.delivery_address IS 'JSONB object containing delivery address details';
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when payment was confirmed';
COMMENT ON COLUMN orders.m_payment_id IS 'Payment gateway transaction ID';

-- ============================================================================
-- Migration complete!
-- ============================================================================
