import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import DailyFocus from '../features/dashboard/components/DailyFocus';
import CourseCard from '../features/courses/components/CourseCard';
import { useUserStore } from '../store/useUserStore';
import { useCourseStore } from '../store/useCourseStore';
import { SkeletonCard } from '../shared/ui/Skeleton';
import Card, { CardHeader, CardTitle, CardContent } from '../shared/ui/Card';
import EmptyCoursesHero from '../features/dashboard/components/EmptyCoursesHero';
import Button from '../shared/ui/Button';

const Home: React.FC = () => {
  const { courses, isLoading, error } = useCourseStore();
  const { user } = useUserStore();

  const purchasedCourses = courses.filter(
    (course) => !course.isLocked || course.isProcessing
  );

  const primaryCourse = purchasedCourses[0];

  return (
    <div className="space-y-8">
      <section>
        <div className="w-full rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] px-4 py-4 md:px-6 md:py-5 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              Salut, {user?.fullName || 'Student'}!
            </h1>
            <p className="mt-2 text-sm md:text-base text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Continuă să înveți și să progresezi spre certificare.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-end md:gap-4">
            <div className="w-full md:w-72">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Caută cursuri, examene sau lecții"
                  className="w-full h-10 rounded-full bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] px-4 pr-10 text-sm text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] placeholder:text-[var(--color-muted-foreground)] dark:placeholder:text-[var(--color-muted-foreground-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                  <Search className="w-4 h-4" />
                </span>
              </div>
            </div>

            <Button
              variant="default"
              size="md"
              className="rounded-full px-5"
            >
              Vezi toate cursurile
            </Button>
          </div>
        </div>
      </section>

      <section id="daily-focus">
        <DailyFocus />
      </section>

      <section
        id="dashboard-main"
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-6"
      >
        <Card className="border-none bg-transparent shadow-none p-0">
          <CardHeader className="px-0 pt-0 pb-4 flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              Cursurile Tale
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <SkeletonCard />
                  </motion.div>
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
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
              <EmptyCoursesHero />
            ) : (
              <div className="space-y-3">
                {purchasedCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CourseCard course={course} />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none bg-transparent shadow-none p-0">
            <CardHeader className="px-0 pt-0 pb-4 flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <div className="rounded-3xl bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-5 shadow-sm">
                <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                  Integrarea cu calendarul tău va fi disponibilă în curând. Până atunci, poți urmări progresul direct din cursuri și examene.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-transparent shadow-none p-0">
            <CardHeader className="px-0 pt-0 pb-4 flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                Lecția de astăzi
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <div className="rounded-3xl bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-5 shadow-sm">
                {primaryCourse ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                      Curs recomandat
                    </p>
                    <p className="text-base font-semibold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                      {primaryCourse.title}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                      Continuă de unde ai rămas și finalizează lecția următoare astăzi.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                    Încă nu ai cursuri active. Alege un curs și prima lecție va apărea aici.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
