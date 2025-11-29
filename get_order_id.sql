-- Get order_id for BL-MIJ9P3QJ to create the exact webhook payload
SELECT id as order_id
FROM orders 
WHERE order_number = 'BL-MIJ9P3QJ';