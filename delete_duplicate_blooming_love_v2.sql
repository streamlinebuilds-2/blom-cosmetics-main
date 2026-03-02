/*
  Fix: Remove duplicate "Blooming Love Acrylic Collection" product (Version 2 - Robust)
  
  Issue: Previous attempt didn't delete the product, likely due to description mismatch.
  Target: Product with name 'Blooming Love Acrylic Collection' that is NOT the Bundle version.
  
  Bundle Version Description (from screenshot): "Professional quality nail care product"
  Duplicate Version Description (from screenshot): "This is a romantic trio of passion and elegance."
  
  Strategy: 
  1. Delete based on broader keyword match ("romantic", "passion").
  2. As a fallback, delete ANY product with this name that does NOT have "Professional quality" in its description.
     (This ensures we keep the correct Bundle version while removing duplicates regardless of their description text).
*/

-- 1. Try to delete based on the "romantic/passion" description
DELETE FROM public.products 
WHERE name = 'Blooming Love Acrylic Collection' 
AND (
     description ILIKE '%romantic%' 
  OR description ILIKE '%passion%' 
  OR short_description ILIKE '%romantic%' 
  OR short_description ILIKE '%passion%'
  OR overview ILIKE '%romantic%'
  OR overview ILIKE '%passion%'
  OR short_desc ILIKE '%romantic%'
  OR short_desc ILIKE '%passion%'
);

-- 2. Fallback: Delete any remaining duplicates that don't match the Bundle description
-- ONLY run this if you are sure the Bundle version has "Professional quality" in its description.
-- Based on the screenshot, the Bundle version clearly shows "Professional quality nail care product".

DELETE FROM public.products 
WHERE name = 'Blooming Love Acrylic Collection' 
AND (description IS NULL OR description NOT ILIKE '%Professional quality%')
AND (short_description IS NULL OR short_description NOT ILIKE '%Professional quality%');
