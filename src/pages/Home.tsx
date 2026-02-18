import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DailyFocus from '../features/dashboard/components/DailyFocus';
import CourseCard from '../features/courses/components/CourseCard';
import { useUserStore } from '../store/useUserStore';
import { useCourseStore } from '../store/useCourseStore';
import { SkeletonCard } from '../shared/ui/Skeleton';
import { BookOpen } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../shared/ui/Card';

const Home: React.FC = () => {
  const { courses, isLoading, error } = useCourseStore();
  const { user } = useUserStore();

  const purchasedCourses = courses.filter(
    (course) => !course.isLocked || course.isProcessing
  );

  return (
    <div className="space-y-8 bg-dot-grid rounded-[var(--radius-xl)] p-2 md:p-3 lg:p-4">
      <section>
        <Card className="border-none bg-transparent shadow-none p-0">
          <CardHeader className="px-0 pt-0 space-y-2">
            <CardTitle className="text-3xl font-bold flex items-center gap-3 text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              Salut, {user?.fullName || 'Student'}!
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Continuă să înveți și să progresezi spre certificare.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section id="daily-focus">
        <DailyFocus />
      </section>

      <section id="courses-grid">
        <Card className="border-none bg-transparent shadow-none p-0">
          <CardHeader className="px-0 pt-0 pb-4 flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              Cursurile Tale
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-0">
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
                  <div className="max-w-md w-full bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border border-red-200 dark:border-red-800 rounded-[var(--radius-lg)] p-8 mx-4 text-center">
                    <p className="text-base font-medium text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                      Nu am putut încărca cursurile. Încearcă din nou mai târziu.
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mt-2 break-all">
                      {error}
                    </p>
                  </div>
                </div>
              ) : purchasedCourses.length === 0 ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="relative max-w-2xl w-full bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] rounded-[var(--radius-lg)] p-8 md:p-10 mx-4 overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                    <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div className="text-center md:text-left space-y-2 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                          Cursurile Tale
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                          Începe-ți drumul spre certificare cu primul curs premium.
                        </p>
                        <p className="text-sm md:text-base text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                          Alege un curs potrivit nivelului tău și urmărește progresul direct în acest tablou de bord.
                        </p>
                      </div>
                      <div className="relative">
                        <Link
                          to="/courses"
                          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-colors"
                        >
                          Vezi toate cursurile
                        </Link>
                      </div>
                    </div>
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
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Home;
