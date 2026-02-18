import React from 'react';
import { twMerge } from 'tailwind-merge';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label: React.FC<LabelProps> = ({ className, ...props }) => {
  return (
    <label
      className={twMerge(
        'text-sm font-medium text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]',
        className
      )}
      {...props}
    />
  );
};

export default Label;
