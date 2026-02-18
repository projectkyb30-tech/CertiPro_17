import React from 'react';
import { ThemeToggle } from '../shared/ui/ThemeToggle';
import { UserProfile } from '../types';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/paths';

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

        {/* Right: Theme & Profile */}
        <div id="header-profile" className="flex items-center gap-4">
          <ThemeToggle />
          
          <div className="h-8 w-[1px] bg-[var(--color-border)] dark:bg-[var(--color-border-dark)] mx-1" />

          <Link to={ROUTES.PROFILE} className="flex items-center gap-3 pl-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] leading-none mb-1">
                {user.fullName || 'User'}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] font-medium">
                Level {Math.floor(user.xp / 1000) + 1} Student
              </p>
            </div>
            {/* Strict Color Palette: Blue bg, White text, no gradients other than primary */}
            <div className="w-10 h-10 rounded-xl bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] overflow-hidden border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-lg">
                  {(user.fullName || 'U').charAt(0)}
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
