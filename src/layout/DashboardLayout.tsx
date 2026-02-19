import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import { useUserStore } from '../store/useUserStore';
const AppTutorial = React.lazy(() => import('../features/tutorial/components/AppTutorial'));
import { ROUTES } from '../routes/paths';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useUserStore();

  if (!user) {
    return <Navigate to={ROUTES.AUTH} replace />;
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-background-dark transition-colors duration-300">
      <React.Suspense fallback={null}>
        <AppTutorial />
      </React.Suspense>
      <Sidebar />
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Main Content Wrapper */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header />
        
        {/* Main content with padding bottom for mobile nav */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
