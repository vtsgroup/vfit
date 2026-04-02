/**
 * src/lib/design-tokens.ts
 *
 * Design Tokens — VFIT Design System v3
 *
 * Exports: colors, shadows, easing, duration, radius
 */

// ============================================
// Design Tokens — VFIT Design System v3
// Extracted from vfit-design-system-v2.jsx
// CSS vars live in globals.css (--ds-*), this file
// provides typed access + semantic groupings
// ============================================

// ─── Color Scale ─────────────────────────────

export const colors = {
  primary: {
    DEFAULT: '#10b981', // emerald-500
    light: '#34d399',   // emerald-400
    lighter: '#6ee7b7', // emerald-300
    dark: '#059669',    // emerald-600
    darker: '#047857',  // emerald-700
  },
  secondary: {
    DEFAULT: '#64748b', // slate-500
    light: '#94a3b8',   // slate-400
    lighter: '#cbd5e1', // slate-300
    dark: '#475569',    // slate-600
    darker: '#334155',  // slate-700
  },
  accent: {
    DEFAULT: '#f59e0b', // amber-500
    light: '#fbbf24',   // amber-400
    dark: '#d97706',    // amber-600
    darker: '#b45309',  // amber-700
  },
  ai: {
    DEFAULT: '#8b5cf6', // violet-500
    light: '#a78bfa',   // violet-400
    dark: '#7c3aed',    // violet-600
  },
  error: '#ef4444',
  success: '#10b981',
} as const

// ─── 3D Button Shadow Tokens ────────────────

export const shadows = {
  button3d: {
    primary: {
      idle: 'var(--ds-btn-3d-primary)',
      hover: 'var(--ds-btn-3d-primary-hover)',
      active: 'var(--ds-btn-3d-primary-active)',
    },
    secondary: {
      idle: 'var(--ds-btn-3d-secondary)',
      hover: 'var(--ds-btn-3d-secondary-hover)',
      active: 'var(--ds-btn-3d-secondary-active)',
    },
    warning: {
      idle: 'var(--ds-btn-3d-warning)',
      hover: 'var(--ds-btn-3d-warning-hover, 0 5px 0 #b45309, 0 8px 20px rgba(217,119,6,0.4), inset 0 1px 0 rgba(255,255,255,0.25))',
      active: 'var(--ds-btn-3d-warning-active, 0 1px 0 #b45309, 0 2px 6px rgba(217,119,6,0.2), inset 0 2px 4px rgba(0,0,0,0.1))',
    },
    danger: {
      idle: 'var(--ds-btn-3d-danger)',
      hover: 'var(--ds-btn-3d-danger-hover, 0 5px 0 #b91c1c, 0 8px 20px rgba(239,68,68,0.4), inset 0 1px 0 rgba(255,255,255,0.25))',
      active: 'var(--ds-btn-3d-danger-active, 0 1px 0 #b91c1c, 0 2px 6px rgba(239,68,68,0.2), inset 0 2px 4px rgba(0,0,0,0.1))',
    },
  },
  card: {
    idle: 'var(--ds-card-shadow)',
    hover: 'var(--ds-card-shadow-hover)',
  },
  select: 'var(--ds-select-shadow)',
} as const

// ─── Easing Curves ──────────────────────────

export const easing = {
  /** Smooth spring-out — primary transition easing */
  springOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Bouncy overshoot — for scale/hover micro-interactions */
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Standard Material ease */
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Spring with subtle overshoot */
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const

// ─── Durations ──────────────────────────────

export const duration = {
  fast: 150,
  normal: 250,
  slow: 400,
  entrance: 500,
} as const

// ─── Border Radius ──────────────────────────

export const radius = {
  /** Cards — 16px */
  card: 16,
  /** Buttons sm — 10px, md — 12px, lg — 14px */
  button: { sm: 10, md: 12, lg: 14 },
  /** Badges — 8px */
  badge: 8,
  /** Action buttons — 10px */
  actionBtn: 10,
  /** Select/dropdown — 12px (trigger), 14px (menu) */
  select: { trigger: 12, menu: 14 },
  /** Tabs container — 14px, tab item — 10px */
  tabs: { container: 14, item: 10 },
  /** Icon container — 10-14px depending on size */
  iconContainer: { sm: 10, md: 12, lg: 14 },
  /** Avatar — full circle */
  avatar: '50%',
  /** Pills — rounded-full */
  pill: 9999,
} as const

// ─── Spacing (button sizes from DS v2) ──────

export const buttonSizes = {
  sm: { padding: '8px 16px', fontSize: 13, borderRadius: 10, iconGap: 6 },
  md: { padding: '12px 24px', fontSize: 14, borderRadius: 12, iconGap: 8 },
  lg: { padding: '16px 32px', fontSize: 16, borderRadius: 14, iconGap: 10 },
} as const

// ─── Component Sizes ────────────────────────

export const componentSizes = {
  /** Action button (edit/copy/trash) */
  actionBtn: 38,
  /** AI Bot FAB */
  fab: 56,
  /** Stats card icon container */
  statsIcon: 36,
  /** Tool card icon container */
  toolIcon: 48,
  /** Empty state icon container */
  emptyStateIcon: 64,
  /** Avatar */
  avatar: { sm: 32, md: 40, lg: 44 },
  /** Navbar icon buttons */
  navIcon: 36,
} as const

// ─── Typography ─────────────────────────────

export const typography = {
  family: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  /** Commonly used text styles */
  styles: {
    sectionLabel: 'text-xs font-bold uppercase tracking-wide text-text-muted',
    cardTitle: 'text-base font-semibold',
    cardDescription: 'text-sm text-text-muted leading-relaxed',
    statValue: 'text-2xl font-bold tabular-nums',
    badgeText: 'text-[10px] font-bold uppercase tracking-[0.5px]',
  },
} as const

// ─── Animation Presets ──────────────────────

export const animations = {
  /** Section entrance — CSS class */
  fadeInUp: 'animate-fade-in-up',
  /** Empty state icon — CSS class */
  gentleBounce: 'animate-gentle-bounce',
  /** Progress bar fill — CSS class */
  shimmer: 'animate-shimmer',
  /** Notification badge pulse — CSS class */
  pulse: 'animate-ds-pulse',
  /** Stagger children — CSS class on parent */
  staggerList: 'stagger-list',
} as const

// ─── CSS Var Helpers ────────────────────────

/** Get a DS v2 CSS variable value for use in inline styles */
export function dsVar(name: string): string {
  return `var(--ds-${name})`
}

/** Common DS v2 surface styles as className */
export const surfaces = {
  /** Primary card surface — glass bg + border + shadow */
  card: 'bg-(--ds-surface) backdrop-blur-[var(--ds-backdrop)] border border-(--ds-border) rounded-2xl shadow-(--ds-card-shadow) hover:shadow-(--ds-card-shadow-hover) hover:-translate-y-1 transition-all duration-300',
  /** Static card — no hover */
  cardStatic: 'bg-(--ds-surface) backdrop-blur-[var(--ds-backdrop)] border border-(--ds-border) rounded-2xl shadow-(--ds-card-shadow)',
  /** Elevated surface */
  elevated: 'bg-(--ds-surface-elevated) backdrop-blur-[20px] border border-(--ds-border) rounded-2xl',
  /** Glass overlay */
  glass: 'bg-(--ds-glass) backdrop-blur-[var(--ds-backdrop)] border border-(--ds-border)',
} as const
