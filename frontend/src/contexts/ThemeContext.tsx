import React, { createContext, useContext, useState, useEffect } from 'react';

interface Theme {
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('saved-theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark-mode class to <html> when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    localStorage.setItem('saved-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const lightTheme: Theme = {
    background: '#ffffff',
    cardBackground: '#f8fafc',
    textPrimary: '#1a202c',
    textSecondary: '#718096',
    border: '#e2e8f0',
    accent: '#667eea',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  const darkTheme: Theme = {
    background: '#0f172a',
    cardBackground: '#1e293b',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
