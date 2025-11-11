-- Migration: Create user_addresses table for saved shipping addresses
-- This allows users to save and manage multiple shipping addresses in their profile

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_name TEXT, -- e.g., "Home", "Work"
  recipient_name TEXT,
  recipient_phone TEXT,
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can see, insert, update, and delete their own addresses.
CREATE POLICY "Users can manage their own addresses"
  ON public.user_addresses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
