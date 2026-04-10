-- Fix: Blom Gel Paint Set - 12x colours
-- 1. Deactivate the imageless duplicate (no hard delete to preserve any order history)
-- 2. Mark the correct product (with image, in bundle deals) as out of stock

-- Step 1: Find both products so we can confirm before acting
-- (Run this SELECT first to verify which IDs we're touching)
SELECT id, name, slug, stock, is_active, featured_image, created_at
FROM products
WHERE name ILIKE '%gel paint%'
ORDER BY created_at;

-- Step 2: Deactivate the duplicate that has NO image
UPDATE products
SET
  is_active = false,
  updated_at = now()
WHERE
  name ILIKE '%gel paint%'
  AND (featured_image IS NULL OR featured_image = '');

-- Step 3: Mark the correct product (with image) as out of stock
-- It stays active and visible, just shows as Out of Stock
UPDATE products
SET
  stock = 0,
  updated_at = now()
WHERE
  name ILIKE '%gel paint%'
  AND featured_image IS NOT NULL
  AND featured_image != '';
