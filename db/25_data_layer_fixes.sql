-- ==========================================
-- STEP 04 — DATA LAYER FIXES
-- ==========================================
-- Purpose: Secure PII via RLS, remove legacy payments table,
--          and add missing performance indexes.
-- ==========================================

-- 1) Secure PII in profiles (RLS)
-- Drop permissive policy if it exists and enforce self-view only
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    EXECUTE 'DROP POLICY "Public profiles are viewable by everyone" ON public.profiles';
  END IF;
END
$$;

-- Ensure restricted SELECT policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Users can view own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id)';
  END IF;
END
$$;

-- Create/refresh public view without PII
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  streak,
  xp,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- 2) Remove legacy 'payments' table if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'payments'
  ) THEN
    EXECUTE 'DROP TABLE public.payments CASCADE';
  END IF;
END
$$;

-- 3) Add missing indexes
-- user_purchases(course_id)
CREATE INDEX IF NOT EXISTS idx_user_purchases_course_id ON public.user_purchases(course_id);

-- exam_attempts(user_id, course_id) composite for common filters
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_course ON public.exam_attempts(user_id, course_id);

-- 4) Enforce non-negative course price (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints cc
    JOIN information_schema.table_constraints tc 
      ON cc.constraint_name = tc.constraint_name 
     AND cc.constraint_schema = tc.constraint_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'courses'
      AND cc.constraint_name = 'price_non_negative'
  ) THEN
    EXECUTE 'ALTER TABLE public.courses ADD CONSTRAINT price_non_negative CHECK (price >= 0)';
  END IF;
END
$$;
