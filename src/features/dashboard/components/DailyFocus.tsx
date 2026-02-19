import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, GraduationCap } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import Skeleton from '../../../shared/ui/Skeleton';

const DailyFocus: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const { stats, loading } = useDashboardStats();

  const isLoading = loading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-2 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-6 rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="rounded" width={80} height={32} />
          </div>
          <div className="flex-1 flex items-end gap-2 h-40">
            {[40, 75, 30, 90, 50, 65, 80].map((h, i) => (
              <Skeleton key={i} variant="rounded" width="100%" height={`${h}%`} />
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex justify-between">
            <Skeleton variant="text" width={80} height={40} />
            <Skeleton variant="text" width={80} height={40} />
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 gap-6">
          <div className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-6 rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton variant="text" width={140} height={20} />
              <Skeleton variant="text" width={80} height={32} />
            </div>
            <Skeleton variant="circular" width={64} height={64} />
          </div>
          <div className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-6 rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={60} height={28} />
            </div>
            <Skeleton variant="circular" width={56} height={56} />
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const currentData = stats.activityData[timeframe];
  const currentStats = stats.stats[timeframe];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-6 rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                  Activitate
                </h3>
                <p className="text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                  Evoluția lecțiilor în timp
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-lg text-xs font-medium">
              <TrendingUp size={12} />
              +12%
            </div>
          </div>

          <div className="flex bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] rounded-lg p-1 max-w-xs">
            {(['week', 'month', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                  timeframe === t
                    ? 'bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] shadow-sm'
                    : 'text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] hover:text-[var(--color-foreground)] dark:hover:text-[var(--color-foreground-dark)]'
                }`}
              >
                {t === 'week' ? '7 Zile' : t === 'month' ? 'Lună' : 'Total'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between h-48 gap-2 mt-4">
          {currentData.map((item, index) => (
            <div
              key={`${timeframe}-${index}`}
              className="flex flex-col items-center justify-end gap-2 flex-1 h-full group"
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: item.height }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`w-full rounded-t-lg relative ${
                  timeframe === 'week' && index === 6 ? 'bg-primary' : 'bg-primary/40'
                }`}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {item.value} lecții
                </div>
              </motion.div>
              <span className="text-[10px] font-medium text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-1">
              Total
            </p>
            <p className="text-xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              {currentStats.total}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-1">
              Frecvență
            </p>
            <p className="text-xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              {currentStats.average}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-6 rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm flex items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Curs în derulare
            </p>
            <h3 className="text-lg font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              {stats.courseName}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Nivel: <span className="font-semibold text-primary">{stats.level}</span>
            </p>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-[6px] border-primary/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-[6px] border-primary border-t-transparent rotate-45" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                {stats.progressToCompletion}%
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-6 rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm flex items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Pregătire examen
            </p>
            <h3 className="text-lg font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              {stats.nextExam}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Următorul pas în drumul tău spre certificare.
            </p>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-[5px] border-primary/10 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-[5px] border-primary rotate-90" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                {stats.progressToExam}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyFocus;
