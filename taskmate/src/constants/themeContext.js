import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = Appearance.getColorScheme(); // 'light' or 'dark'
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [loading, setLoading] = useState(true);

  // 🔹 Load saved preference on startup
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') {
          setIsDark(saved === 'dark');
        } else {
          // default to system theme if no preference stored
          setIsDark(systemScheme === 'dark');
        }
      } catch (e) {
        console.warn('Failed to load theme preference:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔹 Toggle theme and persist choice
  const toggleTheme = async () => {
    try {
      const newTheme = isDark ? 'light' : 'dark';
      setIsDark(!isDark);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  if (loading) return null; // prevent flicker before loading saved theme

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 💡 Light & Dark theme palettes
export const lightTheme = {
  mode: 'light',
  background: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  subtext: '#475569',
  progressBackground: '#e5e7eb',
  progressFill: '#2563eb',
  danger: '#ef4444',
  container: '#f8fafc',
  indexToolbarText: '#334155',
  statusColors: {
    overdue: { bg: '#fff1f2', border: '#fecaca', text: '#dc2626' },
    future: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
    today: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a' },
  },
};

export const darkTheme = {
  mode: 'dark',
  background: '#0f172a',
  card: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  subtext: '#94a3b8',
  progressBackground: '#334155',
  progressFill: '#3b82f6',
  danger: '#dc2626',
  container: '#0f172a',
  statusColors: {
    overdue: { bg: '#3f1d1d', border: '#7f1d1d', text: '#fca5a5' },
    future: { bg: '#3a2e0d', border: '#854d0e', text: '#facc15' },
    today: { bg: '#1e3a8a', border: '#3b82f6', text: '#bfdbfe' },
  },
};

export const useTheme = () => useContext(ThemeContext);
