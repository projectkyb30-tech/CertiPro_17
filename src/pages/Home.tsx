import React from 'react';
import { motion } from 'framer-motion';
import DailyFocus from '../features/dashboard/components/DailyFocus';
import CourseCard from '../features/courses/components/CourseCard';
import { useUserStore } from '../store/useUserStore';
import { useCourseStore } from '../store/useCourseStore';
import { SkeletonCard } from '../shared/ui/Skeleton';
import { BookOpen } from 'lucide-react';

const Home: React.FC = () => {
  const { courses, isLoading, error } = useCourseStore();
  const { user } = useUserStore();

  const purchasedCourses = courses.filter(
    (course) => !course.isLocked || course.isProcessing
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            Salut, {user?.fullName || 'Student'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Continuă să înveți și să progresezi spre certificare.
          </p>
        </div>
      </div>

      <section id="daily-focus">
        <DailyFocus />
      </section>

      <section id="courses-grid">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Cursurile Tale
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <SkeletonCard />
              </motion.div>
            ))
          ) : error ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="max-w-md w-full bg-white dark:bg-[#1A1B1D] border border-red-200 dark:border-red-800 rounded-2xl p-8 mx-4 text-center">
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Nu am putut încărca cursurile. Încearcă din nou mai târziu.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 break-all">
                  {error}
                </p>
              </div>
            </div>
          ) : purchasedCourses.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="max-w-md w-full bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 mx-4 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-primary">
                  <BookOpen className="w-7 h-7" />
                </div>
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Nu ai încă niciun curs cumpărat. Vezi pagina Courses pentru a începe.
                </p>
              </div>
            </div>
          ) : (
            purchasedCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
