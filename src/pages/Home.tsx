import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DailyFocus from '../features/dashboard/components/DailyFocus';
import CourseCard from '../features/courses/components/CourseCard';
import { useUserStore } from '../store/useUserStore';
import { useCourseStore } from '../store/useCourseStore';
import { SkeletonCard } from '../shared/ui/Skeleton';
import { BookOpen } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../shared/ui/Card';

const Home: React.FC = () => {
  const { courses, isLoading, error } = useCourseStore();
  const { user } = useUserStore();

  const purchasedCourses = courses.filter(
    (course) => !course.isLocked || course.isProcessing
  );

  const purchasedCount = purchasedCourses.length;
  const lessonsToday = user?.lessonsCompletedToday ?? 0;
  const streak = user?.streak ?? 0;
  const level = Math.floor((user?.xp ?? 0) / 1000) + 1;

  return (
    <div className="space-y-8">
      {/* Header compact: Hello + progres scurt */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between rounded-3xl bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] px-5 py-4 md:px-6 md:py-5 border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm"
        >
          <div className="space-y-1">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Bun venit înapoi
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              Salut, {user?.fullName || 'Student'}!
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Level {level} • {purchasedCount} cursuri active
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] px-4 py-2 text-xs font-semibold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              Lecții azi: {lessonsToday}
            </span>
            <span className="text-[11px] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Streak: {streak} zile
            </span>
          </div>
        </motion.div>
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
