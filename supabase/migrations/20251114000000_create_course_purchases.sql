-- Create course_purchases table to track course purchases from the store
-- This table is in the STORE database

CREATE TABLE IF NOT EXISTS course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  course_slug TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT,
  buyer_phone TEXT,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invitation_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'redeemed', 'expired'
  academy_user_id UUID, -- Will be populated when user redeems invite and creates account
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_order_course UNIQUE (order_id, course_slug)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_purchases_buyer_email ON course_purchases(buyer_email);
CREATE INDEX IF NOT EXISTS idx_course_purchases_order_id ON course_purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_academy_user_id ON course_purchases(academy_user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_course_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_purchases_updated_at
  BEFORE UPDATE ON course_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_course_purchases_updated_at();

-- Add comment to table
COMMENT ON TABLE course_purchases IS 'Tracks course purchases from the store and their invitation status';
COMMENT ON COLUMN course_purchases.invitation_status IS 'Status of the course invitation: pending, sent, redeemed, expired';
COMMENT ON COLUMN course_purchases.academy_user_id IS 'User ID from the academy database after they redeem the invite';
