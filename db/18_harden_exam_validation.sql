-- ==========================================
-- EXAM VALIDATION HARDENING
-- ==========================================
-- Date: 05 Feb 2026
-- Description: 
-- 1. Updates 'start_exam_attempt' to enforce enrollment (cannot start exam for unpurchased course).
-- 2. Updates 'submit_exam' to prevent "Cross-Course Injection" attacks (submitting answers from other courses).
-- ==========================================

-- ---------------------------------------------------------
-- PART 1: SECURE START EXAM (Enrollment Check)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION start_exam_attempt(p_course_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_attempt_id UUID;
  v_started_at TIMESTAMP WITH TIME ZONE;
  v_is_enrolled BOOLEAN;
  v_duration_minutes INTEGER;
  v_expiry_time TIMESTAMP WITH TIME ZONE;
  v_existing RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Check Enrollment
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE user_id = v_user_id AND course_id = p_course_id
  ) INTO v_is_enrolled;

  IF NOT v_is_enrolled THEN
    RAISE EXCEPTION 'You are not enrolled in this course.';
  END IF;

  -- 2. Get duration
  SELECT time_limit_minutes INTO v_duration_minutes
  FROM public.exams
  WHERE course_id = p_course_id
  LIMIT 1;
  IF v_duration_minutes IS NULL THEN v_duration_minutes := 60; END IF;

  -- 3. Check existing uncompleted attempt and resume if valid
  SELECT id, started_at INTO v_existing
  FROM public.exam_attempts
  WHERE user_id = v_user_id AND course_id = p_course_id AND completed_at IS NULL
  ORDER BY started_at DESC
  LIMIT 1;

  IF v_existing.id IS NOT NULL THEN
    v_expiry_time := v_existing.started_at + (v_duration_minutes || ' minutes')::INTERVAL;
    IF now() < v_expiry_time THEN
      RETURN jsonb_build_object('id', v_existing.id, 'started_at', v_existing.started_at);
    ELSE
      UPDATE public.exam_attempts
      SET completed_at = now(), passed = FALSE, score = 0
      WHERE id = v_existing.id;
    END IF;
  END IF;

  -- 4. Create Attempt
  INSERT INTO public.exam_attempts (user_id, course_id, score, passed, started_at)
  VALUES (v_user_id, p_course_id, 0, FALSE, now())
  RETURNING id, started_at INTO v_attempt_id, v_started_at;

  RETURN jsonb_build_object('id', v_attempt_id, 'started_at', v_started_at);
END;
$$;

-- ---------------------------------------------------------
-- PART 2: SECURE SUBMIT EXAM (Cross-Course Validation)
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
    v_question_belongs_to_course BOOLEAN;
    
    -- Timing variables
    v_last_attempt_id UUID;
    v_started_at TIMESTAMP WITH TIME ZONE;
    v_duration_minutes INTEGER;
    v_allowed_duration INTERVAL;
    v_time_taken INTERVAL;
    v_buffer_time INTERVAL := '1 minute';
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

    -- 2. Get Exam Configuration (Duration & Passing Score)
    BEGIN
        SELECT time_limit_minutes, passing_score 
        INTO v_duration_minutes, v_exam_passing_score
        FROM public.exams
        WHERE course_id = p_course_id
        LIMIT 1;
    EXCEPTION WHEN undefined_table THEN
        v_duration_minutes := 60;
        v_exam_passing_score := 70;
    END;
    
    IF v_duration_minutes IS NULL THEN v_duration_minutes := 60; END IF;
    IF v_exam_passing_score IS NULL THEN v_exam_passing_score := 70; END IF;

    v_passing_threshold := v_exam_passing_score;

    -- 3. VALIDATE TIME
    v_allowed_duration := (v_duration_minutes || ' minutes')::INTERVAL + v_buffer_time;
    v_time_taken := now() - v_started_at;

    IF v_time_taken > v_allowed_duration THEN
        -- Mark as failed due to timeout
        UPDATE public.exam_attempts
        SET score = 0,
            passed = FALSE,
            completed_at = now()
        WHERE id = v_last_attempt_id;
        
        RAISE EXCEPTION 'Time Limit Exceeded. Exam automatically failed.';
    END IF;

    -- 4. Calculate Score Denominator (Total Questions in DB)
    SELECT COUNT(*) INTO v_total_course_questions
    FROM public.questions
    WHERE course_id = p_course_id;

    IF v_total_course_questions = 0 THEN
        v_total_course_questions := 1; 
    END IF;

    -- 5. Validate Answers (HARDENED)
    FOR v_question_id, v_answer_id IN SELECT * FROM jsonb_each_text(p_answers)
    LOOP
        -- SECURITY FIX: Verify question belongs to THIS course
        -- This prevents "Cross-Course Injection" attacks
        SELECT EXISTS (
            SELECT 1 FROM public.questions 
            WHERE id = v_question_id AND course_id = p_course_id
        ) INTO v_question_belongs_to_course;

        IF v_question_belongs_to_course THEN
            -- Only count if it's a valid question for this course
            SELECT is_correct INTO v_is_correct
            FROM public.question_answers
            WHERE id = v_answer_id AND question_id = v_question_id;
            
            IF v_is_correct THEN
                v_correct_count := v_correct_count + 1;
            END IF;
        END IF;
    END LOOP;

    -- 6. Calculate Result
    v_score := (v_correct_count::FLOAT / v_total_course_questions::FLOAT * 100)::INTEGER;
    v_passed := v_score >= v_passing_threshold;

    -- 7. Update the existing attempt
    UPDATE public.exam_attempts
    SET score = v_score,
        passed = v_passed,
        completed_at = now()
    WHERE id = v_last_attempt_id;

    -- 8. Auto-Complete Course if Passed
    IF v_passed THEN
        UPDATE public.enrollments
        SET is_completed = TRUE,
            completed_at = now(),
            progress_percent = 100
        WHERE user_id = v_user_id AND course_id = p_course_id;
    END IF;

    RETURN jsonb_build_object(
        'score', v_score,
        'passed', v_passed,
        'correct_count', v_correct_count,
        'total_questions', v_total_course_questions
    );
END;
$$;
