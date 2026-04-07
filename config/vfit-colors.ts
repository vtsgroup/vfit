// ============================================
// VFIT Color System — Blue Theme
// ============================================

export const VFIT_COLORS = {
  // Primary Brand Colors (Blue Scale)
  primary: {
    50: '#eff6ff',   // Very light blue
    100: '#dbeafe',  // Light blue
    200: '#bfdbfe',  // Lighter blue
    300: '#93c5fd',  // Light medium blue
    400: '#60a5fa',  // Medium blue
    500: '#3b82f6',  // Brand primary blue
    600: '#2563eb',  // Darker blue
    700: '#1d4ed8',  // Dark blue
    800: '#1e40af',  // Very dark blue
    900: '#1e3a8a',  // Darkest blue
  },

  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Accent Colors
  accent: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },

  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    secondary: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
    accent: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)',
    card: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  },
} as const

export type VfitColorScale = keyof typeof VFIT_COLORS.primary
export type VfitColorName = keyof typeof VFIT_COLORS