import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../routes/paths';
import { Course } from '../../../types';
import { Check, Lock, FileText, Code, HelpCircle, MonitorPlay, Presentation } from 'lucide-react';
import { getLessonStatus } from '../hooks/useLessonStatus';

interface LearningMapProps {
  course: Course;
}

const LearningMap: React.FC<LearningMapProps> = ({ course }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLessonClick = () => {
    navigate(`${ROUTES.COURSE_PLAYER}/${course.id}`);
  };

  // Helper to determine icon based on lesson type
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'code': return Code;
      case 'quiz': return HelpCircle;
      case 'react': return MonitorPlay;
      case 'presentation': return Presentation;
      default: return FileText;
    }
  };

  // Track global completion flow
  let isPreviousLessonCompleted = true;

  if (!course.modules || course.modules.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] rounded-2xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
        <p className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
          {t('course.locked')} {/* Fallback message if no lessons */}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* --- MOBILE/DESKTOP VIEW (Unified List) --- */}
      <div className="space-y-8">
        {course.modules?.map((module, moduleIndex) => (
          <div key={module.id} className="relative">
            {/* Module Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">
                {moduleIndex + 1}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] leading-tight">
                  {module.title}
                </h3>
                <span className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] font-medium">
                  {module.lessons.length} {t('course.lessons')}
                </span>
              </div>
            </div>

            {/* Lessons Timeline */}
            <div className="ml-5 border-l-2 border-[var(--color-border)] dark:border-[var(--color-border-dark)] pl-6 space-y-4 pb-4">
              {module.lessons.map((lesson) => {
                const Icon = getLessonIcon(lesson.type);
                
                // Use custom hook for logic
                const { isUnlocked, isCompleted } = getLessonStatus(course, lesson, isPreviousLessonCompleted);
                
                // Update tracker for next iteration
                isPreviousLessonCompleted = isCompleted;

                return (
                  <div key={lesson.id} className="relative">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 
                      ${
                        isCompleted
                          ? 'bg-green-500 border-green-500'
                          : isUnlocked
                          ? 'bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-primary'
                          : 'bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] border-[var(--color-border)] dark:border-[var(--color-border-dark)]'
                      }`} 
                    />

                    <button
                      onClick={() => isUnlocked && handleLessonClick()}
                      disabled={!isUnlocked}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200
                        ${
                          !isUnlocked
                            ? 'bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] border-[var(--color-border)] dark:border-[var(--color-border-dark)] opacity-60'
                            : isCompleted
                            ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900'
                            : 'bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm active:scale-98'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            isCompleted
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                              : 'bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        {isCompleted ? (
                          <Check size={16} className="text-green-500" />
                        ) : !isUnlocked ? (
                          <Lock size={16} className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]" />
                        ) : null}
                      </div>
                      
                      <h4
                        className={`font-semibold mb-1 ${
                          isCompleted
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]'
                        }`}
                      >
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] flex items-center gap-2">
                        {lesson.duration}
                        {!isUnlocked && (
                          <span className="text-red-400 flex items-center gap-1">
                            • {t('lesson.locked_message')}
                          </span>
                        )}
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningMap;
