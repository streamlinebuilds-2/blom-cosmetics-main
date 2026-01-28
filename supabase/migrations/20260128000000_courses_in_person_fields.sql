ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2);
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS available_dates jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS packages jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS key_details jsonb;
