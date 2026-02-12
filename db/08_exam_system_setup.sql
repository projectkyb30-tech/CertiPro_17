-- ==========================================
-- EXAM SYSTEM SCHEMA & SECURITY
-- ==========================================

-- 1. Create Tables
-- ------------------------------------------

-- Table: questions (Stores the exam questions)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id TEXT NOT NULL, -- Links to specific course (e.g., 'legislation-b')
    text TEXT NOT NULL, -- The question content
    points INTEGER DEFAULT 1, -- Score weight
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: question_answers (Stores options for each question)
-- CRITICAL SECURITY: Contains 'is_correct' flag which must NEVER be exposed to public SELECT
CREATE TABLE IF NOT EXISTS public.question_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL, -- The answer option text
    is_correct BOOLEAN DEFAULT false, -- SECRET FLAG
    order_index INTEGER DEFAULT 0 -- For ordering options (if not random)
);

-- Table: exam_attempts (Stores user results)
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Enable Row Level Security (RLS)
-- ------------------------------------------
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- ------------------------------------------

-- Questions: Only enrolled users can read questions
CREATE POLICY "Enrolled users can read questions" 
ON public.questions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = auth.uid()
    AND e.course_id = questions.course_id
  )
);

-- Answers: RESTRICTED Read
-- We ONLY allow reading the text and IDs, but we cannot filter columns via RLS directly.
-- Strategy: We will create a SECURITY DEFINER function or View to fetch answers WITHOUT is_correct.
-- For direct table access, we DENY everything to public to be safe, 
-- and only allow access via specific RPC functions or Views.
-- HOWEVER, for simplicity in fetching options, we can allow SELECT if we trust the frontend type, 
-- BUT Supabase exposes all columns. 
-- SECURE SOLUTION: create a VIEW for public consumption.

-- 3.1 Secure View for Answers (Excludes is_correct)
CREATE OR REPLACE VIEW public.exam_answers_public AS
SELECT id, question_id, text, order_index
FROM public.question_answers;

-- Grant access to the view
GRANT SELECT ON public.exam_answers_public TO authenticated;

-- Deny direct access to the raw table for anon/authenticated (implicitly denied by default RLS if no policy exists)
-- We do NOT create a SELECT policy for public.question_answers.

-- Exam Attempts: Users see only their own history
CREATE POLICY "Users can view own exam attempts" 
ON public.exam_attempts FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Server-Side Evaluation Function (RPC)
-- ------------------------------------------
-- This function receives the user's answers, calculates the score securely on the server,
-- and records the attempt. The user NEVER sees the correct answers key.

CREATE OR REPLACE FUNCTION submit_exam(
    p_course_id TEXT,
    p_answers JSONB -- Format: { "question_id": "answer_id", ... }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to read is_correct
AS $$
DECLARE
    v_total_questions INTEGER;
    v_correct_count INTEGER := 0;
    v_score INTEGER;
    v_passed BOOLEAN;
    v_passing_threshold INTEGER := 80; -- 80% to pass
    v_question_id UUID;
    v_answer_id UUID;
    v_is_correct BOOLEAN;
    v_user_id UUID;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Count total questions for this course to calculate percentage
    -- (Assuming the exam consists of ALL questions for the course, or we pass a specific set)
    -- For this MVP, we count the questions submitted in the answers JSON to determine the denominator,
    -- OR we count all questions available for the course.
    -- Let's use the count of answers submitted as the base for now (assuming frontend sends all).
    
    -- Better approach: Calculate score based on the questions provided in the answer set
    v_total_questions := 0;
    
    FOR v_question_id, v_answer_id IN SELECT * FROM jsonb_each_text(p_answers)
    LOOP
        v_total_questions := v_total_questions + 1;
        
        -- Check if the selected answer is correct
        SELECT is_correct INTO v_is_correct
        FROM public.question_answers
        WHERE id = v_answer_id AND question_id = v_question_id;
        
        IF v_is_correct THEN
            v_correct_count := v_correct_count + 1;
        END IF;
    END LOOP;

    IF v_total_questions = 0 THEN
        RAISE EXCEPTION 'No answers provided';
    END IF;

    -- Calculate Percentage
    v_score := (v_correct_count::FLOAT / v_total_questions::FLOAT * 100)::INTEGER;
    v_passed := v_score >= v_passing_threshold;

    -- Record the attempt
    INSERT INTO public.exam_attempts (user_id, course_id, score, passed)
    VALUES (v_user_id, p_course_id, v_score, v_passed);

    -- Return result
    RETURN jsonb_build_object(
        'score', v_score,
        'passed', v_passed,
        'correct_count', v_correct_count,
        'total_questions', v_total_questions
    );
END;
$$;
