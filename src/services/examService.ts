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

      // 2. Fetch user attempts
      const { data: attempts } = await supabase
        .from('exam_attempts')
        .select('exam_id, score, passed, started_at')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      // Map attempts by exam_id (latest attempt)
      const latestAttemptMap = new Map<string, { score: number, passed: boolean, started_at: string }>();
      const attemptRows = (attempts || []) as (ExamAttemptRow & { started_at: string })[];
      if (attemptRows.length) {
        attemptRows.forEach((a) => {
          if (!latestAttemptMap.has(a.exam_id)) {
            latestAttemptMap.set(a.exam_id, { score: a.score, passed: a.passed, started_at: a.started_at });
          }
        });
      }

      // 3. Fetch course completion status
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
      const COOLDOWN_HOURS = 24;

      return exams.map((e) => {
        const latest = latestAttemptMap.get(e.id);
        const isCourseCompleted = e.course_id ? completedCourses.has(e.course_id) : true;
        
        // Cooldown logic
        let canRetry = true;
        let cooldownRemaining = 0;
        if (latest && !latest.passed) {
          const lastAttemptTime = new Date(latest.started_at).getTime();
          const now = new Date().getTime();
          const diff = now - lastAttemptTime;
          const cooldownMs = COOLDOWN_HOURS * 3600000;
          
          if (diff < cooldownMs) {
            canRetry = false;
            cooldownRemaining = Math.ceil((cooldownMs - diff) / 3600000);
          }
        }

        // Determine status
        let status: ExamStatus = 'locked';
        if (latest?.passed) {
          status = 'passed';
        } else if (latest && !latest.passed) {
          status = canRetry ? 'pending' : 'failed';
        } else if (isCourseCompleted) {
          status = 'pending';
        }

        return {
          id: e.id,
          courseId: e.course_id ?? '',
          title: e.title,
          description: e.description,
          questionsCount: e.total_questions,
          durationMinutes: e.time_limit_minutes,
          passingScore: e.passing_score,
          status: status,
          lastScore: latest?.score || null,
          isUnlocked: isCourseCompleted || status === 'passed' || status === 'failed',
          cooldownHours: !canRetry ? cooldownRemaining : null
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
    // 1. Get Course ID and Duration from Exam
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('course_id, time_limit_minutes')
      .eq('id', examId)
      .single();

    if (examError || !exam) throw new Error('Exam not found');

    const courseId = exam.course_id;

    // 2. CHECK FOR ACTIVE ATTEMPT
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: activeAttempt, error: attemptError } = await supabase
      .from('exam_attempts')
      .select('id, started_at')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (attemptError || !activeAttempt) {
      throw new Error('No active exam attempt found. Start the exam first.');
    }

    // 3. CHECK EXPIRY
    const duration = exam.time_limit_minutes || 60;
    const startedAt = new Date(activeAttempt.started_at);
    const now = new Date();
    const expiry = new Date(startedAt.getTime() + (duration + 1) * 60000); // +1 min buffer

    if (now > expiry) {
      throw new Error('Exam attempt expired.');
    }

    // 4. Fetch Questions
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, text, points')
      .eq('course_id', courseId);

    if (qError) throw qError;
    if (!questions) return [];

    // 5. Fetch Answers (Options) via Secure View
    const questionIds = (questions as QuestionRow[]).map((q) => q.id);
    const { data: answers, error: aError } = await supabase
      .from('exam_answers_public')
      .select('id, question_id, text')
      .in('question_id', questionIds)
      .order('order_index', { ascending: true });

    if (aError) throw aError;

    // 6. Map to Question Interface
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
        type: 'single_choice',
        options: qAnswers
      };
    });
  },

  /**
   * Fetch exam metadata (duration and course binding) via service
   */
  async getExamMeta(examId: string): Promise<{ timeLimitMinutes: number; courseId: string | null }> {
    const { data, error } = await supabase
      .from('exams')
      .select('time_limit_minutes, course_id')
      .eq('id', examId)
      .single();
    if (error) throw error;
    return {
      timeLimitMinutes: data.time_limit_minutes,
      courseId: data.course_id
    };
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
    // Guard: ensure course has questions to avoid zero-division or invalid scoring
    const { data: qCount, error: qCountError } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId);
    if (qCountError) throw qCountError;
    if ((qCount as unknown as number) === 0) {
      throw new Error('Exam not available: course has no questions defined');
    }

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
