-- Migration: Add constraints to product_reviews table
-- Created: 2025-11-12
-- Purpose: Ensure data integrity for product reviews

-- ============================================================================
-- STEP 1: Consolidate reviewer information
-- ============================================================================

-- Update records to use consistent field names
-- Prefer 'name' and 'email' over 'reviewer_name' and 'reviewer_email'
UPDATE product_reviews
SET name = COALESCE(name, reviewer_name)
WHERE name IS NULL AND reviewer_name IS NOT NULL;

UPDATE product_reviews
SET email = COALESCE(email, reviewer_email)
WHERE email IS NULL AND reviewer_email IS NOT NULL;

-- ============================================================================
-- STEP 2: Add NOT NULL constraints
-- ============================================================================

-- Ensure every review has a product reference
ALTER TABLE product_reviews
  ALTER COLUMN product_slug SET NOT NULL;

-- Ensure every review has a reviewer name (using 'name' field)
ALTER TABLE product_reviews
  ALTER COLUMN name SET NOT NULL;

-- Ensure every review has a reviewer email (using 'email' field)
ALTER TABLE product_reviews
  ALTER COLUMN email SET NOT NULL;

-- Ensure every review has a rating
ALTER TABLE product_reviews
  ALTER COLUMN rating SET NOT NULL;

-- Set default status to 'pending' and make NOT NULL
ALTER TABLE product_reviews
  ALTER COLUMN status SET DEFAULT 'pending';

UPDATE product_reviews SET status = 'pending' WHERE status IS NULL;

ALTER TABLE product_reviews
  ALTER COLUMN status SET NOT NULL;

-- ============================================================================
-- STEP 3: Add CHECK constraints
-- ============================================================================

-- Ensure status has valid values
ALTER TABLE product_reviews
  ADD CONSTRAINT reviews_status_valid
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Ensure rating is between 1 and 5
ALTER TABLE product_reviews
  ADD CONSTRAINT reviews_rating_valid
  CHECK (rating >= 1 AND rating <= 5);

-- Ensure email format is valid
ALTER TABLE product_reviews
  ADD CONSTRAINT reviews_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- ============================================================================
-- STEP 4: Add indexes for performance
-- ============================================================================

-- Index on product_slug for product page reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_slug ON product_reviews(product_slug);

-- Index on status for admin filtering
CREATE INDEX IF NOT EXISTS idx_reviews_status ON product_reviews(status);

-- Index on rating for analytics
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);

-- Index on email for finding customer reviews
CREATE INDEX IF NOT EXISTS idx_reviews_email ON product_reviews(email);

-- Compound index for published reviews on product pages
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved
  ON product_reviews(product_slug, created_at DESC)
  WHERE status = 'approved';

-- ============================================================================
-- STEP 5: Create trigger to set published_at
-- ============================================================================

-- Function to set published_at when status changes to 'approved'
CREATE OR REPLACE FUNCTION set_review_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'approved' and published_at is NULL, set it to now
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_published_at ON product_reviews;
CREATE TRIGGER trigger_set_published_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION set_review_published_at();

-- ============================================================================
-- STEP 6: Add comments for documentation
-- ============================================================================

COMMENT ON COLUMN product_reviews.product_slug IS 'Product slug reference - required';
COMMENT ON COLUMN product_reviews.name IS 'Reviewer full name - required';
COMMENT ON COLUMN product_reviews.email IS 'Reviewer email address - required';
COMMENT ON COLUMN product_reviews.rating IS 'Star rating from 1 to 5 - required';
COMMENT ON COLUMN product_reviews.status IS 'Review moderation status (pending, approved, rejected)';
COMMENT ON COLUMN product_reviews.title IS 'Short review title/headline';
COMMENT ON COLUMN product_reviews.body IS 'Full review text';
COMMENT ON COLUMN product_reviews.images IS 'Array of image URLs uploaded with review';
COMMENT ON COLUMN product_reviews.is_verified_buyer IS 'True if reviewer purchased the product';
COMMENT ON COLUMN product_reviews.published_at IS 'Timestamp when review was approved and published';

-- ============================================================================
-- Migration complete!
-- ============================================================================
