import { useAppStore } from './useAppStore';

// Re-export selector hook for backward compatibility
export const useThemeStore = () => {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const setTheme = useAppStore((state) => state.setTheme);

  return {
    theme,
    toggleTheme,
    setTheme
  };
};
