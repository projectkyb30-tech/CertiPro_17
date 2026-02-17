import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { ROUTES } from './paths';
import DashboardLayout from '../layout/DashboardLayout';

// Lazy loading pages
const Welcome = React.lazy(() => import('../pages/Welcome'));
const Onboarding = React.lazy(() => import('../pages/Onboarding'));
const Auth = React.lazy(() => import('../pages/Auth'));
const OTPVerification = React.lazy(() => import('../pages/OTPVerification'));
const Home = React.lazy(() => import('../pages/Home'));
const Courses = React.lazy(() => import('../pages/Courses'));
const Checkout = React.lazy(() => import('../pages/Checkout'));
const Lessons = React.lazy(() => import('../pages/Lessons'));
const CoursePlayer = React.lazy(() => import('../pages/CoursePlayer'));
const ExamCenter = React.lazy(() => import('../pages/ExamCenter'));
const ExamRunner = React.lazy(() => import('../pages/ExamRunner'));
const Settings = React.lazy(() => import('../pages/Settings'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Terms = React.lazy(() => import('../pages/Terms'));
const CompleteProfile = React.lazy(() => import('../pages/CompleteProfile'));
const Success = React.lazy(() => import('../pages/Success'));
const AdminDashboard = React.lazy(() => import('../pages/AdminDashboard'));
const AuthCallback = React.lazy(() => import('../pages/AuthCallback'));

import { AdminDevTools } from '../shared/components/AdminDevTools';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useUserStore();
  const location = useLocation();
  
  // SECURE Admin check: Using role from user object
  const isAdmin = user?.role === 'admin';
  
  if (isAdmin) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Require Profile Complete Component
const RequireProfileComplete = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserStore();
  
  if (!user) return null;

  // Admin bypass
  const isAdmin = user.role === 'admin';
  if (isAdmin) {
    return <>{children}</>;
  }
  
  // Check if critical fields are missing
  // Bio is OPTIONAL now.
  // Add debugging to see what's happening
  const isProfileComplete = !!(user.phone && user.birthDate);
  
  // Prevent redirect loop: If we are ALREADY at complete-profile, do NOT redirect to it again.
  // The RequireProfileComplete wrapper is only used on protected routes that REQUIRE completion.
  // If we are wrapping COMPLETE_PROFILE itself with this, it causes a loop.
  // BUT CompleteProfile page should NOT be wrapped in RequireProfileComplete.
  
  if (!isProfileComplete) {
    return <Navigate to={ROUTES.COMPLETE_PROFILE} replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects to home if already authenticated)
interface LocationState {
  from?: {
    pathname: string;
  };
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useUserStore();
  const location = useLocation();

  if (isAuthenticated) {
    // Redirect to the page they were trying to go to, or home
    const state = location.state as LocationState;
    const from = state?.from?.pathname || ROUTES.HOME;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route 
          path={ROUTES.WELCOME} 
          element={
            <PublicRoute>
              <Welcome />
            </PublicRoute>
          } 
        />
        <Route path={ROUTES.ONBOARDING} element={<Onboarding />} />
        <Route path={ROUTES.TERMS} element={<Terms />} />
        
        {/* Auth Callback Route - Handles OAuth redirects */}
        <Route 
          path="/auth/callback" 
          element={
            <AuthCallback />
          } 
        />

        {/* Success Route - Handles Stripe Redirects */}
        <Route 
          path={ROUTES.SUCCESS} 
          element={
            <ProtectedRoute>
              <Success />
            </ProtectedRoute>
          } 
        />
        
        {/* Auth Routes (Accessible only if NOT logged in) */}
        <Route 
          path={ROUTES.AUTH} 
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } 
        />
        <Route 
          path={ROUTES.OTP_VERIFY} 
          element={
            <PublicRoute>
              <OTPVerification />
            </PublicRoute>
          } 
        />

        {/* Protected Routes (Accessible only if logged in) */}
        
        {/* Profile Completion Route (Protected but NO RequireProfileComplete) */}
        <Route 
          path={ROUTES.COMPLETE_PROFILE} 
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } 
        />

        {/* Routes with Dashboard Layout */}
        <Route element={
          <ProtectedRoute>
            <RequireProfileComplete>
              <DashboardLayout>
                <Outlet />
              </DashboardLayout>
            </RequireProfileComplete>
          </ProtectedRoute>
        }>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.COURSES} element={<Courses />} />
          <Route path={ROUTES.LESSONS} element={<Lessons />} />
          <Route path={ROUTES.EXAM_CENTER} element={<ExamCenter />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
        </Route>

        {/* Fullscreen Protected Routes (No Layout) */}
        <Route element={
          <ProtectedRoute>
            <RequireProfileComplete>
              <Outlet />
            </RequireProfileComplete>
          </ProtectedRoute>
        }>
          <Route path={`${ROUTES.CHECKOUT}/:courseId`} element={<Checkout />} />
          <Route path={`${ROUTES.COURSE_PLAYER}/:courseId`} element={<CoursePlayer />} />
          <Route path={`${ROUTES.EXAM_TAKE}/:examId`} element={<ExamRunner />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to={ROUTES.WELCOME} replace />} />
      </Routes>
      <AdminDevTools />
    </>
  );
};

export default AppRoutes;
