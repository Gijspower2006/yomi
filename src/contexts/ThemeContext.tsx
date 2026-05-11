import React, { createContext, useContext } from 'react';
import { AppTheme, FontSize } from '../types';
import { darkColors, lightColors, oledColors, ColorPalette } from '../constants/colors';

export const FONT_SCALE: Record<FontSize, number> = {
  small:  0.88,
  medium: 1.0,
  large:  1.15,
};

interface ThemeContextValue {
  colors: ColorPalette;
  theme: AppTheme;
  fontSize: FontSize;
  fontScale: number;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkColors,
  theme: 'dark',
  fontSize: 'medium',
  fontScale: 1.0,
});

export function getThemeColors(theme: AppTheme): ColorPalette {
  if (theme === 'light') return lightColors;
  if (theme === 'oled')  return oledColors;
  return darkColors;
}

interface Props {
  theme: AppTheme;
  fontSize: FontSize;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, fontSize, children }: Props) {
  return (
    <ThemeContext.Provider value={{
      colors: getThemeColors(theme),
      theme,
      fontSize,
      fontScale: FONT_SCALE[fontSize],
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useColors(): ColorPalette {
  return useContext(ThemeContext).colors;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
