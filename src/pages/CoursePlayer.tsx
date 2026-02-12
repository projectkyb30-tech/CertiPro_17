import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseStore } from '../store/useCourseStore';
import { ROUTES } from '../routes/paths';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Menu, X, PlayCircle, CheckCircle, Circle } from 'lucide-react';
import { SkeletonPlayer } from '../shared/ui/Skeleton';

import { LessonRenderer } from '../features/courses/components/LessonRenderer';

const CoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { getCourse, completeLesson, fetchCourseDetails, fetchLessonContent, isLoading } = useCourseStore();
  const course = getCourse(courseId || '');
  
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch course details on mount
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails(courseId);
    }
  }, [courseId, fetchCourseDetails]);

  const currentModule = course?.modules?.[currentModuleIndex];
  const currentLesson = currentModule?.lessons?.[currentLessonIndex];

  // Fetch lesson content when lesson changes
  useEffect(() => {
    if (courseId && currentModule && currentLesson) {
      fetchLessonContent(courseId, currentModule.id, currentLesson.id);
    }
  }, [courseId, currentModule, currentLesson, fetchLessonContent]);

  // Default to first lesson if available
  useEffect(() => {
    if (course && course.modules && course.modules.length > 0) {
      // Logic to find first uncompleted lesson could go here
    }
  }, [course]);

  if (isLoading) {
    return <SkeletonPlayer />;
  }

  if (!course || !course.modules || course.modules.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-[#1A1B1D] text-gray-500">
        <div className="text-center p-6">
          <p className="mb-4">Cursul nu a fost găsit sau nu are conținut.</p>
          <button 
            onClick={() => navigate('/lessons')} 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Înapoi la Lecții
          </button>
        </div>
      </div>
    );
  }

  // Ensure currentModule exists before accessing lessons
  if (!currentModule) {
     return <div>Modul invalid.</div>;
  }
  
  const handleNextLesson = async () => {
    if (!course || !course.modules) return;

    // Mark current lesson as complete
    if (courseId && currentModule && currentLesson) {
      await completeLesson(courseId, currentModule.id, currentLesson.id);
    }

    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    } else if (currentModuleIndex < course.modules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
      setCurrentLessonIndex(0);
    } else {
      // Course completed logic
      navigate(ROUTES.HOME);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(prev => prev - 1);
      // Go to last lesson of previous module
      setCurrentLessonIndex(course.modules![currentModuleIndex - 1].lessons.length - 1);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#1A1B1D] overflow-hidden transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute inset-0 bg-black/50 z-20"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 320 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        className={`fixed md:relative z-30 h-full bg-gray-50 dark:bg-[#151618] border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 h-16">
          <button onClick={() => navigate(ROUTES.LESSONS)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
            <ChevronLeft size={16} />
            Înapoi la Hartă
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {course.modules.map((module, mIndex) => (
            <div key={module.id}>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                {module.title}
              </h3>
              <div className="space-y-1">
                {module.lessons.map((lesson, lIndex) => {
                  const isActive = mIndex === currentModuleIndex && lIndex === currentLessonIndex;
                  const isCompleted = lesson.isCompleted || false;

                  // Calculate if lesson should be unlocked based on previous completion
                  // This is a simplified check; ideally use the same hook as LearningMap
                  const isUnlocked = mIndex === 0 && lIndex === 0 ? true : isCompleted; 

                  return (
                    <button
                      key={lesson.id}
                      disabled={!isUnlocked && !isCompleted}
                      onClick={() => {
                        if (isUnlocked || isCompleted) {
                          setCurrentModuleIndex(mIndex);
                          setCurrentLessonIndex(lIndex);
                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all
                        ${isActive 
                          ? 'bg-white dark:bg-[#1A1B1D] text-primary shadow-sm border border-gray-100 dark:border-gray-800' 
                          : (!isUnlocked && !isCompleted)
                            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                      ) : isActive ? (
                        <PlayCircle size={16} className="text-primary shrink-0 animate-pulse" />
                      ) : (
                        <Circle size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
                      )}
                      
                      <span className={`truncate ${isActive ? 'font-medium' : ''}`}>
                        {lesson.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1A1B1D]">
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 bg-white/80 dark:bg-[#1A1B1D]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
              {currentLesson?.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Progress or Actions */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <span>{currentLesson?.duration}</span>
            </div>
          </div>
        </header>

        {/* Lesson Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <div className="prose dark:prose-invert max-w-none">
              {/* Content Placeholder */}
              <h2>{currentLesson?.title}</h2>
              
              {!currentLesson?.content && currentLesson?.type !== 'react' && currentLesson?.type !== 'presentation' ? (
                 <div className="flex flex-col items-center justify-center py-12 space-y-4">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                   <p className="text-gray-400 animate-pulse">Se încarcă conținutul securizat...</p>
                 </div>
              ) : (
                <div className="mt-6">
                  <LessonRenderer lesson={currentLesson} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="h-20 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151618] px-6 flex items-center justify-between shrink-0">
          <button 
            onClick={handlePrevLesson}
            disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Lecția Anterioară</span>
          </button>

          <button 
            onClick={handleNextLesson}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all transform active:scale-95"
          >
            <span className="hidden sm:inline">
              {(currentModuleIndex === course.modules!.length - 1 && currentLessonIndex === currentModule.lessons.length - 1)
                ? 'Finalizează Cursul' 
                : 'Lecția Următoare'}
            </span>
            <span className="sm:hidden">Următoarea</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </footer>
      </main>
    </div>
  );
};

export default CoursePlayer;
