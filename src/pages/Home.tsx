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

  const purchasedCount = purchasedCourses.length;
  const lessonsToday = user?.lessonsCompletedToday ?? 0;
  const streak = user?.streak ?? 0;
  const level = Math.floor((user?.xp ?? 0) / 1000) + 1;

  return (
    <div className="space-y-8">
      {/* Hero: Greeting + Quick Stats */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)] gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-primary-dark text-white px-6 py-6 md:px-8 md:py-8 shadow-[0_18px_45px_rgba(0,102,255,0.35)]"
          >
            <div className="pointer-events-none absolute -right-24 -bottom-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                    Bun venit înapoi
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold leading-snug">
                    Salut, {user?.fullName || 'Student'}!
                  </h1>
                  <p className="text-sm md:text-base text-white/80 max-w-md">
                    Continuă să progresezi pas cu pas spre certificarea ta IT.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-black/15 px-4 py-2 text-xs font-semibold backdrop-blur">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    Level {level} • {lessonsToday} lecții azi
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="rounded-2xl bg-black/10 px-3 py-3 md:px-4 md:py-4 backdrop-blur">
                  <p className="text-[11px] md:text-xs font-medium text-white/70 mb-1">
                    Cursuri active
                  </p>
                  <p className="text-xl md:text-2xl font-bold leading-tight">
                    {purchasedCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/10 px-3 py-3 md:px-4 md:py-4 backdrop-blur">
                  <p className="text-[11px] md:text-xs font-medium text-white/70 mb-1">
                    Streak (zile)
                  </p>
                  <p className="text-xl md:text-2xl font-bold leading-tight">
                    {streak}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/10 px-3 py-3 md:px-4 md:py-4 backdrop-blur">
                  <p className="text-[11px] md:text-xs font-medium text-white/70 mb-1">
                    Lecții azi
                  </p>
                  <p className="text-xl md:text-2xl font-bold leading-tight">
                    {lessonsToday}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] px-6 py-6 md:px-7 md:py-7 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                Următorul pas
              </p>
              <p className="text-lg font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                Continuă de unde ai rămas în cursurile tale.
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                Deschide secțiunea „Lessons” pentru a vedea harta de învățare și următoarea lecție recomandată.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/lessons"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30 hover:bg-primary-dark transition-colors"
              >
                Deschide Lessons
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center rounded-xl bg-[var(--color-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] dark:bg-[var(--color-muted-dark)] dark:text-[var(--color-foreground-dark)] hover:bg-[var(--color-card)] dark:hover:bg-[var(--color-card-dark)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] transition-colors"
              >
                Vezi cursurile
              </Link>
            </div>
          </motion.div>
        </div>
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
