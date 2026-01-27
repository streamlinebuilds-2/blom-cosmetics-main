-- Skip stock movements when an order item has no product_id (e.g., courses/services)
CREATE OR REPLACE FUNCTION public.create_stock_movements_for_paid_order()
RETURNS TRIGGER AS $$
DECLARE
  order_item RECORD;
  variant_id uuid;
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    FOR order_item IN 
      SELECT oi.*, p.product_type, p.sku as product_sku
      FROM public.order_items oi
      LEFT JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = NEW.id
    LOOP
      IF order_item.product_id IS NULL THEN
        CONTINUE;
      END IF;

      IF order_item.product_type = 'course' THEN
        CONTINUE;
      END IF;

      variant_id := NULL;

      IF order_item.variant_title IS NOT NULL THEN
        SELECT id INTO variant_id
        FROM public.product_variants 
        WHERE product_id = order_item.product_id 
          AND title = order_item.variant_title
          AND is_active = true
        LIMIT 1;
      END IF;
      
      INSERT INTO public.stock_movements (
        product_id,
        variant_id,
        order_id,
        order_item_id,
        delta,
        reason,
        reference,
        metadata
      ) VALUES (
        order_item.product_id,
        variant_id,
        NEW.id,
        order_item.id,
        -order_item.quantity,
        'sale',
        COALESCE(NEW.order_number, NEW.id::text),
        jsonb_build_object(
          'product_name', order_item.product_name,
          'variant_title', order_item.variant_title,
          'unit_price', order_item.unit_price,
          'payment_status', NEW.payment_status,
          'buyer_email', NEW.buyer_email
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
