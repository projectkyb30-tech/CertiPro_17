import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
 
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle, ChevronRight, Check } from 'lucide-react';
import { ROUTES } from '../routes/paths';
import { examApi } from '../features/exams/api/examApi';
import { Question } from '../types';
import { SkeletonExamRunner } from '../shared/ui/Skeleton';

const ExamRunner: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> answerId
  const [courseId, setCourseId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch exam details and questions
  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;
      try {
        setLoading(true);
        const examData = await examApi.getExamMeta(examId);

        if (examData.courseId) {
          setCourseId(examData.courseId);
          // Start secure attempt server-side
          try {
            const attempt = await examApi.startExam(examData.courseId);
            
            // Calculate remaining time based on server start time
            const now = new Date();
            const startedAt = new Date(attempt.startedAt);
            const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
            const totalDurationSeconds = examData.timeLimitMinutes * 60;
            const remaining = totalDurationSeconds - elapsedSeconds;
            
            setTimeLeft(remaining > 0 ? remaining : 0);
            
          } catch (err) {
            console.error('Failed to start/resume exam attempt:', err);
            setError('Failed to initialize exam session.');
            return;
          }
        }

        // Fetch Questions securely
        try {
            const questions = await examApi.getExamQuestions(examId);
            if (questions.length === 0) {
                setError('No questions found for this exam configuration.');
            }
            setQuestions(questions);
        } catch (qErr) {
            console.error('Failed to load questions:', qErr);
            setError('Failed to load exam questions.');
        }
        
      } catch (err) {
        console.error('Error loading exam:', err);
        setError('Failed to load exam. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  const handleSubmit = useCallback(async () => {
    if (!courseId) return;
    setIsSubmitting(true);
    try {
      // Format answers for service
      const formattedAnswers = Object.entries(answers).map(([qId, aId]) => ({
        questionId: qId,
        answerId: aId
      }));

      await examApi.submitExam(courseId, formattedAnswers);

      navigate(ROUTES.EXAM_CENTER); // Or a results page
    } catch {
      setError('Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, courseId, navigate]);

  // Timer
  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, timeLeft, handleSubmit]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <SkeletonExamRunner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-[#1A1B1D]">
        <div className="text-center p-8 bg-white dark:bg-[#151618] rounded-xl shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white mb-4">{error}</p>
          <button onClick={() => navigate(ROUTES.EXAM_CENTER)} className="text-primary hover:underline">
            Back to Exam Center
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1A1B1D] flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-[#151618] border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Exam Session
            </h1>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-mono text-gray-600 dark:text-gray-400">
              <Clock size={16} />
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-[#151618] rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-8">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options?.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group
                      ${isSelected 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-gray-100 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50'
                      }
                    `}
                  >
                    <span className={`text-base ${isSelected ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                      {option.text}
                    </span>
                    {isSelected && (
                      <CheckCircle className="text-primary w-5 h-5" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Controls */}
      <footer className="bg-white dark:bg-[#151618] border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-green-600/20 transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Finish Exam'}
              <Check size={18} />
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-primary/25 transition-all"
            >
              Next Question
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ExamRunner;
