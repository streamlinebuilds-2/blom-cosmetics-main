-- Add missing columns to match frontend expectations
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS template_key text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2);
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS available_dates jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS packages jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS key_details jsonb;

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
  'Master the art of acrylic nail application with hands-on training in Randfontein.',
  7200,
  '/professional-acrylic-training-hero.webp',
  '5 Days',
  'Beginner to Intermediate',
  true,
  'in-person',
  'professional-acrylic-training',
  'Avané Crous',
  'Professional nail artist and educator with over 8 years of experience in acrylic nail application.',
  2000.00,
  '["March 15-19, 2026", "April 12-16, 2026", "May 10-14, 2026"]'::jsonb,
  '[
    {"name":"Standard","price":7200,"kit_value":3200,"features":["5-day comprehensive training","Basic starter kit included","Certificate after you''ve completed your exam","Course materials and handouts"],"popular":false},
    {"name":"Deluxe","price":9900,"kit_value":5100,"features":["5-day comprehensive training","Premium professional kit included","Certificate after you''ve completed your exam","Course materials and handouts","Bigger kit — electric e-file & LED lamp included"],"popular":true}
  ]'::jsonb,
  '["Deposit required to secure your spot","Models required for certain days (see course details)","Balance due on course start date"]'::jsonb,
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
