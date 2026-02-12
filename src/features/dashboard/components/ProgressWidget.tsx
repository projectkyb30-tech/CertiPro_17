import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target } from 'lucide-react';
import { UserProfile } from '../../../types';

interface ProgressWidgetProps {
  user: UserProfile;
}

const ProgressWidget: React.FC<ProgressWidgetProps> = ({ user }) => {
  // Mock calculation for circular progress
  const totalProgress = 35; 
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalProgress / 100) * circumference;

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-100/50 dark:shadow-none flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Circular Progress */}
      <div className="relative flex-shrink-0">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100 dark:text-gray-700"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            className="text-primary drop-shadow-lg"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalProgress}%</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Streak</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{user.streak} Zile</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">XP Total</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{user.xp}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Lecții Azi</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{user.lessonsCompletedToday}/5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressWidget;
