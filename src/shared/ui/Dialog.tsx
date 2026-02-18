import React, { Fragment } from 'react';
import { Dialog as HDialog, Transition } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onClose, title, description, className, children }) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <HDialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-4 scale-95"
            >
              <HDialog.Panel
                className={twMerge(
                  'w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] p-6 shadow-xl',
                  className
                )}
              >
                {title && (
                  <HDialog.Title className="text-lg font-semibold mb-1">
                    {title}
                  </HDialog.Title>
                )}
                {description && (
                  <HDialog.Description className="text-sm text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] mb-4">
                    {description}
                  </HDialog.Description>
                )}
                {children}
              </HDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HDialog>
    </Transition>
  );
};

export default Dialog;
