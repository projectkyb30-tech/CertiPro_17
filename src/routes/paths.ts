export const ROUTES = {
  // Public
  WELCOME: '/',
  ONBOARDING: '/onboarding',
  TERMS: '/terms',
  
  // Auth
  AUTH: '/auth',
  OTP_VERIFY: '/otp-verify',
  COMPLETE_PROFILE: '/complete-profile',
  SUCCESS: '/success',
  
  // Protected
  HOME: '/home',
  COURSES: '/courses',
  CHECKOUT: '/checkout', // /checkout/:courseId
  LESSONS: '/lessons',
  COURSE_PLAYER: '/learn', // /learn/:courseId
  EXAM_CENTER: '/exam-center',
  EXAM_TAKE: '/exam/take', // /exam/take/:examId
  SETTINGS: '/settings',
  PROFILE: '/profile',

  // Admin
  ADMIN: '/admin',
} as const;
