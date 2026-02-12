import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/paths';
import { 
  Home, 
  BookOpen, 
  Settings, 
  LogOut, 
  GraduationCap,
  ClipboardList,
} from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useUserStore();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.AUTH);
  };

  const navItems = [
    { icon: Home, label: 'Home', path: ROUTES.HOME },
    { icon: BookOpen, label: 'Lessons', path: ROUTES.LESSONS },
    { icon: ClipboardList, label: 'Exam Center', path: ROUTES.EXAM_CENTER },
    { icon: Settings, label: 'Settings', path: ROUTES.SETTINGS },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 transition-colors duration-300 z-30">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-xl">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
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
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
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

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Deconectare</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
