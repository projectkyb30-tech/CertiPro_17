import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useUserStore } from '../store/useUserStore';
import { ROUTES } from '../routes/paths';
import LoadingDots from '../shared/ui/LoadingDots';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { checkSession } = useUserStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase automatically handles the hash/query params and sets the session
        // We just need to wait for it to be ready
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate(ROUTES.AUTH);
          return;
        }

        if (session) {
          // Update the global state with the new session
          await checkSession();
          // Redirect to home
          navigate(ROUTES.HOME, { replace: true });
        } else {
          // If no session, listen for the SIGNED_IN event
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            if (event === 'SIGNED_IN' && session) {
              await checkSession();
              subscription.unsubscribe();
              navigate(ROUTES.HOME, { replace: true });
            }
          });

          // Timeout after 10 seconds if nothing happens
          const timeout = setTimeout(() => {
            subscription.unsubscribe();
            console.warn('Auth callback timed out');
            navigate(ROUTES.AUTH);
          }, 10000);

          return () => {
            clearTimeout(timeout);
            subscription.unsubscribe();
          };
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        navigate(ROUTES.AUTH);
      }
    };

    handleAuthCallback();
  }, [navigate, checkSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] dark:bg-[var(--color-background-dark)]">
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <LoadingDots />
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[var(--color-foreground)] dark:text-[var(--color-foreground-dark)]">
            Se finalizează autentificarea
          </h2>
          <p className="text-[var(--color-muted-foreground)] dark:text-[var(--color-muted-foreground-dark)] animate-pulse">
            Te rugăm să aștepți un moment...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
