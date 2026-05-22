// PulseSense — Dark Mode Color System
// These override the light colors when dark mode is active

export const colorsDark = {
  // Surface & Background
  background: '#0D1117',
  surface: '#161B22',
  surfaceAlt: '#1C2333',
  border: '#30363D',
  borderLight: '#21262D',

  // Text
  textPrimary: '#E6EDF3',
  textSecondary: '#8B949E',
  textDisabled: '#484F58',

  // Primary (keep same brand colors, adjust surface)
  primary: '#1A5F7A',
  primaryLight: '#2E86AB',
  primarySurface: '#0F2D3D',

  // Semantic
  success: '#2DC653',
  successSurface: '#0A2E1A',
  warning: '#F4A261',
  warningSurface: '#2D1F0A',
  danger: '#E63946',
  dangerSurface: '#2D0A0E',

  // Tab bar
  tabBarBg: 'rgba(22,27,34,0.85)',
  tabBarBorder: 'rgba(48,54,61,0.5)',

  // Glassmorphism
  glassBg: 'rgba(22,27,34,0.78)',

  // Card glow
  cardGlow: 'rgba(26,95,122,0.08)',
  cardGlowDanger: 'rgba(230,57,70,0.10)',

  // Gradients
  bgGradientStart: '#0D1117',
  bgGradientEnd: '#161B22',
  bgGradientHome: ['#0D1117', '#161B22'] as const,
  bgGradientVitals: ['#0D1117', '#161B22'] as const,
  bgGradientEmergency: ['#2D0A0E', '#3D0D12'] as const,

  // Overlay
  overlay: 'rgba(0,0,0,0.6)',

  // Shadows (darker for dark mode)
  shadowSubtle: 'rgba(0,0,0,0.3)',
  shadowStandard: 'rgba(0,0,0,0.4)',
  shadowElevated: 'rgba(0,0,0,0.5)',
  shadowSheet: 'rgba(0,0,0,0.4)',
  shadowDanger: 'rgba(230,57,70,0.3)',
} as const;

export type DarkColorName = keyof typeof colorsDark;
