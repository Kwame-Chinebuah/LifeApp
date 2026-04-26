import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS, RADIUS, setDarkMode } from './theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then(val => {
      if (val === 'true') {
        setIsDark(true);
        setDarkMode(true);
      }
    }).catch(() => {});
  }, []);

  function toggleDark() {
    const next = !isDark;
    setIsDark(next);
    setDarkMode(next);
    AsyncStorage.setItem('darkMode', String(next)).catch(() => {});
  }

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ COLORS, RADIUS, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
