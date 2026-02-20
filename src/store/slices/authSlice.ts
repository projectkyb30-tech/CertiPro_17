import { StateCreator } from 'zustand';
import { UserProfile } from '../../types';
import { authService } from '../../services/authService';

// Type for cross-slice access to fetchCourses
type StoreWithCourses = { fetchCourses?: (options?: { force?: boolean }) => Promise<void> };

const generateRandomAvatar = () => {
  const seed = Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

export interface AuthSlice {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  regenerateAvatar: () => void;
  checkSession: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  user: null,
  isAuthenticated: false,
  isAuthLoading: false,
  authError: null,

  checkSession: async () => {
    const state = get();
    console.info('[Auth] checkSession:start', { hasUser: !!state.user });
    if (!state.user) {
      set({ isAuthLoading: true });
    } else {
      set({ isAuthenticated: true, isAuthLoading: false });
    }

    const refetchCoursesForCurrentUser = async () => {
      const store = get() as AuthSlice & StoreWithCourses;
      if (typeof store.fetchCourses === 'function') {
        await store.fetchCourses({ force: true });
      }
    };

    try {
      const user = await authService.getCurrentUser();
      if (user) {
        set({
          isAuthenticated: true,
          user,
          isAuthLoading: false
        });
        console.info('[Auth] checkSession:resolved', { userId: user.id });
      } else {
        set({
          isAuthenticated: false,
          user: null,
          isAuthLoading: false
        });
        console.info('[Auth] checkSession:resolved', { userId: null });
      }
      await refetchCoursesForCurrentUser();
    } catch {
      set({
        isAuthenticated: false,
        user: null,
        isAuthLoading: false
      });
      console.info('[Auth] checkSession:error');
      await refetchCoursesForCurrentUser();
    }
  },

  login: async (email, password) => {
    set({ isAuthLoading: true, authError: null });
    try {
      const user = await authService.login(email, password);

      set({
        isAuthenticated: true,
        user,
        isAuthLoading: false
      });
    } catch {
      set({ authError: 'Login failed', isAuthLoading: false });
    }
  },

  logout: async () => {
    set({ isAuthLoading: true });
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error (server):', error);
      set({ authError: 'Logout failed on server, but session cleared locally' });
    } finally {
      set({
        isAuthenticated: false,
        user: null,
        isAuthLoading: false
      });
    }
  },

  updateProfile: async (updates) => {
    set({ isAuthLoading: true, authError: null });
    try {
      // Optimistic update first to feel instant
      set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      }));

      // Perform actual update and get verified result
      const updatedUser = await authService.updateProfile(updates);

      // Update state with authoritative data from server
      set({
        user: updatedUser,
        isAuthLoading: false
      });
    } catch (error) {
      console.error('Update profile error:', error);
      const message = error instanceof Error ? error.message : 'Update failed';
      // Revert or show error - here we set error
      set({
        authError: message,
        isAuthLoading: false
      });
      // Re-throw so the UI knows it failed
      throw error;
    }
  },

  regenerateAvatar: () => set((state) => ({
    user: state.user ? { ...state.user, avatarUrl: generateRandomAvatar() } : null
  })),
});
