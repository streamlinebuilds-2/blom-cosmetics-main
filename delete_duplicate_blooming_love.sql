/*
  Fix: Remove duplicate "Blooming Love Acrylic Collection" product
  
  Issue: There are two "Blooming Love Acrylic Collection" products.
  1. One with "BUNDLE" badge (Keep this one)
  2. One without "BUNDLE" badge (Remove this one)
  
  Target for deletion:
  - Name: 'Blooming Love Acrylic Collection'
  - Description: 'This is a romantic trio of passion and elegance.' (matches the screenshot for the item without badge)
*/

DELETE FROM public.products 
WHERE name = 'Blooming Love Acrylic Collection' 
AND (
  description ILIKE '%This is a romantic trio of passion and elegance%' 
  OR 
  short_description ILIKE '%This is a romantic trio of passion and elegance%'
);
