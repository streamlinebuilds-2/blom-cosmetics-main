-- Migration: Auto-categorize products based on name patterns
-- Purpose: Fix products showing as "Uncategorized" by intelligently assigning categories and subcategories
-- Run this script to update the products table

-- Set the migration timestamp to ensure proper ordering
-- Format: YYYYMMDDHHMMSS (e.g., 20251111000000)
-- This migration will be applied after 003_fix_fulfillment_type.sql

-- Update products based on name patterns
-- Use a single UPDATE statement with multiple CASE expressions for efficiency

UPDATE products
SET
  category = CASE
    -- Acrylics
    WHEN name ILIKE '%colour acrylic%' THEN 'acrylic-system'
    WHEN name ILIKE '%core acrylic%' OR name ILIKE '%glitter acrylic%' THEN 'acrylic-system'
    WHEN name ILIKE '%monomer%' OR name ILIKE '%liquid%' THEN 'acrylic-system'
    
    -- Furniture
    WHEN name ILIKE '%table%' OR name ILIKE '%station%' OR name ILIKE '%desk%' OR name ILIKE '%dresser%' OR name ILIKE '%rack%' THEN 'furniture'
    
    -- Essentials & Prep
    WHEN name ILIKE '%prep%' OR name ILIKE '%primer%' OR name ILIKE '%dehydrator%' OR name ILIKE '%cuticle oil%' THEN 'essentials'
    WHEN name ILIKE '%top coat%' OR name ILIKE '%base%' OR name ILIKE '%finish%' THEN 'essentials'
    
    -- Tools
    WHEN name ILIKE '%brush%' OR name ILIKE '%file%' OR name ILIKE '%forms%' OR name ILIKE '%tips%' THEN 'tools'
    
    -- Bundles
    WHEN name ILIKE '%bundle%' OR name ILIKE '%collection%' THEN 'bundles'
    
    -- Default fallback
    ELSE 'uncategorized'
  END
WHERE
  -- Only update products where category is NULL or 'uncategorized'
  (category IS NULL OR category = 'uncategorized')
  AND status = 'active';