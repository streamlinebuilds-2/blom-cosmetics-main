ALTER TABLE public.course_purchases
ADD COLUMN IF NOT EXISTS instructor TEXT;

COMMENT ON COLUMN course_purchases.instructor IS 'Instructor and location selected at time of booking, e.g. "Avané Crous - Randfontein" or "Yolanda Botha - Orkney"';
