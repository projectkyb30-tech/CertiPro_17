import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { TutorialSlice, createTutorialSlice } from './slices/tutorialSlice';
import { ThemeSlice, createThemeSlice } from './slices/themeSlice';
import { CourseSlice, createCourseSlice } from './slices/courseSlice';

// Safe storage implementation
const storage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name);
    } catch (e) {
      console.warn('LocalStorage access failed:', e);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch (e) {
      console.warn('LocalStorage remove failed:', e);
    }
  },
};

type AppState = AuthSlice & TutorialSlice & ThemeSlice & CourseSlice;

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createTutorialSlice(...a),
      ...createThemeSlice(...a),
      ...createCourseSlice(...a),
    }),
    {
      name: 'certipro-app-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        // Auth
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Tutorial
        hasSeenOnboarding: state.hasSeenOnboarding,
        hasSeenAppTutorial: state.hasSeenAppTutorial,
        tutorialStepIndex: state.tutorialStepIndex,
        // Theme
        theme: state.theme,
      }),
    }
  )
);
