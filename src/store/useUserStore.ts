import { useAppStore } from './useAppStore';

// Re-export selector hook for backward compatibility
// This allows existing components to work without changes while using the new centralized store
export const useUserStore = () => {
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  // Map new names to old names to maintain interface compatibility
  const isLoading = useAppStore((state) => state.isAuthLoading);
  const error = useAppStore((state) => state.authError);
  
  const hasSeenOnboarding = useAppStore((state) => state.hasSeenOnboarding);
  const hasSeenAppTutorial = useAppStore((state) => state.hasSeenAppTutorial);
  const tutorialStepIndex = useAppStore((state) => state.tutorialStepIndex);
  const isTutorialRunning = useAppStore((state) => state.isTutorialRunning);
  
  const login = useAppStore((state) => state.login);
  const logout = useAppStore((state) => state.logout);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const regenerateAvatar = useAppStore((state) => state.regenerateAvatar);
  const setHasSeenOnboarding = useAppStore((state) => state.setHasSeenOnboarding);
  const setHasSeenAppTutorial = useAppStore((state) => state.setHasSeenAppTutorial);
  const setTutorialStepIndex = useAppStore((state) => state.setTutorialStepIndex);
  const setTutorialRunning = useAppStore((state) => state.setTutorialRunning);
  const checkSession = useAppStore((state) => state.checkSession);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    hasSeenOnboarding,
    hasSeenAppTutorial,
    tutorialStepIndex,
    isTutorialRunning,
    login,
    logout,
    updateProfile,
    regenerateAvatar,
    setHasSeenOnboarding,
    setHasSeenAppTutorial,
    setTutorialStepIndex,
    setTutorialRunning,
    checkSession
  };
};
