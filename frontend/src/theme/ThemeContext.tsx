import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { Uniwind } from 'uniwind';
import { DarkTheme, LightTheme, ThemeColors } from './colors';

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
  const [dark, setDark] = useState(() => Appearance.getColorScheme() === 'dark');
  const toggle = useCallback(() => setDark((value) => !value), []);
  const colors = dark ? DarkTheme : LightTheme;

  useEffect(() => {
    Uniwind.setTheme(dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, colors, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
