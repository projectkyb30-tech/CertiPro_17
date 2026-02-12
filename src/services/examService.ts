import { supabase } from './supabase';
import { Exam, ExamStatus, Question } from '../types';

type ExamRow = {
  id: string;
  course_id: string | null;
  title: string;
  description: string;
  total_questions: number;
  time_limit_minutes: number;
  passing_score: number;
  is_active: boolean;
};

type ExamAttemptRow = {
  exam_id: string;
  score: number;
  passed: boolean;
};

type EnrollmentRow = {
  course_id: string;
  is_completed: boolean;
  progress_percent: number;
};

type QuestionRow = {
  id: string;
  text: string;
  points: number;
};

type AnswerRow = {
  id: string;
  question_id: string;
  text: string;
};

export const examService = {
  /**
   * Fetches all available exams with user status
   */
  async getExams(): Promise<Exam[]> {
    try {
      // 1. Fetch all active exams
      // Note: Removed .eq('is_active', true) because the column might not exist in the remote DB yet.
      // We should rely on status or just filter in memory if needed.
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('*');

      if (examsError) throw examsError;
      if (!examsData) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return []; // Should handle no user better, but for now empty

      // 2. Fetch user attempts (best score)
      const { data: attempts } = await supabase
        .from('exam_attempts')
        .select('exam_id, score, passed')
        .eq('user_id', user.id)
        .order('score', { ascending: false }); // Get highest score first if multiple

      // Map attempts by exam_id
      const attemptMap = new Map<string, { score: number, passed: boolean }>();
      const attemptRows = (attempts || []) as ExamAttemptRow[];
      if (attemptRows.length) {
        attemptRows.forEach((a) => {
          if (!attemptMap.has(a.exam_id)) {
            attemptMap.set(a.exam_id, { score: a.score, passed: a.passed });
          }
        });
      }

      // 3. Fetch course completion status (to unlock exams)
      // An exam is unlocked if the related course is completed (progress >= 100 or is_completed = true)
      // OR if it has no course_id (general exam)
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id, is_completed, progress_percent')
        .eq('user_id', user.id);

      const completedCourses = new Set<string>();
      const enrollmentRows = (enrollments || []) as EnrollmentRow[];
      if (enrollmentRows.length) {
        enrollmentRows.forEach((e) => {
          if (e.is_completed || e.progress_percent >= 100) {
            completedCourses.add(e.course_id);
          }
        });
      }

      // 4. Map to frontend Exam interface
      const exams = (examsData || []) as ExamRow[];
      return exams.map((e) => {
        const attempt = attemptMap.get(e.id);
        const isCourseCompleted = e.course_id ? completedCourses.has(e.course_id) : true;
        
        // Determine status
        let status: ExamStatus = 'locked';
        if (attempt?.passed) {
          status = 'passed';
        } else if (attempt && !attempt.passed) {
          status = 'failed'; // Or 'pending' if we want to allow retries immediately
        } else if (isCourseCompleted) {
          status = 'pending'; // Ready to take
        }

        // Override: if unlocked but not attempted, it is 'pending' (unless we strictly mean 'pending' = started?)
        // Let's align with UI:
        // locked: cannot take
        // pending: can take (unlocked)
        // passed: passed
        // failed: failed

        return {
          id: e.id,
          courseId: e.course_id ?? '',
          title: e.title,
          description: e.description,
          questionsCount: e.total_questions,
          durationMinutes: e.time_limit_minutes,
          passingScore: e.passing_score,
          status: status,
          lastScore: attempt?.score || null,
          isUnlocked: isCourseCompleted || status === 'passed' || status === 'failed'
        };
      });

    } catch (error) {
      console.error('Error fetching exams:', error);
      return [];
    }
  },

  /**
   * Securely fetches exam questions.
   */
  async getExamQuestions(examId: string): Promise<Question[]> {
    // 1. Get Course ID from Exam
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('course_id')
      .eq('id', examId)
      .single();

    if (examError || !exam) throw new Error('Exam not found');

    // 2. Fetch Questions
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, text, points')
      .eq('course_id', exam.course_id);

    if (qError) throw qError;
    if (!questions) return [];

    // 3. Fetch Answers (Options) via Secure View
      const questionIds = (questions as QuestionRow[]).map((q) => q.id);
    const { data: answers, error: aError } = await supabase
      .from('exam_answers_public')
      .select('id, question_id, text')
      .in('question_id', questionIds)
      .order('order_index', { ascending: true });

    if (aError) throw aError;

    // 4. Map to Question Interface
    return (questions as QuestionRow[]).map((q) => {
        const qAnswers = ((answers || []) as AnswerRow[])
            .filter((a) => a.question_id === q.id)
            .map((a) => ({
                id: a.id,
                text: a.text
            }));
        
        return {
            id: q.id,
            text: q.text,
            points: q.points,
            type: 'single_choice', // Defaulting as DB lacks this column
            options: qAnswers
        };
    });
  },

  /**
   * Start an exam attempt (secure server-side tracking)
   * Returns the attempt ID and start time to allow resuming
   */
  async startExam(courseId: string): Promise<{ id: string, startedAt: string }> {
    const { data, error } = await supabase.rpc('start_exam_attempt', { p_course_id: courseId });
    if (error) {
      console.error('Failed to start exam attempt:', error);
      throw error;
    }
    // RPC now returns JSONB: { "id": "...", "started_at": "..." }
    return {
      id: data.id,
      startedAt: data.started_at
    };
  },

  /**
   * Submit exam answers
   * Returns the result calculated by the server function
   */
  async submitExam(courseId: string, answers: { questionId: string, answerId: string }[]): Promise<{ score: number, passed: boolean }> {
    // Transform array to map object for JSONB: { "question_id": "answer_id" }
    const answersMap = answers.reduce((acc, curr) => {
      acc[curr.questionId] = curr.answerId;
      return acc;
    }, {} as Record<string, string>);

    const { data, error } = await supabase.rpc('submit_exam', {
      p_course_id: courseId, // Matching SQL parameter p_course_id
      p_answers: answersMap  // Matching SQL parameter p_answers (JSONB)
    });

    if (error) throw error;
    
    return {
      score: data.score,
      passed: data.passed
    };
  }
};
