-- ==========================================
-- FIX PUBLIC ACCESS TO COURSES
-- ==========================================
-- Date: 2026-02-20
-- Description: Ensures that the 'courses' table is readable by everyone (authenticated and anon)
-- provided the course is published. This fixes the issue where courses disappear
-- if RLS blocks access.

-- 1. Enable RLS (just in case it wasn't)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 2. Drop potentially conflicting policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Public courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can view courses" ON public.courses;

-- 3. Create the definitive public access policy
-- Allows SELECT for ANYONE (anon + authenticated) where is_published is TRUE
CREATE POLICY "Anyone can view published courses"
ON public.courses
FOR SELECT
USING (is_published = true);

-- 4. Grant usage on schema public to anon/authenticated (often missed)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 5. Grant select on courses table
GRANT SELECT ON public.courses TO anon, authenticated;

-- 6. Also ensure modules and lessons are visible for published courses
-- Modules
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view modules of published courses" ON public.modules;
CREATE POLICY "Anyone can view modules of published courses"
ON public.modules FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE id = public.modules.course_id
        AND is_published = true
    )
);
GRANT SELECT ON public.modules TO anon, authenticated;

-- Lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON public.lessons;
CREATE POLICY "Anyone can view lessons of published courses"
ON public.lessons FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.modules
        JOIN public.courses ON public.modules.course_id = public.courses.id
        WHERE public.modules.id = public.lessons.module_id
        AND public.courses.is_published = true
    )
);
GRANT SELECT ON public.lessons TO anon, authenticated;
