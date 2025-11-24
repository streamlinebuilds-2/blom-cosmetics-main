-- Test script to verify the fixed coupon discount functionality
-- This script creates test coupons and verifies they calculate correctly

-- Test 1: Create a fixed discount coupon (R250 off)
INSERT INTO public.coupons (
  code, 
  type, 
  value, 
  min_order_cents, 
  max_uses, 
  used_count, 
  valid_from, 
  valid_until, 
  status,
  is_active
) VALUES (
  'TESTFIXED250',
  'fixed',
  250, -- R250 fixed discount
  50000, -- R500 minimum order
  10,
  0,
  now(),
  now() + interval '30 days',
  'active',
  true
) ON CONFLICT (code) DO UPDATE SET
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  min_order_cents = EXCLUDED.min_order_cents,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active;

-- Test 2: Create a percentage discount coupon (20% off)
INSERT INTO public.coupons (
  code, 
  type, 
  percent, 
  min_order_cents, 
  max_uses, 
  used_count, 
  valid_from, 
  valid_until, 
  status,
  is_active
) VALUES (
  'TESTPERCENT20',
  'percent',
  20, -- 20% discount
  30000, -- R300 minimum order
  10,
  0,
  now(),
  now() + interval '30 days',
  'active',
  true
) ON CONFLICT (code) DO UPDATE SET
  type = EXCLUDED.type,
  percent = EXCLUDED.percent,
  min_order_cents = EXCLUDED.min_order_cents,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active;

-- Test 3: Test the fixed discount calculation
SELECT 
  'Fixed Discount Test (R250 off R1000)' as test_name,
  * 
FROM public.redeem_coupon(
  'TESTFIXED250', 
  'test@example.com', 
  100000 -- R1000 order total in cents
);

-- Test 4: Test the percentage discount calculation
SELECT 
  'Percentage Discount Test (20% off R1000)' as test_name,
  * 
FROM public.redeem_coupon(
  'TESTPERCENT20', 
  'test@example.com', 
  100000 -- R1000 order total in cents
);

-- Test 5: Test minimum order validation
SELECT 
  'Minimum Order Test (R250 off R200 order)' as test_name,
  * 
FROM public.redeem_coupon(
  'TESTFIXED250', 
  'test@example.com', 
  20000 -- R200 order total in cents (below R500 minimum)
);

-- Test 6: Verify discount doesn't exceed order total
SELECT 
  'Discount Cap Test (R250 off R100 order)' as test_name,
  * 
FROM public.redeem_coupon(
  'TESTFIXED250', 
  'test@example.com', 
  10000 -- R100 order total in cents (discount capped at R100)
);

-- Clean up test coupons
DELETE FROM public.coupons WHERE code IN ('TESTFIXED250', 'TESTPERCENT20');