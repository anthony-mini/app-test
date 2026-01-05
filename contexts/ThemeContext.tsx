import React, { createContext, ReactNode, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, ColorScheme } from '../constants/Colors';

interface ThemeContextType {
  colorScheme: ColorScheme;
  colors: typeof Colors.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const colorScheme: ColorScheme = systemColorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  return (
    <ThemeContext.Provider value={{ colorScheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
