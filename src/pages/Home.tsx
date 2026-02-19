import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import DailyFocus from '../features/dashboard/components/DailyFocus';
import CourseCard from '../features/courses/components/CourseCard';
import { useUserStore } from '../store/useUserStore';
import { useCourseStore } from '../store/useCourseStore';
import Card, { CardHeader, CardTitle, CardContent } from '../shared/ui/Card';
import Button from '../shared/ui/Button';

const buildMonthMatrix = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const weeks: (number | null)[][] = [];
  let day = 1 - startOffset;

  while (day <= daysInMonth) {
    const week: (number | null)[] = [];
    for (let i = 0; i < 7; i++) {
      if (day < 1 || day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
      }
      day++;
    }
    weeks.push(week);
  }

  const monthLabel = date.toLocaleString('ro-RO', { month: 'long', year: 'numeric' });

  return { weeks, monthLabel, year, month };
};

const Home: React.FC = () => {
  const { courses, isLoading, error } = useCourseStore();
  const { user } = useUserStore();

  const purchasedCourses = courses.filter(
    (course) => !course.isLocked || course.isProcessing
  );

  const primaryCourse = purchasedCourses[0];
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const { weeks, monthLabel } = buildMonthMatrix(calendarDate);
  const today = new Date();

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
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-6 items-start"
      >
        <Card className="border-none bg-transparent shadow-none p-0 flex flex-col h-full">
          <CardHeader className="px-0 pt-0 pb-4 flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              Cursurile Tale
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-0 flex-1 flex flex-col">
            {isLoading ? (
              <div className="h-[240px] flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`skeleton-mini-${index}`}
                    className="flex-1 flex items-center justify-between rounded-2xl bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] px-4 py-4 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gray-200 dark:bg-gray-700" />
                      <div className="space-y-1">
                        <div className="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="h-2.5 w-40 rounded-full bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </div>
                    <div className="h-full flex flex-col items-end justify-center space-y-2">
                      <div className="h-3 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="h-2 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
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
              <div className="relative overflow-hidden rounded-3xl bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-5 shadow-sm flex-1 flex items-stretch">
                <div className="w-full h-full opacity-90 blur-[0.5px] pointer-events-none select-none flex flex-col gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex-1 flex items-center justify-between rounded-2xl bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] px-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)]" />
                        <div className="space-y-1">
                          <div className="h-3 w-32 rounded-full bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)]" />
                          <div className="h-2.5 w-40 rounded-full bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)]" />
                          <div className="h-2 w-24 rounded-full bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)]" />
                        </div>
                      </div>
                      <div className="h-full flex flex-col items-end justify-center space-y-2">
                        <div className="h-3 w-16 rounded-full bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)]" />
                        <div className="h-2 w-10 rounded-full bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)]" />
                        <div className="h-1.5 w-12 rounded-full bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)]" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute inset-0 grid place-items-center">
                  <div className="pointer-events-auto flex flex-col items-center text-center gap-4 px-6 py-5 max-w-sm mx-auto">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                      <Lock className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                        Cursurile tale sunt blocate momentan
                      </p>
                    </div>
                    <Button
                      variant="default"
                      size="md"
                      className="mt-1 rounded-full px-6"
                    >
                      Deblochează cursurile
                    </Button>
                  </div>
                </div>
              </div>
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

        <div className="space-y-6 flex flex-col h-full">
          <Card className="border-none bg-transparent shadow-none p-0">
            <CardHeader className="px-0 pt-0 pb-4 flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <div className="rounded-3xl bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                      Luna curentă
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                      {monthLabel}
                    </p>
                  </div>
                  <div className="inline-flex items-center rounded-full bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                      }
                      className="p-1.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                      }
                      className="p-1.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-1 text-[10px] font-medium text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                    {['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'].map((label) => (
                      <div key={label} className="flex items-center justify-center h-6">
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {weeks.map((week, wi) =>
                      week.map((day, di) => {
                        if (!day) {
                          return (
                            <div
                              key={`${wi}-${di}`}
                              className="h-8 flex items-center justify-center text-[var(--color-muted-foreground)]/40 dark:text-[var(--color-muted-foreground-dark)]/40"
                            />
                          );
                        }

                        const isToday =
                          day === today.getDate() &&
                          calendarDate.getMonth() === today.getMonth() &&
                          calendarDate.getFullYear() === today.getFullYear();

                        return (
                          <div
                            key={`${wi}-${di}`}
                            className={`h-8 flex items-center justify-center rounded-full text-xs cursor-default ${
                              isToday
                                ? 'bg-[var(--color-primary)] text-white font-semibold'
                                : 'text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-dark)]'
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <p className="mt-4 text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                  Integrarea cu calendarul tău va fi extinsă în versiunile următoare. Deocamdată, poți urmări progresul direct din cursuri și examene.
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
