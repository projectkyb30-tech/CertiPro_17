import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={twMerge(
        'w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-input)] dark:border-[var(--color-input-dark)] bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]',
        className
      )}
      {...props}
    />
  );
};

export default Textarea;
