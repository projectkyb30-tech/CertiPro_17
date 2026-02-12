import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useThemeStore } from './store/useThemeStore';
import { useCourseStore } from './store/useCourseStore';
import ErrorBoundary from './shared/components/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import { supabase } from './services/supabase';
import { useUserStore } from './store/useUserStore';
import { setUser } from './shared/monitoring';
import { SkeletonPage } from './shared/ui/Skeleton';
import { App as CapApp } from '@capacitor/app';

// Loading fallback
const PageLoader = () => (
  <SkeletonPage />
);

function App() {
  const { theme } = useThemeStore();
  const { fetchCourses } = useCourseStore();
  const { checkSession, user } = useUserStore();

  useEffect(() => {
    fetchCourses();

    // Handle Deep Links for OAuth
    CapApp.addListener('appUrlOpen', async (data: { url: string }) => {
      const url = new URL(data.url);
      
      // Check if it's an auth callback
      if (url.host === 'auth' && url.pathname === '/callback') {
        // Supabase expects the full URL including fragments for OAuth
        const { error } = await supabase.auth.setSession({
          access_token: url.hash.split('access_token=')[1]?.split('&')[0] || '',
          refresh_token: url.hash.split('refresh_token=')[1]?.split('&')[0] || '',
        });
        
        if (error) console.error('Error setting session from deep link:', error);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (['INITIAL_SESSION', 'SIGNED_IN', 'TOKEN_REFRESHED', 'SIGNED_OUT'].includes(event)) {
        await checkSession();
      }
      if (['SIGNED_IN', 'SIGNED_OUT'].includes(event)) {
        await fetchCourses({ force: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession, fetchCourses]);

  useEffect(() => {
    setUser(user ? { id: user.id } : null);
  }, [user]);

  useEffect(() => {
    // Apply theme on app mount
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
