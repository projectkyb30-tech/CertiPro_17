import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';
import { useUserStore } from '../../store/useUserStore';
import { Shield, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminDevTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) return null;

  const links = [
    { name: 'Admin Dashboard', path: ROUTES.ADMIN },
    { name: 'Welcome', path: ROUTES.WELCOME },
    { name: 'Onboarding', path: ROUTES.ONBOARDING },
    { name: 'Auth', path: ROUTES.AUTH },
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Profile', path: ROUTES.PROFILE },
    { name: 'Settings', path: ROUTES.SETTINGS },
    { name: 'Exam Center', path: ROUTES.EXAM_CENTER },
    { name: 'Complete Profile', path: ROUTES.COMPLETE_PROFILE },
    { name: 'Terms', path: ROUTES.TERMS },
    { name: 'Success (Demo)', path: ROUTES.SUCCESS },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 bg-white dark:bg-[#1A1B1D] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-64 overflow-hidden"
          >
            <div className="p-3 bg-primary/10 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <span className="font-semibold text-sm text-primary flex items-center gap-2">
                <Shield size={14} />
                Admin Navigation
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
              {links.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                    location.pathname === link.path
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {link.name}
                  <ExternalLink 
                    size={12} 
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                      location.pathname === link.path ? 'text-white' : 'text-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="text-xs text-gray-500 text-center">
                Bypassing restrictions active
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => navigate(ROUTES.ADMIN)}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all ${
          isOpen 
            ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' 
            : 'bg-primary text-white hover:bg-primary-dark hover:scale-105'
        }`}
      >
        <Shield size={20} />
        {!isOpen && <span className="font-medium text-sm">Admin</span>}
      </button>
    </div>
  );
};
