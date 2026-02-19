import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/paths';
import {
  Home,
  BookOpen,
  Layers,
  Settings,
  LogOut,
  GraduationCap,
  ClipboardList,
} from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const handleLogout = async () => {
    navigate(ROUTES.LOGOUT);
  };

  const navItems = [
    { icon: Home, label: 'Home', path: ROUTES.HOME },
    { icon: BookOpen, label: 'Courses', path: ROUTES.COURSES },
    { icon: Layers, label: 'Lessons', path: ROUTES.LESSONS },
    { icon: ClipboardList, label: 'Exam Center', path: ROUTES.EXAM_CENTER },
    { icon: Settings, label: 'Settings', path: ROUTES.SETTINGS },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[var(--color-card)] dark:bg-[var(--color-card-dark)] border-r border-[var(--color-border)] dark:border-[var(--color-border-dark)] transition-colors duration-300 z-30">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-xl">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <span className="font-bold text-xl text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] tracking-tight">
          CertiExpert
        </span>
      </div>

      {/* Navigation */}
      <nav id="sidebar-nav" className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-[var(--radius)] transition-all duration-200 group ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] hover:bg-[var(--color-muted)] dark:hover:bg-[var(--color-muted-dark)] hover:text-[var(--color-foreground)] dark:hover:text-[var(--color-foreground-dark)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile Mini Card */}
      <div className="px-4 pb-2">
        <button
          type="button"
          onClick={() => navigate(ROUTES.PROFILE)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] border border-[var(--color-border)] dark:border-[var(--color-border-dark)] hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-muted)] dark:bg-[var(--color-muted-dark)] overflow-hidden border border-[var(--color-border)] dark:border-[var(--color-border-dark)] shadow-sm flex items-center justify-center">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
                {(user?.fullName || 'U').charAt(0)}
              </span>
            )}
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-sm font-semibold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)] truncate max-w-[150px]">
              {user?.fullName || 'User'}
            </span>
            <span className="text-xs text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)]">
              Level {user ? Math.floor(user.xp / 1000) + 1 : 1} Student
            </span>
          </div>
        </button>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-[var(--radius)] transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Deconectare</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
