import { examService } from '../../../services/examService';

export const examApi = {
  getExams: examService.getExams,
  getExamQuestions: examService.getExamQuestions,
  startExam: examService.startExam,
  submitExam: examService.submitExam,
  getExamMeta: examService.getExamMeta
};
