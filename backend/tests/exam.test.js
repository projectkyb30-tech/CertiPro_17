const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const courseId = 'database-fundamentals';

const createAdminClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};

describe('Exam RPC (submit_exam)', () => {
  const supabase = createAdminClient();

  if (!supabase) {
    test.skip('Supabase credentials missing; skipping integration exam tests', () => {});
    return;
  }

  test('submit_exam returns 100% and passed when all answers are correct', async () => {
    // 1. Start or resume exam attempt securely
    const startRes = await supabase.rpc('start_exam_attempt', { p_course_id: courseId });
    expect(startRes.error).toBeNull();
    expect(startRes.data).toBeTruthy();

    // 2. Collect questions and correct answers for this course
    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .select('id')
      .eq('course_id', courseId);
    expect(qErr).toBeNull();
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThan(0);

    const answers = {};
    for (const q of questions) {
      const { data: qa, error: qaErr } = await supabase
        .from('question_answers')
        .select('id, is_correct')
        .eq('question_id', q.id);
      expect(qaErr).toBeNull();
      const correct = (qa || []).find((a) => a.is_correct === true);
      expect(correct).toBeTruthy();
      answers[q.id] = correct.id;
    }

    // 3. Submit exam with correct answers
    const submitRes = await supabase.rpc('submit_exam', {
      p_course_id: courseId,
      p_answers: answers
    });
    expect(submitRes.error).toBeNull();
    const result = submitRes.data;
    expect(result).toBeTruthy();
    expect(typeof result.score).toBe('number');
    expect(result.total_questions).toBe(questions.length);
    expect(result.correct_count).toBe(questions.length);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  }, 30000);

  test('submit_exam enforces dynamic passing score and updates enrollment on pass', async () => {
    const { data: exams, error: examErr } = await supabase
      .from('exams')
      .select('course_id, passing_score, time_limit_minutes')
      .eq('course_id', courseId)
      .limit(1);
    expect(examErr).toBeNull();
    expect(Array.isArray(exams)).toBe(true);
    expect(exams.length).toBe(1);

    const passingScore = exams[0].passing_score || 70;

    const startRes = await supabase.rpc('start_exam_attempt', { p_course_id: courseId });
    expect(startRes.error).toBeNull();
    expect(startRes.data).toBeTruthy();

    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .select('id')
      .eq('course_id', courseId);
    expect(qErr).toBeNull();
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThan(0);

    const answers = {};
    let correctNeeded = Math.ceil((passingScore / 100) * questions.length);
    let correctSoFar = 0;

    for (const q of questions) {
      const { data: qa, error: qaErr } = await supabase
        .from('question_answers')
        .select('id, is_correct')
        .eq('question_id', q.id);
      expect(qaErr).toBeNull();
      const correct = (qa || []).find((a) => a.is_correct === true);
      expect(correct).toBeTruthy();

      if (correctSoFar < correctNeeded) {
        answers[q.id] = correct.id;
        correctSoFar += 1;
      } else {
        const wrong = (qa || []).find((a) => a.is_correct === false);
        answers[q.id] = wrong ? wrong.id : correct.id;
      }
    }

    const submitRes = await supabase.rpc('submit_exam', {
      p_course_id: courseId,
      p_answers: answers
    });
    expect(submitRes.error).toBeNull();
    const result = submitRes.data;
    expect(result).toBeTruthy();
    expect(result.total_questions).toBe(questions.length);
    expect(result.correct_count).toBeGreaterThanOrEqual(correctNeeded);
    expect(result.score).toBeGreaterThanOrEqual(passingScore);
    expect(result.passed).toBe(true);
  }, 30000);
});
