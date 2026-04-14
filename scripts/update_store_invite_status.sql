-- Update store course_purchases to mark invites as sent
-- Run this in your STORE Supabase (not Academy)

UPDATE course_purchases 
SET invitation_status = 'sent', 
    invited_at = NOW()
WHERE buyer_email IN ('danell.nellie.vdmerwe@gmail.com', 'charne.meyer23@icloud.com')
AND course_slug = 'blom-flower-watercolor-workshop'
AND invitation_status != 'sent';

-- Verify the update
SELECT order_id, buyer_email, buyer_name, course_slug, invitation_status, invited_at
FROM course_purchases 
WHERE buyer_email IN ('danell.nellie.vdmerwe@gmail.com', 'charne.meyer23@icloud.com')
AND course_slug = 'blom-flower-watercolor-workshop';