import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle } from 'lucide-react';
import CourseCard from '../features/courses/components/CourseCard';
import { useCourseStore } from '../store/useCourseStore';
import { SkeletonCard } from '../shared/ui/Skeleton';

const Courses: React.FC = () => {
  const { courses, isLoading, error } = useCourseStore();

  const availableCourses = courses.filter(
    (course) => course.isLocked && !course.isProcessing
  );

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-medium text-primary">
          <BookOpen className="w-4 h-4" />
          <span>Catalog de cursuri CertiExpert</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
          Alege cursul potrivit pentru certificarea ta
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl">
          Aici vezi toate cursurile disponibile pentru achiziție. După plată, cursurile apar
          automat la „Cursurile Tale” pe pagina principală și în secțiunea de lecții.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Cursuri disponibile pentru achiziție
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={`courses-skeleton-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <SkeletonCard />
              </motion.div>
            ))
          ) : error ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="max-w-md w-full bg-white dark:bg-[#1A1B1D] border border-red-200 dark:border-red-800 rounded-2xl p-8 mx-4 text-center">
                <div className="flex justify-center mb-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Nu am putut încărca cursurile. Încearcă din nou mai târziu.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 break-all">
                  {error}
                </p>
              </div>
            </div>
          ) : availableCourses.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="max-w-md w-full bg-white dark:bg-[#1A1B1D] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 mx-4 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-primary">
                  <BookOpen className="w-7 h-7" />
                </div>
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Ai deja acces la toate cursurile disponibile.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Poți continua învățarea din „Cursurile Tale” sau din secțiunea Lecții.
                </p>
              </div>
            </div>
          ) : (
            availableCourses.map((course) => (
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

export default Courses;
