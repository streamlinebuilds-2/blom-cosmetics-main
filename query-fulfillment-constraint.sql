-- Query the check constraint definition
SELECT 
  conname,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.orders'::regclass
  AND contype = 'c'
  AND conname LIKE '%fulfillment%';

-- Query sample existing orders to see what values work
SELECT DISTINCT fulfillment_method 
FROM public.orders 
WHERE fulfillment_method IS NOT NULL
LIMIT 10;

