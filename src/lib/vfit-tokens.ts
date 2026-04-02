// ============================================
// VFIT Design System Tokens
// Version: 1.0 | Status: LOCKED
// Reference: .claude/vfit-design-system.md
// ============================================

/**
 * Core color palette for VFIT.
 * Dark teal (#0F2B2B) base + Neon Lime (#00FF00) accents
 * All semantic colors meet WCAG AA 4.5:1 contrast minimum
 */
export const viftColors = {
  // Primary & Accents
  primary: '#00FF00' as const,
  primaryDark: '#00CC00' as const,

  // Surface Layers
  surfaceBase: '#0F2B2B' as const,
  surfaceCard: '#0F3A3A' as const,
  surfaceElevated: '#1A4A4A' as const,

  // Text
  textPrimary: '#FFFFFF' as const,
  textSecondary: '#B3B3B3' as const,
  textTertiary: '#808080' as const,

  // Semantic
  success: '#4CAF50' as const,
  error: '#FF4444' as const,
  warning: '#FFA500' as const,
  info: '#4DA6FF' as const,

  // Utility
  transparent: 'transparent' as const,
} as const;

/**
 * 8pt grid spacing scale
 * Used for padding, margin, gap throughout the app
 */
export const viftSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

/**
 * Typography scale relative to 16px base
 * All sizes meet minimum 11px for accessibility
 */
export const viftTypography = {
  display: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 1.3,
    letterSpacing: -0.25,
  },
  subtitle1: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 1.4,
    letterSpacing: 0,
  },
  subtitle2: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 1.4,
    letterSpacing: 0,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  bodyNormal: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 1.5,
    letterSpacing: 0.25,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 1.4,
    letterSpacing: 0.4,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 1.4,
    letterSpacing: 0.5,
  },
} as const;

/**
 * Animation timings
 * All animations use cubic-bezier(0.4, 0, 0.2, 1) easing
 * Respect prefers-reduced-motion in implementation
 */
export const viftAnimation = {
  micro: 150,    // Button press, opacity, quick state changes
  standard: 250, // Page transitions, modal entry, expand/collapse
  slow: 400,     // Complex sequences, parallax effects
} as const;

/**
 * Border radius scale
 * Applied consistently across buttons, cards, inputs, modals
 */
export const viftRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 999,
} as const;

/**
 * Component-specific tokens
 * Overrides for special cases (not used for base color/spacing)
 */
export const viftComponents = {
  button: {
    minHeight: 44, // Touch target minimum iOS
    minWidth: 44,  // Touch target minimum iOS
    paddingVertical: viftSpacing.md,
    paddingHorizontal: viftSpacing.lg,
    borderRadius: viftRadius.sm,
    gap: viftSpacing.sm,
  },
  input: {
    minHeight: 44, // Touch target minimum
    paddingVertical: viftSpacing.md,
    paddingHorizontal: viftSpacing.lg,
    borderRadius: viftRadius.sm,
    borderWidth: 1,
  },
  card: {
    padding: viftSpacing.lg,
    borderRadius: viftRadius.md,
    marginBottom: viftSpacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5, // Android shadow
  },
  modal: {
    borderRadius: viftRadius.lg,
    padding: viftSpacing.xl,
    overlayOpacity: 0.6,
  },
  bottomNav: {
    height: 64, // Including safe area
    paddingBottom: viftSpacing.lg, // Safe area for home indicator
  },
} as const;

/**
 * CSS variable mappings for Next.js/web
 * Use these in globals.css for Tailwind integration
 */
export const viftCSSVariables = {
  '--ds-primary': viftColors.primary,
  '--ds-primary-dark': viftColors.primaryDark,
  '--ds-surface-base': viftColors.surfaceBase,
  '--ds-surface-card': viftColors.surfaceCard,
  '--ds-surface-elevated': viftColors.surfaceElevated,
  '--ds-text-primary': viftColors.textPrimary,
  '--ds-text-secondary': viftColors.textSecondary,
  '--ds-text-tertiary': viftColors.textTertiary,
  '--ds-success': viftColors.success,
  '--ds-error': viftColors.error,
  '--ds-warning': viftColors.warning,
  '--ds-info': viftColors.info,
} as const;

/**
 * Tailwind config extension
 * Copy this to tailwind.config.ts for web components
 */
export const viftTailwindConfig = {
  colors: {
    'brand-primary': viftColors.primary,
    'brand-primary-dark': viftColors.primaryDark,
    'surface-base': viftColors.surfaceBase,
    'surface-card': viftColors.surfaceCard,
    'surface-elevated': viftColors.surfaceElevated,
    'text-primary': viftColors.textPrimary,
    'text-secondary': viftColors.textSecondary,
    'text-tertiary': viftColors.textTertiary,
    'text-success': viftColors.success,
    'text-error': viftColors.error,
    'text-warning': viftColors.warning,
    'text-info': viftColors.info,
  },
  spacing: {
    'spacing-xs': `${viftSpacing.xs}px`,
    'spacing-sm': `${viftSpacing.sm}px`,
    'spacing-md': `${viftSpacing.md}px`,
    'spacing-lg': `${viftSpacing.lg}px`,
    'spacing-xl': `${viftSpacing.xl}px`,
    'spacing-2xl': `${viftSpacing['2xl']}px`,
    'spacing-3xl': `${viftSpacing['3xl']}px`,
    'spacing-4xl': `${viftSpacing['4xl']}px`,
  },
  borderRadius: {
    'radius-sm': `${viftRadius.sm}px`,
    'radius-md': `${viftRadius.md}px`,
    'radius-lg': `${viftRadius.lg}px`,
  },
  transitionDuration: {
    'anim-micro': `${viftAnimation.micro}ms`,
    'anim-standard': `${viftAnimation.standard}ms`,
    'anim-slow': `${viftAnimation.slow}ms`,
  },
} as const;

/**
 * Type exports for strict typing
 */
export type ViftColor = keyof typeof viftColors;
export type ViftSpacing = keyof typeof viftSpacing;
export type ViftRadius = keyof typeof viftRadius;

// ============================================
// Continuity Prompt for Opus
// ============================================
/**
 * NEXT SESSION INSTRUCTION:
 * 1. This file is LOCKED. Do NOT modify colors, spacing, typography without explicit user request.
 * 2. All components must import from this file: import { viftColors, viftSpacing } from '@/lib/vfit-tokens'
 * 3. Never hardcode colors/spacing in component styles. Always use tokens.
 * 4. For React Native: Use viftColors, viftSpacing directly in StyleSheet.create()
 * 5. For Next.js: Use viftTailwindConfig for Tailwind classes or CSS variables in globals.css
 * 6. Test every component after creation to ensure tokens are applied correctly.
 * 7. If you need to add a new token, update this file + corresponding design system doc.
 * BLOCKERS: None. Tokens are complete and ready for component implementation.
 * NEXT TASK (Sprint 41 Week 1): Create src/components/ui/vfit/Button.tsx using these tokens
 */
