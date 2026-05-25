import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const { isDarkMode, setTheme, toggleTheme } = useThemeStore();
  
  const isDark = isDarkMode;
  const isLight = !isDarkMode;
  
  return {
    isDarkMode,
    isDark,
    isLight,
    setTheme,
    toggleTheme,
  };
}
