// PulseSense — Typography System
// Syne (bold geometric display) + Outfit (warm clean body)
// Based on UI Design Guide v1.0

import { Platform } from 'react-native';

// Font family names as loaded by expo-google-fonts
export const fonts = {
  display: 'Syne',      // Bold, geometric — for headings, splash, hero
  body: 'Outfit',        // Clean, warm — for body text, labels, captions
  mono: 'RobotoMono',   // Monospace — for vital values, numbers in tables
} as const;

const displayFont = fonts.display;
const bodyFont = fonts.body;
const monoFont = fonts.mono;

export const typography = {
  fontFamily: bodyFont,
  displayFont,
  bodyFont,
  monoFont,

  // Type Scale — Syne for display/headings, Outfit for body
  display: {
    fontFamily: displayFont,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h1: {
    fontFamily: displayFont,
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
  },
  h2: {
    fontFamily: displayFont,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  h3: {
    fontFamily: displayFont,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontFamily: bodyFont,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily: bodyFont,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  label: {
    fontFamily: bodyFont,
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  caption: {
    fontFamily: bodyFont,
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
    fontFamily: bodyFont,
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 13,
  },
} as const;

export function scaleSize(size: number, scale: number): number {
  return Math.round(size * scale);
}

function scaleStyle(style: Record<string, any>, scale: number): Record<string, any> {
  const result = { ...style };
  if (result.fontSize) result.fontSize = Math.round(result.fontSize * scale);
  if (result.lineHeight) result.lineHeight = Math.round(result.lineHeight * scale);
  return result;
}

export function getScaledTypography(scale: number) {
  return {
    ...typography,
    display: scaleStyle(typography.display, scale),
    h1: scaleStyle(typography.h1, scale),
    h2: scaleStyle(typography.h2, scale),
    h3: scaleStyle(typography.h3, scale),
    body: scaleStyle(typography.body, scale),
    bodyMedium: scaleStyle(typography.bodyMedium, scale),
    label: scaleStyle(typography.label, scale),
    caption: scaleStyle(typography.caption, scale),
    vitalValue: scaleStyle(typography.vitalValue, scale),
    vitalValueSmall: scaleStyle(typography.vitalValueSmall, scale),
    badge: scaleStyle(typography.badge, scale),
  };
}
