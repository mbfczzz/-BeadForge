import React, { createContext, useContext, useState, useCallback } from 'react';
import { LightTheme, DarkTheme, ThemeColors } from './colors';

interface ThemeContextType {
  dark: boolean;
  colors: ThemeColors;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  dark: false,
  colors: LightTheme,
  toggle: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dark, setDark] = useState(false);
  const toggle = useCallback(() => setDark((d) => !d), []);
  const colors = dark ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ dark, colors, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
