-- FIX: Update BOTH Category and Subcategory for ALL active products
-- Purpose: Fix products showing as "Uncategorized" by intelligently assigning both category and subcategory
-- Run this script to update the products table

-- Update products based on name patterns
-- Use a single UPDATE statement with multiple CASE expressions for efficiency

UPDATE products
SET
  -- 1. Set the Main Category
  category = CASE
    WHEN name ILIKE '%colour acrylic%' THEN 'acrylic-system'
    WHEN name ILIKE '%core acrylic%' OR name ILIKE '%glitter acrylic%' THEN 'acrylic-system'
    WHEN name ILIKE '%monomer%' OR name ILIKE '%liquid%' THEN 'acrylic-system'
    WHEN name ILIKE '%table%' OR name ILIKE '%station%' OR name ILIKE '%desk%' OR name ILIKE '%dresser%' OR name ILIKE '%rack%' THEN 'furniture'
    WHEN name ILIKE '%prep%' OR name ILIKE '%primer%' OR name ILIKE '%dehydrator%' OR name ILIKE '%cuticle oil%' THEN 'essentials'
    WHEN name ILIKE '%top coat%' OR name ILIKE '%base%' OR name ILIKE '%finish%' THEN 'essentials'
    WHEN name ILIKE '%brush%' OR name ILIKE '%file%' OR name ILIKE '%forms%' OR name ILIKE '%tips%' THEN 'tools'
    WHEN name ILIKE '%bundle%' OR name ILIKE '%collection%' THEN 'bundles'
    ELSE 'uncategorized'
  END,
  -- 2. Set the Subcategory (This is what groups them in the grid!)
  subcategory = CASE
    WHEN name ILIKE '%colour acrylic%' THEN 'Colour Acrylics'
    WHEN name ILIKE '%core acrylic%' OR name ILIKE '%glitter acrylic%' THEN 'Core & Glitter'
    WHEN name ILIKE '%monomer%' OR name ILIKE '%liquid%' THEN 'Liquids'
    WHEN name ILIKE '%table%' OR name ILIKE '%station%' OR name ILIKE '%desk%' OR name ILIKE '%dresser%' OR name ILIKE '%rack%' THEN 'Salon Furniture'
    WHEN name ILIKE '%prep%' OR name ILIKE '%primer%' OR name ILIKE '%dehydrator%' OR name ILIKE '%cuticle oil%' THEN 'Prep & Care'
    WHEN name ILIKE '%top coat%' OR name ILIKE '%base%' OR name ILIKE '%finish%' THEN 'Top Coats'
    WHEN name ILIKE '%brush%' OR name ILIKE '%file%' OR name ILIKE '%forms%' OR name ILIKE '%tips%' THEN 'Tools & Accessories'
    WHEN name ILIKE '%bundle%' OR name ILIKE '%collection%' THEN 'Value Sets'
    ELSE 'General'
  END
WHERE status = 'active';