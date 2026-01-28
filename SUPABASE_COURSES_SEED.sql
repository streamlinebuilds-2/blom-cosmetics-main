-- Add missing columns to match frontend expectations
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS template_key text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2);
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS available_dates jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS packages jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS key_details jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor_name text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor_bio text;

-- Insert/Update the 3 legacy courses
INSERT INTO public.courses (
  id,
  title,
  slug,
  description,
  price,
  image_url,
  duration,
  level,
  is_active,
  course_type,
  template_key,
  instructor_name,
  instructor_bio,
  deposit_amount,
  available_dates,
  packages,
  key_details,
  created_at
) VALUES 
(
  'a603be5f-2c56-4e95-9423-8229c8991b40',
  'Professional Acrylic Training',
  'professional-acrylic-training',
  'Master the art of acrylic nail application with hands-on training. Choose your kit, book your dates, and secure your spot with a deposit.',
  7600,
  '/professional-acrylic-training-hero.webp',
  '5 Full Days (Intensive Training)',
  'Beginner to Intermediate',
  true,
  'in-person',
  'professional-acrylic-training',
  'Avané Crous',
  'Professional nail artist and educator with over 8 years of experience in acrylic nail application.',
  1800.00,
  '["March 2026 (19-23 Mar)", "May/June 2026 (29 May-2 Jun)"]'::jsonb,
  '[
    {"name":"Standard","price":7600,"kit_value":3200,"features":["Prep & Primer","Sculpting Forms (x300)","Top Coat","Colour Acrylic 15g","Nude Acrylic 56g","White Acrylic 56g","Crystal Clear Acrylic 56g","250ml Nail Liquid","100% Kolinsky Brush","Dappen Dish","Training Manual","Lint-Free Wipes","Nail Cleanser 30ml","Hand File & Buffer","Cuticle Pusher","Lifelong mentorship and modern techniques"],"popular":false},
    {"name":"Deluxe","price":9900,"kit_value":5100,"features":["Prep & Primer","Sculpting Forms (x300)","Top Coat","Colour Acrylic 15g","Nude Acrylic 56g","White Acrylic 56g","Crystal Clear Acrylic 56g","500ml Nail Liquid","100% Kolinsky Brush","Dappen Dish","Training Manual","Lint-Free Wipes","Nail Cleanser 200ml","Hand File & Buffer","Unicorn Cuticle Pusher","LED Lamp (x1)","Electric File (x1)","Safety Bit","Box of Nail Tips","Nail Glue","Lifelong mentorship and modern techniques"],"popular":true}
  ]'::jsonb,
  '[
    {"title":"What You Need to Bring","items":["Your own refreshments and lunch (coffee and tea will be provided daily)","A practice hand (preferably a Habbil Hand - this is essential)","An electric file (e-file) and a safety bit","Two hand models: Day 4 model required for practical work; Day 5 model required for assessment"]},
    {"title":"Exclusive Student Discount","items":["We have a shop inside the training studio","10% discount on all product purchases during your training"]},
    {"title":"Training Times - March 2026","items":["19 March 2026 (08:30-16:00)","20 March 2026 (08:30-16:00)","21 March 2026 (09:00-15:00)","22 March 2026 (08:30-15:00)","23 March 2026 (08:30-16:00)"]},
    {"title":"Training Times - May/June 2026","items":["29 May 2026 (08:30-16:00)","30 May 2026 (08:30-16:00)","31 May 2026 (09:00-15:00)","1 June 2026 (08:30-15:00)","2 June 2026 (08:30-16:00)"]},
    {"title":"Deposit","items":["R1800 non-refundable deposit required to book your spot"]}
  ]'::jsonb,
  now()
),
(
  '7c5276c1-9207-4653-89c3-bb4c675db5e2',
  'Online Watercolour Workshop',
  'online-watercolour-workshop',
  'Learn how to create soft, dreamy watercolour designs from the comfort of your home.',
  480,
  '/online-watercolor-card.webp',
  'Self-Paced',
  'All Levels',
  true,
  'online',
  'online-watercolour-workshop',
  'Avané Crous',
  'Professional nail artist and educator with over 8 years of experience.',
  null,
  '["Available Now"]'::jsonb,
  '[{"name":"Complete Workshop","price":480,"kit_value":null,"features":["Lifetime access to video tutorials","Step-by-step guides","Certificate after you''ve completed your exam"],"popular":false}]'::jsonb,
  null,
  now() - interval '1 day'
),
(
  'efe16488-1de6-4522-aeb3-b08cfae3a640',
  'Christmas Watercolor Workshop',
  'christmas-watercolor-workshop',
  'Paint festive watercolor nail art for the holidays! Learn Christmas tree designs, snowflakes, and winter wonderland techniques.',
  450,
  '/christmas-watercolor-card.webp',
  'Self-Paced',
  'All Levels',
  true,
  'online',
  'christmas-watercolor-workshop',
  'Avané Crous',
  'Professional nail artist and educator with over 8 years of experience.',
  null,
  '["Available Now"]'::jsonb,
  '[{"name":"Christmas Workshop","price":450,"kit_value":null,"features":["Lifetime access to Christmas tutorials","Holiday design templates","Certificate after you''ve completed your exam"],"popular":false}]'::jsonb,
  null,
  now() - interval '2 days'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  duration = EXCLUDED.duration,
  level = EXCLUDED.level,
  is_active = EXCLUDED.is_active,
  course_type = EXCLUDED.course_type,
  template_key = EXCLUDED.template_key,
  instructor_name = EXCLUDED.instructor_name,
  instructor_bio = EXCLUDED.instructor_bio,
  deposit_amount = EXCLUDED.deposit_amount,
  available_dates = EXCLUDED.available_dates,
  packages = EXCLUDED.packages,
  key_details = EXCLUDED.key_details;
