import React from 'react';
import { twMerge } from 'tailwind-merge';

type BadgeVariant = 'default' | 'secondary' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--color-muted)] text-[var(--color-foreground)] dark:bg-[var(--color-muted-dark)] dark:text-[var(--color-foreground-dark)]',
  secondary:
    'bg-[var(--color-foreground)] text-white dark:bg-[var(--color-foreground-dark)]',
  outline:
    'border border-[var(--color-border)] dark:border-[var(--color-border-dark)]',
};

const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  return (
    <div
      className={twMerge(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export default Badge;
