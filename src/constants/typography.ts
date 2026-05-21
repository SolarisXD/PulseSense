// PulseSense — Typography System
// Based on UI Design Guide v1.0

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'Inter',
  android: 'Inter',
  default: 'Inter',
});

const monoFont = Platform.select({
  ios: 'RobotoMono',
  android: 'RobotoMono',
  default: 'RobotoMono',
});

export const typography = {
  fontFamily,
  monoFont,

  // Type Scale
  display: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h1: {
    fontFamily,
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h2: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  h3: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  body: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  label: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  caption: {
    fontFamily,
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 15,
  },
  vitalValue: {
    fontFamily: monoFont,
    fontSize: 24,
    fontWeight: '500' as const,
    lineHeight: 30,
  },
  vitalValueSmall: {
    fontFamily: monoFont,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  badge: {
    fontFamily,
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 13,
  },
} as const;
