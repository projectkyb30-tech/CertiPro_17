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
      <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {module.title}
                </h3>
                <span className="text-sm text-gray-500 font-medium">
                  {module.lessons.length} {t('course.lessons')}
                </span>
              </div>
            </div>

            {/* Lessons Timeline */}
            <div className="ml-5 border-l-2 border-gray-200 dark:border-gray-800 pl-6 space-y-4 pb-4">
              {module.lessons.map((lesson) => {
                const Icon = getLessonIcon(lesson.type);
                
                // Use custom hook for logic
                const { isUnlocked, isCompleted } = getLessonStatus(course, lesson, isPreviousLessonCompleted);
                
                // Update tracker for next iteration
                isPreviousLessonCompleted = isCompleted;

                return (
                  <div key={lesson.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 
                      ${isCompleted ? 'bg-green-500 border-green-500' : 
                        isUnlocked ? 'bg-white dark:bg-[#1A1B1D] border-primary' : 
                        'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`} 
                    />

                    <button
                      onClick={() => isUnlocked && handleLessonClick()}
                      disabled={!isUnlocked}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200
                        ${!isUnlocked 
                          ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60' 
                          : isCompleted
                            ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900'
                            : 'bg-white dark:bg-[#1A1B1D] border-gray-200 dark:border-gray-800 shadow-sm active:scale-98'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                          <Icon size={16} />
                        </div>
                        {isCompleted ? (
                          <Check size={16} className="text-green-500" />
                        ) : !isUnlocked ? (
                          <Lock size={16} className="text-gray-400" />
                        ) : null}
                      </div>
                      
                      <h4 className={`font-semibold mb-1 ${isCompleted ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white'}`}>
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
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
