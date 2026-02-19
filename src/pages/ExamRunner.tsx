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
  const [isExamActive, setIsExamActive] = useState(false);

  // Navigation Guard: Prevent accidental exit
  useEffect(() => {
    if (loading || !isExamActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Standard for modern browsers
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [loading, isExamActive]);

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
            setIsExamActive(true);
            
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

      setIsExamActive(false);
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
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-[var(--color-background-dark)]">
        <div className="text-center p-8 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] rounded-xl shadow-lg border border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
          <AlertCircle className="w-12 h-12 text-[var(--color-destructive)] mx-auto mb-4" />
          <p className="text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] mb-4">{error}</p>
          <button onClick={() => navigate(ROUTES.EXAM_CENTER)} className="text-[var(--color-primary)] hover:underline">
            Back to Exam Center
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--color-background)] dark:bg-[var(--color-background-dark)] flex flex-col">
      {/* Header */}
      <header className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              Exam Session
            </h1>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] rounded-full text-sm font-mono text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              <Clock size={16} />
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-muted-foreground)]">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="w-32 h-2 bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--color-primary)] transition-all duration-300"
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
            className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] rounded-2xl p-6 sm:p-10 shadow-sm border border-[var(--color-border)] dark:border-[var(--color-border-dark)]"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] mb-8">
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
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 dark:bg-[var(--color-primary)]/10' 
                        : 'border-[var(--color-border)] dark:border-[var(--color-border-dark)] hover:border-[var(--color-primary)]/50 dark:hover:border-[var(--color-primary)]/50'
                      }
                    `}
                  >
                    <span className={`text-base ${isSelected ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]'}`}>
                      {option.text}
                    </span>
                    {isSelected && (
                      <CheckCircle className="text-[var(--color-primary)] w-5 h-5" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Controls */}
      <footer className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2.5 rounded-lg text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-[var(--color-destructive)] hover:bg-[var(--color-destructive-hover)] text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-[var(--color-destructive)]/20 transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Finish Exam'}
              <Check size={18} />
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-8 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-[var(--color-primary)]/25 transition-all"
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
