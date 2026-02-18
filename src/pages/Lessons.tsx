import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LearningMap from '../features/courses/components/LearningMap';
import { useCourseStore } from '../store/useCourseStore';
import { BookOpen, Lock, Loader2 } from 'lucide-react';
import Skeleton from '../shared/ui/Skeleton';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../shared/ui/Card';

const Lessons: React.FC = () => {
  const { courses, isLoading } = useCourseStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const effectiveCourseId = selectedCourseId || courses[0]?.id || '';
  const selectedCourse = courses.find(c => c.id === effectiveCourseId);

  return (
    <div className="space-y-8">
      <section>
        <Card className="border-none bg-transparent shadow-none p-0">
          <CardHeader className="px-0 pt-0 space-y-2">
            <CardTitle className="text-3xl font-bold flex items-center gap-3 text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              <BookOpen className="text-primary" />
              Plan de Învățare
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Urmărește progresul tău și deblochează noi cunoștințe pas cu pas.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section>
        <Card className="border-none bg-transparent shadow-none p-0">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-sm font-semibold text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Cursurile tale
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <div id="course-tabs" className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    width={200}
                    height={48}
                    className="shrink-0"
                  />
                ))
              ) : !courses.length ? (
                <div className="min-h-[120px] flex items-center justify-center text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                  Nu sunt cursuri disponibile.
                </div>
              ) : (
                courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => !course.isLocked && setSelectedCourseId(course.id)}
                    disabled={course.isLocked}
                    className={`flex items-center gap-3 px-6 py-3 rounded-[var(--radius)] border text-sm font-medium transition-all whitespace-nowrap
                      ${
                        effectiveCourseId === course.id
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                          : course.isLocked
                          ? 'bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] border-[var(--color-border)] dark:border-[var(--color-border-dark)] cursor-not-allowed opacity-70'
                          : 'bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] border-[var(--color-border)] dark:border-[var(--color-border-dark)] hover:border-primary/50'
                      }
                    `}
                  >
                    <span>{course.title}</span>
                    {course.isProcessing ? (
                      <Loader2 size={14} className="text-primary animate-spin" />
                    ) : course.isLocked ? (
                      <Lock size={14} className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]" />
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
          <CardContent className="p-3 md:p-8">
            <div id="learning-map" className="rounded-2xl min-h-[400px]">
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
                  key={effectiveCourseId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-xl md:text-2xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] mb-2">
                      {selectedCourse.title}
                    </h2>
                    <p className="text-sm md:text-base text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] max-w-2xl mx-auto px-2">
                      {selectedCourse.description}
                    </p>
                  </div>

                  <LearningMap course={selectedCourse} />
                </motion.div>
              ) : (
                <div className="flex items-center justify-center min-h-[200px] text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                  Selectează un curs pentru a vedea harta de învățare.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Lessons;
