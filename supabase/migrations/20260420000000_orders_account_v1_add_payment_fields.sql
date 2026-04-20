-- Add payment_status and payment_method to the customer-facing orders view.
-- The frontend fetchMyOrders.ts falls back to the orders table if this view
-- doesn't exist or is missing columns, so this migration is safe to apply at any time.
CREATE OR REPLACE VIEW public.orders_account_v1 AS
SELECT
  id,
  user_id,
  m_payment_id,
  order_number,
  COALESCE(order_number, m_payment_id) AS order_display,
  status,
  shipping_status,
  order_packed_at,
  total,
  total_cents,
  subtotal_cents,
  shipping_cents,
  discount_cents,
  currency,
  created_at,
  invoice_url,
  buyer_name,
  buyer_email,
  payment_status,
  payment_method
FROM public.orders;
