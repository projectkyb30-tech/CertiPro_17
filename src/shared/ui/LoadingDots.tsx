import React from 'react';

type LoadingDotsProps = {
  className?: string;
  label?: string;
};

const LoadingDots: React.FC<LoadingDotsProps> = ({ className = '', label }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-end gap-1.5">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-2 w-2 rounded-full bg-[var(--color-primary)]"
            style={{
              animationName: 'loading-dots-bounce',
              animationDuration: '0.8s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
              animationDelay: `${index * 0.12}s`,
            }}
          />
        ))}
      </div>
      {label && (
        <span className="text-xs font-medium text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
          {label}
        </span>
      )}
    </div>
  );
};

export default LoadingDots;

