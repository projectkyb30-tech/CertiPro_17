import React, { Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

interface TabsProps {
  tabs: { id: string; label: React.ReactNode; content: React.ReactNode }[];
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, className }) => {
  return (
    <Tab.Group>
      <Tab.List className={twMerge('flex items-center gap-2 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)]', className)}>
        {tabs.map((t) => (
          <Tab key={t.id} as={Fragment}>
            {({ selected }) => (
              <button
                className={twMerge(
                  'px-3 py-2 text-sm font-medium rounded-t-md transition-colors',
                  selected
                    ? 'text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] border-b-2 border-[var(--color-foreground)] dark:border-[var(--color-foreground-dark)]'
                    : 'text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] hover:text-[var(--color-foreground)] dark:hover:text-[var(--color-foreground-dark)]'
                )}
              >
                {t.label}
              </button>
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {tabs.map((t) => (
          <Tab.Panel key={t.id} className="focus:outline-none">
            {t.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Tabs;
