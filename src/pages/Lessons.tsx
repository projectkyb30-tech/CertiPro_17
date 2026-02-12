import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LearningMap from '../features/courses/components/LearningMap';
import { useCourseStore } from '../store/useCourseStore';
import { BookOpen, Lock, Loader2 } from 'lucide-react';
import Skeleton from '../shared/ui/Skeleton';

const Lessons: React.FC = () => {
  const { courses, isLoading } = useCourseStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const effectiveCourseId = selectedCourseId || courses[0]?.id || '';
  const selectedCourse = courses.find(c => c.id === effectiveCourseId);

  if (!selectedCourse && !isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        Nu sunt cursuri disponibile.
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BookOpen className="text-primary" />
              Plan de Învățare
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Urmărește progresul tău și deblochează noi cunoștințe pas cu pas.
            </p>
          </div>
        </div>

        {/* Course Selection Tabs */}
        <div id="course-tabs" className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={200} height={48} className="shrink-0" />
            ))
          ) : (
            courses.map((course) => (
              <button
                key={course.id}
                onClick={() => !course.isLocked && setSelectedCourseId(course.id)}
                disabled={course.isLocked}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all whitespace-nowrap
                  ${effectiveCourseId === course.id
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : course.isLocked
                      ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 border-gray-200 dark:border-gray-800 cursor-not-allowed opacity-70'
                      : 'bg-white dark:bg-[#1A1B1D] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-primary/50'
                  }
                `}
              >
                <span>{course.title}</span>
                {course.isProcessing ? (
                  <Loader2 size={14} className="text-primary animate-spin" />
                ) : course.isLocked && (
                  <Lock size={14} className="text-gray-400" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Learning Map Area */}
        <div id="learning-map" className="bg-gray-50/50 dark:bg-black/20 rounded-3xl p-3 md:p-12 min-h-[600px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-8 h-full min-h-[400px]">
               <Skeleton variant="text" width={200} height={32} />
               <Skeleton variant="text" width={300} height={20} />
               <div className="w-full max-w-2xl space-y-8 mt-8">
                 <div className="flex justify-center gap-8">
                   <Skeleton variant="circular" width={80} height={80} />
                 </div>
                 <div className="flex justify-between gap-8">
                    <Skeleton variant="circular" width={64} height={64} />
                    <Skeleton variant="circular" width={64} height={64} />
                 </div>
                 <div className="flex justify-center gap-8">
                   <Skeleton variant="circular" width={64} height={64} />
                 </div>
               </div>
            </div>
          ) : selectedCourse ? (
            <motion.div
              key={selectedCourseId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedCourse.title}
                </h2>
                <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto px-2">
                  {selectedCourse.description}
                </p>
              </div>

              <LearningMap course={selectedCourse} />
            </motion.div>
          ) : null}
        </div>
      </div>
  );
};

export default Lessons;
