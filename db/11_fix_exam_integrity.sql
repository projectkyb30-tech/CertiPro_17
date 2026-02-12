-- Fix Exam Integrity: Calculate score based on TOTAL questions in DB, not submitted answers
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
    v_passing_threshold INTEGER;
    v_exam_passing_score INTEGER;
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

    -- Get passing score from exams (0-100 percentage)
    SELECT passing_score INTO v_exam_passing_score
    FROM public.exams
    WHERE course_id = p_course_id
    LIMIT 1;
    IF v_exam_passing_score IS NULL THEN
        v_exam_passing_score := 70;
    END IF;
    v_passing_threshold := v_exam_passing_score;

    -- 1. Count TOTAL questions for this course (The Source of Truth)
    SELECT COUNT(*) INTO v_total_questions
    FROM public.questions
    WHERE course_id = p_course_id;

    IF v_total_questions = 0 THEN
        RAISE EXCEPTION 'Exam has no questions configured';
    END IF;
    
    -- 2. Validate Answers
    FOR v_question_id, v_answer_id IN SELECT * FROM jsonb_each_text(p_answers)
    LOOP
        -- Check if the selected answer is correct
        SELECT is_correct INTO v_is_correct
        FROM public.question_answers
        WHERE id = v_answer_id AND question_id = v_question_id;
        
        IF v_is_correct THEN
            v_correct_count := v_correct_count + 1;
        END IF;
    END LOOP;

    -- 3. Calculate Percentage (Correct / Total Questions * 100)
    -- This ensures that missing answers count as wrong.
    v_score := (v_correct_count::FLOAT / v_total_questions::FLOAT * 100)::INTEGER;
    v_passed := v_score >= v_passing_threshold;

    -- 4. Record the attempt
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
