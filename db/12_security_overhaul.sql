-- ==========================================
-- CERTIPRO SECURITY & ARCHITECTURE OVERHAUL
-- ==========================================
-- Data: 05 Feb 2026
-- Description: 
-- 1. Splits lessons table to secure content.
-- 2. Adds automated enrollment on purchase.
-- 3. Fixes Exam Scoring Logic.
-- ==========================================

-- ---------------------------------------------------------
-- PART 0: SCHEMA PREPARATION (Fix missing columns)
-- ---------------------------------------------------------
-- Ensure 'is_free' exists (Critical for RLS)
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE;

-- Ensure 'summary' exists (To replace content column)
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS summary TEXT;


-- ---------------------------------------------------------
-- PART 1: SECURE CONTENT (Split Table Strategy)
-- ---------------------------------------------------------

-- 1.1 Create the Secure Content Table
CREATE TABLE IF NOT EXISTS public.lesson_contents (
    lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE PRIMARY KEY,
    content TEXT, -- The actual Markdown/Video URL
    resources JSONB DEFAULT '[]'::jsonb, -- Additional secure resources
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.2 Enable RLS
ALTER TABLE public.lesson_contents ENABLE ROW LEVEL SECURITY;

-- 1.3 Migrate existing content (if any)
INSERT INTO public.lesson_contents (lesson_id, content)
SELECT id, content FROM public.lessons
WHERE content IS NOT NULL
ON CONFLICT (lesson_id) DO UPDATE SET content = EXCLUDED.content;

-- 1.4 Remove content from public lessons table (Security Hardening)
-- Update summary with a snippet if it's empty
UPDATE public.lessons 
SET summary = SUBSTRING(content, 1, 150) 
WHERE summary IS NULL AND content IS NOT NULL;

-- Drop content column to prevent leaks (OPTIONAL - Uncomment if ready to drop)
-- ALTER TABLE public.lessons DROP COLUMN IF EXISTS content;
-- For now, let's keep it but assume it might be dropped later. 
-- The application should now use lesson_contents for full content.

-- 1.5 RLS Policy for Lesson Contents
-- Allow access ONLY if:
-- 1. Lesson is marked as FREE in lessons table
-- 2. User is ENROLLED in the course
DROP POLICY IF EXISTS "Access Lesson Content" ON public.lesson_contents;

CREATE POLICY "Access Lesson Content" ON public.lesson_contents
FOR SELECT USING (
  -- Check 1: Is the lesson free?
  EXISTS (
    SELECT 1 FROM public.lessons l 
    WHERE l.id = lesson_contents.lesson_id 
    AND l.is_free = true
  )
  OR
  -- Check 2: Is user enrolled?
  EXISTS (
    SELECT 1 
    FROM public.enrollments e
    JOIN public.modules m ON m.course_id = e.course_id
    JOIN public.lessons l ON l.module_id = m.id
    WHERE l.id = lesson_contents.lesson_id
    AND e.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------
-- PART 2: AUTOMATED ENROLLMENT (Payment Trigger)
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_purchase() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if enrollment already exists
  IF NOT EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE user_id = NEW.user_id AND course_id = NEW.course_id
  ) THEN
    -- Create Enrollment
    INSERT INTO public.enrollments (user_id, course_id, enrolled_at, progress_percent, is_completed)
    VALUES (NEW.user_id, NEW.course_id, now(), 0, FALSE);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger
DROP TRIGGER IF EXISTS on_purchase_created ON public.user_purchases;
CREATE TRIGGER on_purchase_created
  AFTER INSERT ON public.user_purchases
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_purchase();


-- ---------------------------------------------------------
-- PART 3: ROBUST EXAM SCORING (Anti-Cheat)
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION submit_exam(
    p_course_id TEXT,
    p_answers JSONB -- Format: { "question_id": "answer_id", ... }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_course_questions INTEGER;
    v_correct_count INTEGER := 0;
    v_score INTEGER;
    v_passed BOOLEAN;
    v_passing_threshold INTEGER;
    v_exam_passing_score INTEGER;
    v_question_id UUID;
    v_answer_id UUID;
    v_is_correct BOOLEAN;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Calculate TOTAL questions available for this course (The Denominator)
    -- This prevents the "Answer 1 question correctly and get 100%" cheat.
    SELECT COUNT(*) INTO v_total_course_questions
    FROM public.questions
    WHERE course_id = p_course_id;

    IF v_total_course_questions = 0 THEN
        RAISE EXCEPTION 'Exam configuration error: No questions found for this course.';
    END IF;

    -- 2. Validate Answers
    FOR v_question_id, v_answer_id IN SELECT * FROM jsonb_each_text(p_answers)
    LOOP
        -- Check correctness
        SELECT is_correct INTO v_is_correct
        FROM public.question_answers
        WHERE id = v_answer_id AND question_id = v_question_id;
        
        IF v_is_correct THEN
            v_correct_count := v_correct_count + 1;
        END IF;
    END LOOP;

    v_score := (v_correct_count::FLOAT / v_total_course_questions::FLOAT * 100)::INTEGER;
    SELECT passing_score INTO v_exam_passing_score
    FROM public.exams
    WHERE course_id = p_course_id
    LIMIT 1;
    IF v_exam_passing_score IS NULL THEN
        v_exam_passing_score := 70;
    END IF;
    v_passing_threshold := v_exam_passing_score;
    v_passed := v_score >= v_passing_threshold;

    -- 4. Record Attempt
    INSERT INTO public.exam_attempts (user_id, course_id, score, passed)
    VALUES (v_user_id, p_course_id, v_score, v_passed);

    RETURN jsonb_build_object(
        'score', v_score,
        'passed', v_passed,
        'correct_count', v_correct_count,
        'total_questions', v_total_course_questions
    );
END;
$$;

-- ---------------------------------------------------------
-- PART 4: SECURE CONTENT FETCHING (RPC Helper)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION get_secure_lesson_content(p_lesson_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_content TEXT;
BEGIN
  -- Run as INVOKER so RLS on lesson_contents applies automatically
  SELECT content INTO v_content
  FROM public.lesson_contents
  WHERE lesson_id = p_lesson_id;
  
  RETURN v_content;
END;
$$;
