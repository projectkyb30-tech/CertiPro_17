import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../routes/paths';
import { Home, BookOpen, ClipboardList, Settings } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: ROUTES.HOME },
    { icon: BookOpen, label: 'Lessons', path: ROUTES.LESSONS },
    { icon: ClipboardList, label: 'Exam Center', path: ROUTES.EXAM_CENTER },
    { icon: Settings, label: 'Settings', path: ROUTES.SETTINGS },
  ];

  return (
    <nav id="mobile-nav" className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-[#1A1B1D] border-t border-gray-200 dark:border-gray-800 z-50 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_15px_rgba(0,0,0,0.2)]">
      <div className="flex justify-around items-center h-20">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors duration-300 ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  className="w-6 h-6 transition-transform duration-300" 
                  strokeWidth={isActive ? 2 : 1.5} 
                />
                <span className={`text-[10px] font-medium tracking-wide transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
