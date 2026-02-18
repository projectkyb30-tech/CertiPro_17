import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { ROUTES } from '../routes/paths';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useUserStore();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const logoutPromise = logout();
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Logout timeout')), 2000)
        );
        await Promise.race([logoutPromise, timeout]);
      } catch (error) {
        console.error('Logout failed or timed out', error);
      } finally {
        if (mounted) {
          try {
            Object.keys(localStorage).forEach((k) => {
              if (k.startsWith('sb-') || k.includes('supabase')) {
                localStorage.removeItem(k);
              }
            });
          } catch (storageError) {
            console.warn('Failed to clean auth keys from localStorage', storageError);
          }
          window.location.replace(ROUTES.AUTH);
        }
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [logout, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-500">Se deconectează...</p>
      </div>
    </div>
  );
};

export default Logout;
