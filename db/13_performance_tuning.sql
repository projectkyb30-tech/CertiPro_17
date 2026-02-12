-- ==========================================
-- PERFORMANCE OPTIMIZATION INDICES
-- ==========================================
-- Data: 05 Feb 2026
-- Description: Adds missing Foreign Key indices to prevent full table scans
-- during RLS checks and joins.
-- ==========================================

-- 1. Index for Modules -> Courses
-- Critical for: fetching modules by course_id (used in every course page load)
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);

-- 2. Index for Lessons -> Modules
-- Critical for: fetching lessons by module_id (used in deep nested joins)
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);

-- 3. Index for Lesson Contents -> Lessons
-- Critical for: joining lesson_contents (if we join, though usually it's by PK)
-- Since lesson_id is PK in lesson_contents, it is already indexed. 
-- But if we query by lesson_id in other contexts, it's good.

-- 4. Index for Enrollments -> Course (if not exists)
-- (User_id is usually indexed by PK or unique constraint, but course_id might not be)
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);

-- 5. Index for Enrollments -> User (if not exists)
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
