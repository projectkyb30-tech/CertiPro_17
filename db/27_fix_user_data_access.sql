-- ==========================================
-- FIX USER ACCESS TO PURCHASES AND ENROLLMENTS
-- ==========================================
-- Date: 2026-02-20
-- Description: Ensures that authenticated users can ALWAYS read their own purchases and enrollments.
-- This is critical for the "Locked" logic to work correctly after a refresh.

-- 1. FIX USER_PURCHASES
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON public.user_purchases;

CREATE POLICY "Users can view own purchases"
ON public.user_purchases
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. FIX ENROLLMENTS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;

CREATE POLICY "Users can view own enrollments"
ON public.enrollments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. FIX USER_PROGRESS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;

CREATE POLICY "Users can view own progress"
ON public.user_progress
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. GRANT PERMISSIONS
GRANT SELECT ON public.user_purchases TO authenticated;
GRANT SELECT ON public.enrollments TO authenticated;
GRANT SELECT ON public.user_progress TO authenticated;
