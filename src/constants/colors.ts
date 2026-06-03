// PulseSense — Color System
// Based on UI Design Guide v1.0 — Extended with atmosphere tokens

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

  // --- Atmosphere & Depth (new) ---
  // Gradient backgrounds
  bgGradientStart: '#F0F4F8',
  bgGradientEnd: '#E8EEF4',
  bgGradientHome: ['#F0F4F8', '#E4ECF2'] as const,
  bgGradientVitals: ['#EEF2F7', '#E8EDF3'] as const,
  bgGradientEmergency: ['#FEE2E2', '#FECACA'] as const,

  // Glassmorphism
  glassBg: 'rgba(255,255,255,0.78)',
  glassBorder: 'rgba(255,255,255,0.25)',
  glassHighlight: 'rgba(255,255,255,0.5)',
  glassShadow: 'rgba(0,0,0,0.06)',

  // Card elevation tints
  cardGlow: 'rgba(26,95,122,0.04)',
  cardGlowDanger: 'rgba(230,57,70,0.06)',

  // Tab bar
  tabBarBg: 'rgba(255,255,255,0.85)',
  tabBarBorder: 'rgba(209,217,224,0.5)',

  // Shadows
  shadowSubtle: 'rgba(0,0,0,0.06)',
  shadowStandard: 'rgba(0,0,0,0.09)',
  shadowElevated: 'rgba(0,0,0,0.12)',
  shadowSheet: 'rgba(0,0,0,0.10)',
  shadowDanger: 'rgba(230,57,70,0.25)',
} as const;


