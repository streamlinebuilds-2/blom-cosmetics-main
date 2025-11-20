-- Fix the trigger functions to match the actual table structure
-- These were trying to insert with wrong column names

-- Fix fn_order_paid_movements
CREATE OR REPLACE FUNCTION public.fn_order_paid_movements()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.stock_movements(product_id, sku, delta, change_amount, reason, related_order_id, created_by)
  SELECT 
    oi.product_id, 
    COALESCE(oi.sku, p.sku, ''), 
    -oi.quantity, 
    -oi.quantity, 
    'sale', 
    NEW.id, -- This is the order ID
    NULL
  FROM public.order_items oi
  JOIN public.products p ON p.id = oi.product_id
  WHERE oi.order_id = NEW.id 
    AND oi.product_id IS NOT NULL
    AND (p.product_type IS NULL OR p.product_type != 'course');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix handle_new_order_inventory  
CREATE OR REPLACE FUNCTION public.handle_new_order_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Deduct stock from product (use correct column name)
    UPDATE public.products
    SET stock_quantity = COALESCE(stock_quantity, 0) - NEW.quantity
    WHERE id = NEW.product_id;

    -- 2. Log the movement with correct column names
    INSERT INTO public.stock_movements (product_id, delta, reason, order_id, created_at)
    VALUES (
        NEW.product_id, 
        -(NEW.quantity), 
        'sale', 
        (SELECT order_number FROM public.orders WHERE id = NEW.order_id),
        now()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;