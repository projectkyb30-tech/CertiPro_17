import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'outline' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center whitespace-nowrap select-none transition-colors font-medium rounded-[var(--radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<ButtonVariant, string> = {
  default:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-foreground)] dark:bg-[var(--color-surface-dark)] dark:text-[var(--color-foreground-dark)]',
  ghost:
    'bg-transparent text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-dark)]',
  outline:
    'bg-transparent border border-[var(--color-border)] dark:border-[var(--color-border-dark)] text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-dark)]',
  destructive:
    'bg-[var(--color-destructive)] text-white hover:bg-[var(--color-destructive-hover)]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-2',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
  icon: 'h-10 w-10',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', fullWidth = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          base,
          variants[variant],
          sizes[size],
          clsx(fullWidth && 'w-full'),
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
