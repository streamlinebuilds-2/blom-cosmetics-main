-- Add variant_title column to order_items to track product variants

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS variant_title text;

COMMENT ON COLUMN public.order_items.variant_title IS 'Product variant title (e.g., "Pink - 15ml", "Small", etc.)';
