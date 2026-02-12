import { supabase } from '../../../services/supabase';
import { examService } from '../../../services/examService';

export const examApi = {
  getExams: examService.getExams,
  getExamQuestions: examService.getExamQuestions,
  startExam: examService.startExam,
  submitExam: examService.submitExam,
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
  }
};
