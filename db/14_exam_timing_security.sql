-- ==========================================
-- EXAM SECURITY & TIMING OVERHAUL
-- ==========================================
-- Date: 05 Feb 2026
-- Description: 
-- 1. Adds server-side timing tracking to prevent infinite-time cheats.
-- 2. Creates secure RPC for starting exams (with RESUME capability).
-- 3. Updates submission logic to enforce time limits.
-- ==========================================

-- ---------------------------------------------------------
-- PART 1: ADD TIMING COLUMN
-- ---------------------------------------------------------
ALTER TABLE public.exam_attempts 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- ---------------------------------------------------------
-- PART 2: START EXAM RPC (SECURE & RESUMABLE)
-- ---------------------------------------------------------
-- Atomically creates an attempt OR resumes an existing valid one.
-- Returns JSONB: { "id": "uuid", "started_at": "timestamp" }
CREATE OR REPLACE FUNCTION start_exam_attempt(p_course_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_attempt_id UUID;
  v_started_at TIMESTAMP WITH TIME ZONE;
  v_duration_minutes INTEGER;
  v_expiry_time TIMESTAMP WITH TIME ZONE;
  v_existing_attempt RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Get Exam Duration
  BEGIN
    SELECT time_limit_minutes INTO v_duration_minutes
    FROM public.exams
    WHERE course_id = p_course_id
    LIMIT 1;
  EXCEPTION WHEN undefined_table THEN
    v_duration_minutes := 60;
  END;

  IF v_duration_minutes IS NULL THEN
    v_duration_minutes := 60;
  END IF;

  -- 2. Check for Active Attempt (Not completed)
  SELECT id, started_at INTO v_existing_attempt
  FROM public.exam_attempts
  WHERE user_id = v_user_id 
    AND course_id = p_course_id 
    AND completed_at IS NULL -- Only check open attempts
  ORDER BY started_at DESC
  LIMIT 1;

  IF v_existing_attempt.id IS NOT NULL THEN
    -- Check if it is expired
    v_expiry_time := v_existing_attempt.started_at + (v_duration_minutes || ' minutes')::INTERVAL;
    
    IF now() < v_expiry_time THEN
      -- RESUME: It is still valid. Return existing ID and start time.
      RETURN jsonb_build_object(
        'id', v_existing_attempt.id,
        'started_at', v_existing_attempt.started_at
      );
    ELSE
      -- EXPIRED: Close it and allow new one.
      UPDATE public.exam_attempts
      SET completed_at = now(), passed = false, score = 0
      WHERE id = v_existing_attempt.id;
    END IF;
  END IF;

  -- 3. Create New Attempt (If no active valid attempt exists)
  INSERT INTO public.exam_attempts (user_id, course_id, score, passed, started_at)
  VALUES (v_user_id, p_course_id, 0, FALSE, now())
  RETURNING id, started_at INTO v_attempt_id, v_started_at;

  RETURN jsonb_build_object(
    'id', v_attempt_id,
    'started_at', v_started_at
  );
END;
$$;

-- ---------------------------------------------------------
-- PART 3: UPDATE SUBMIT EXAM (Time Enforcement)
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
    
    -- Timing variables
    v_last_attempt_id UUID;
    v_started_at TIMESTAMP WITH TIME ZONE;
    v_duration_minutes INTEGER;
    v_allowed_duration INTERVAL;
    v_time_taken INTERVAL;
    v_buffer_time INTERVAL := '1 minute'; -- Allow 1 min grace for network latency
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Get the latest attempt for this user/course
    SELECT id, started_at INTO v_last_attempt_id, v_started_at
    FROM public.exam_attempts
    WHERE user_id = v_user_id AND course_id = p_course_id
    ORDER BY started_at DESC
    LIMIT 1;

    IF v_last_attempt_id IS NULL THEN
        RAISE EXCEPTION 'No active exam attempt found. You must start the exam first.';
    END IF;

    -- 2. Get Exam Duration Config
    BEGIN
        SELECT time_limit_minutes INTO v_duration_minutes
        FROM public.exams
        WHERE course_id = p_course_id
        LIMIT 1;
    EXCEPTION WHEN undefined_table THEN
        v_duration_minutes := 60;
    END;
    
    IF v_duration_minutes IS NULL THEN
        v_duration_minutes := 60;
    END IF;

    -- 3. VALIDATE TIME
    v_allowed_duration := (v_duration_minutes || ' minutes')::INTERVAL + v_buffer_time;
    v_time_taken := now() - v_started_at;

    IF v_time_taken > v_allowed_duration THEN
        -- Fail due to timeout
        UPDATE public.exam_attempts
        SET score = 0, passed = false, completed_at = now()
        WHERE id = v_last_attempt_id;
        
        RAISE EXCEPTION 'Time Limit Exceeded. Exam automatically failed.';
    END IF;

    -- 4. Calculate Score (The Denominator)
    SELECT COUNT(*) INTO v_total_course_questions
    FROM public.questions
    WHERE course_id = p_course_id;

    IF v_total_course_questions = 0 THEN
        v_total_course_questions := 1; 
    END IF;

    -- 5. Validate Answers
    FOR v_question_id, v_answer_id IN SELECT * FROM jsonb_each_text(p_answers)
    LOOP
        SELECT is_correct INTO v_is_correct
        FROM public.question_answers
        WHERE id = v_answer_id AND question_id = v_question_id;
        
        IF v_is_correct THEN
            v_correct_count := v_correct_count + 1;
        END IF;
    END LOOP;

    -- 6. Calculate Result
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

    -- 7. Update the existing attempt
    UPDATE public.exam_attempts
    SET score = v_score,
        passed = v_passed,
        completed_at = now()
    WHERE id = v_last_attempt_id;

    RETURN jsonb_build_object(
        'score', v_score,
        'passed', v_passed,
        'correct_count', v_correct_count,
        'total_questions', v_total_course_questions
    );
END;
$$;
