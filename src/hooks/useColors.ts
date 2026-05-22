import { useMemo } from 'react';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../constants/colors';
import { colorsDark } from '../constants/colorsDark';

export function useColors() {
  const isDark = useThemeStore((s) => s.isDark);
  return useMemo(() => (isDark ? { ...colors, ...colorsDark } : colors), [isDark]);
}
