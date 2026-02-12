-- ==========================================
-- USER PROGRESS TRACKING LOGIC (STEP 5)
-- ==========================================
-- Date: 05 Feb 2026
-- Description: Implements server-side progress tracking and syncing.

-- 1. SECURE PROGRESS UPDATES
-- We revoke the policy that allows users to insert/update their own progress directly.
-- This forces all progress updates to go through our secure RPC function which handles syncing.
DROP POLICY IF EXISTS "Users can insert/update own progress" ON public.user_progress;

-- Allow SELECT (Read) only for own progress
CREATE POLICY "Users can view own progress" 
ON public.user_progress FOR SELECT USING (auth.uid() = user_id);

-- 2. CREATE SECURE COMPLETE LESSON FUNCTION
CREATE OR REPLACE FUNCTION public.complete_lesson(
    course_id_param TEXT, 
    module_id_param TEXT, 
    lesson_id_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_total_lessons INTEGER;
  v_completed_lessons INTEGER;
  v_progress_percent INTEGER;
  v_is_enrolled BOOLEAN;
BEGIN
  -- 1. Check Authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Check Enrollment
  -- User must be enrolled to track progress
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE user_id = v_user_id AND course_id = course_id_param
  ) INTO v_is_enrolled;

  IF NOT v_is_enrolled THEN
    RAISE EXCEPTION 'User is not enrolled in this course';
  END IF;

  -- 3. Mark Lesson as Completed (Idempotent)
  INSERT INTO public.user_progress (user_id, lesson_id, is_completed, completed_at)
  VALUES (v_user_id, lesson_id_param, TRUE, now())
  ON CONFLICT (user_id, lesson_id) 
  DO UPDATE SET 
    is_completed = TRUE, 
    completed_at = EXCLUDED.completed_at;

  -- 4. Calculate Progress for the Course
  -- Get total lessons for the course dynamically to ensure accuracy
  SELECT COUNT(*) INTO v_total_lessons
  FROM public.lessons l
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.course_id = course_id_param;

  -- Get count of completed lessons for this course
  -- We join user_progress with lessons and modules to ensure we count only lessons of this course
  SELECT COUNT(DISTINCT up.lesson_id) INTO v_completed_lessons
  FROM public.user_progress up
  JOIN public.lessons l ON up.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE up.user_id = v_user_id 
    AND up.is_completed = TRUE
    AND m.course_id = course_id_param;

  -- Calculate percentage
  IF v_total_lessons > 0 THEN
    v_progress_percent := (v_completed_lessons * 100) / v_total_lessons;
  ELSE
    v_progress_percent := 0;
  END IF;

  -- Cap at 100%
  IF v_progress_percent > 100 THEN
    v_progress_percent := 100;
  END IF;

  -- 5. Update Enrollment Progress
  UPDATE public.enrollments
  SET 
    progress_percent = v_progress_percent,
    is_completed = (v_progress_percent = 100)
  WHERE user_id = v_user_id AND course_id = course_id_param;

  -- 6. Update User Stats (Gamification - Simple Increment)
  -- Increment lessons_completed_today if not already done recently? 
  -- For now, just increment simply.
  UPDATE public.profiles
  SET 
    lessons_completed_today = lessons_completed_today + 1,
    xp = xp + 10, -- 10 XP per lesson
    updated_at = now()
  WHERE id = v_user_id;

END;
$$;
