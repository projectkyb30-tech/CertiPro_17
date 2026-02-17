-- Ensure only one active (uncompleted) exam attempt per user/course
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_exam_attempt
ON public.exam_attempts (user_id, course_id)
WHERE completed_at IS NULL;
