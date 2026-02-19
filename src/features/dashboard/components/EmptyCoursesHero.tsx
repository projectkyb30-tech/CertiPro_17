import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes/paths';
import '../../../styles/emptyCoursesHero.css';

export const getEmptyCoursesHeroMotionProps = (prefersReducedMotion: boolean) =>
  prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 },
      };

const LockIcon: React.FC = () => (
  <svg
    className="w-12 h-12 text-gray-400 lock-pulse"
    viewBox="0 0 48 48"
    role="img"
    aria-labelledby="empty-courses-lock-title"
  >
    <title id="empty-courses-lock-title">Lacăt care indică lipsa cursurilor achiziționate</title>
    <rect x="14" y="22" width="20" height="16" rx="4" fill="currentColor" />
    <path
      d="M18 22v-3a6 6 0 0 1 12 0v3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="29" r="2" fill="#E5E7EB" />
  </svg>
);

const EmptyCoursesHero: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const motionProps = getEmptyCoursesHeroMotionProps(prefersReducedMotion);

  return (
    <motion.section
      {...motionProps}
      className="relative overflow-hidden rounded-xl empty-courses-hero border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm"
      aria-labelledby="empty-courses-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50 blur-[2px] empty-courses-hero-skeleton"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center text-center gap-4 md:gap-6 px-4 py-4 md:px-6 md:py-6">
        <LockIcon />

        <div className="space-y-2 max-w-xl">
          <h3
            id="empty-courses-heading"
            className="text-lg font-semibold text-gray-900 dark:text-[var(--color-foreground-dark)]"
          >
            Începe-ți drumul spre certificare
          </h3>
          <p className="text-sm font-normal text-gray-600 dark:text-[var(--color-muted-foreground-dark)]">
            Alege un curs potrivit nivelului tău și urmărește progresul direct în acest tablou de bord.
          </p>
        </div>

        <Link
          to={ROUTES.COURSES}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          aria-label="Vezi toate cursurile"
        >
          Vezi toate cursurile
        </Link>
      </div>
    </motion.section>
  );
};

export default EmptyCoursesHero;

