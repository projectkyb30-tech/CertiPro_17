-- Migration to add missing profile fields
-- This file should be run in the Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS birth_date text;

-- Verify RLS policies allow update (already exists generally, but good to check)
-- "Update own profile" on profiles for update using (auth.uid() = id);
