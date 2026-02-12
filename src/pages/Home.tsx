import React from 'react';
import { motion } from 'framer-motion';
import DailyFocus from '../features/dashboard/components/DailyFocus';
import CourseCard from '../features/courses/components/CourseCard';
import { useUserStore } from '../store/useUserStore';
import { useCourseStore } from '../store/useCourseStore';
import { SkeletonCard } from '../shared/ui/Skeleton';

const Home: React.FC = () => {
  const { courses, isLoading } = useCourseStore();
  const { user } = useUserStore();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
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

      {/* Daily Focus & Motivation (Replaces old Gamification Widget) */}
      <section id="daily-focus">
        <DailyFocus />
      </section>

      {/* Courses Grid */}
      <section id="courses-grid">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Cursurile Tale
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            // Skeleton Loading State
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <SkeletonCard />
              </motion.div>
            ))
          ) : (
            courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
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
