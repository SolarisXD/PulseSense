// PulseSense — Color System
// Based on UI Design Guide v1.0

export const colors = {
  // Primary
  primary: '#1A5F7A',
  primaryLight: '#2E86AB',
  primarySurface: '#E0F2F8',

  // Semantic
  success: '#2DC653',
  successSurface: '#D1FAE5',
  warning: '#F4A261',
  warningSurface: '#FEF3C7',
  danger: '#E63946',
  dangerSurface: '#FEE2E2',
  urgent: '#D97706',

  // Emergency screens
  emergencyBg: '#C0392B',
  emergencyText: '#FFFFFF',
  urgentBg: '#D97706',
  monitorBg: '#1A5F7A',
  safeBg: '#2DC653',

  // Neutrals
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F7',
  border: '#D1D9E0',
  borderLight: '#E9EDF2',
  textPrimary: '#1C2B3A',
  textSecondary: '#546E7A',
  textDisabled: '#9EABB7',
  overlay: 'rgba(0,0,0,0.45)',

  // Shadows
  shadowSubtle: 'rgba(0,0,0,0.08)',
  shadowStandard: 'rgba(0,0,0,0.10)',
  shadowElevated: 'rgba(0,0,0,0.14)',
  shadowSheet: 'rgba(0,0,0,0.12)',
} as const;

export type ColorName = keyof typeof colors;
