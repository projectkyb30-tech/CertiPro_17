-- ==========================================
-- SECURE ENROLLMENT LOGIC (STEP 4)
-- ==========================================
-- Date: 05 Feb 2026
-- Description: Implements server-side enrollment logic and secures the enrollments table.

-- 1. REVOKE DIRECT ACCESS
-- We remove the policy that allows users to insert their own enrollments directly.
-- This forces all enrollments to go through our secure RPC function.
DROP POLICY IF EXISTS "Users can insert own enrollment" ON public.enrollments;

-- Verify RLS is enabled
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 2. CREATE SECURE ENROLLMENT FUNCTION
-- This function runs with SECURITY DEFINER privileges (bypassing RLS for the insert)
-- but performs strict checks before doing so.
CREATE OR REPLACE FUNCTION public.enroll_in_course(course_id_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_price NUMERIC;
  v_is_published BOOLEAN;
  v_user_id UUID;
BEGIN
  -- 1. Check Authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Get Course Details
  SELECT price, is_published INTO v_course_price, v_is_published
  FROM public.courses
  WHERE id = course_id_param;

  -- 3. Validate Course Existence
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

  -- 4. Validate Publication Status
  IF v_is_published IS NOT TRUE THEN
    RAISE EXCEPTION 'Course is not published';
  END IF;

  -- 5. Security Check: Prevent Free Unlock of Paid Courses
  -- Since we don't have a payment system yet, we strictly allow enrollment ONLY for free courses.
  -- This prevents users from calling this RPC to unlock paid content for free.
  IF v_course_price > 0 THEN
    RAISE EXCEPTION 'Payment required for this course. Direct enrollment not allowed.';
  END IF;

  -- 6. Idempotency Check (If already enrolled, succeed silently)
  IF EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = v_user_id AND course_id = course_id_param) THEN
    RETURN;
  END IF;

  -- 7. Perform Enrollment
  INSERT INTO public.enrollments (user_id, course_id, enrolled_at, progress_percent, is_completed)
  VALUES (v_user_id, course_id_param, now(), 0, FALSE);

END;
$$;
