import React from 'react';
import { ThemeToggle } from '../shared/ui/ThemeToggle';
import { UserProfile } from '../types';
import { GraduationCap } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="sticky top-0 z-20 w-full bg-[var(--color-card)]/80 dark:bg-[var(--color-card-dark)]/80 backdrop-blur-md border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] transition-colors duration-300">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Logo (Mobile Only) */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
            CertiExpert
          </span>
        </div>

        {/* Spacer for Desktop to push content to right */}
        <div className="hidden md:block" />

        {/* Right: Theme */}
        <div id="header-profile" className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
