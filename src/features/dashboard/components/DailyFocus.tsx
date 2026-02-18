import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Award, Flag, GraduationCap } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import Skeleton from '../../../shared/ui/Skeleton';

const DailyFocus: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const { stats, loading } = useDashboardStats();

  const isLoading = loading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Certification Path Skeleton */}
        <div className="lg:col-span-2 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-6 rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="space-y-2">
              <Skeleton variant="text" width={200} height={24} />
              <Skeleton variant="text" width={150} height={16} />
            </div>
          </div>
          <div className="space-y-8">
             <div>
                <div className="flex justify-between mb-2">
                   <Skeleton variant="text" width={150} height={20} />
                   <Skeleton variant="text" width={40} height={20} />
                </div>
                <Skeleton variant="rounded" width="100%" height={16} />
             </div>
             <div>
                <div className="flex justify-between mb-2">
                   <Skeleton variant="text" width={150} height={20} />
                   <Skeleton variant="text" width={40} height={20} />
                </div>
                <Skeleton variant="rounded" width="100%" height={16} />
             </div>
          </div>
        </div>

        {/* Activity Skeleton */}
        <div className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-6 rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm flex flex-col">
           <div className="flex justify-between items-center mb-6">
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="rounded" width={80} height={32} />
           </div>
           <div className="flex-1 flex items-end gap-2 h-40">
              {[40, 75, 30, 90, 50, 65, 80].map((h, i) => (
                 <Skeleton key={i} variant="rounded" width="100%" height={`${h}%`} />
              ))}
           </div>
           <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between">
              <Skeleton variant="text" width={80} height={40} />
              <Skeleton variant="text" width={80} height={40} />
           </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const currentData = stats.activityData[timeframe];
  const currentStats = stats.stats[timeframe];

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8`}>
      {/* Certification Path Tracker (Takes up 2 columns) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-6 rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm relative overflow-hidden flex flex-col justify-center"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] text-lg">
              Drumul spre Certificare
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Nivel curent: <span className="font-semibold text-primary">{stats.level}</span>
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Progress to Next Exam */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                <Flag size={16} className="text-primary" />
                Următorul Examen: <span className="text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] font-bold">{stats.nextExam}</span>
              </div>
              <span className="text-sm font-bold text-primary">{stats.progressToExam}%</span>
            </div>
            <div className="h-4 bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] rounded-full overflow-hidden p-[2px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.progressToExam}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-primary rounded-full relative overflow-hidden"
              >
                {/* Shimmer Effect */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 h-full skew-x-12"
                />
              </motion.div>
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mt-2">
              Completează modulul curent pentru a debloca examenul.
            </p>
          </div>

          {/* Progress to Course Completion */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
                <GraduationCap size={16} className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]" />
                Finalizare Curs: <span className="text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] font-bold">{stats.courseName}</span>
              </div>
              <span className="text-sm font-bold text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">{stats.progressToCompletion}%</span>
            </div>
            <div className="h-4 bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] rounded-full overflow-hidden p-[2px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.progressToCompletion}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-[var(--color-muted-foreground)] dark:bg-[var(--color-muted-foreground-dark)] rounded-full relative overflow-hidden"
              >
                {/* Shimmer Effect */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 h-full skew-x-12"
                />
              </motion.div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Continuă să înveți pentru a obține certificarea.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Weekly Activity (Takes up 1 column) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-6 rounded-3xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">Activitate</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-lg text-xs font-medium">
              <TrendingUp size={12} />
              +12%
            </div>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] rounded-lg p-1">
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

        {/* Chart */}
        <div className="flex justify-between h-48 gap-2 mt-4">
          {currentData.map((item, index) => (
            <div key={`${timeframe}-${index}`} className="flex flex-col items-center justify-end gap-2 flex-1 h-full group">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: item.height }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`w-full rounded-t-lg relative ${
                  timeframe === 'week' && index === 6 ? 'bg-primary' : // Highlight Today
                  'bg-primary/40'
                }`}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {item.value} {timeframe === 'week' ? 'lecții' : timeframe === 'month' ? 'lecții' : 'lecții'}
                </div>
              </motion.div>
              <span className="text-[10px] font-medium text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-1">Total</p>
            <p className="text-xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              {currentStats.total}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-1">Frecvență</p>
            <p className="text-xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
              {currentStats.average}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DailyFocus;
