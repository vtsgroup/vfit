/**
 * Design System Showcase v10 — Ultra Professional Refinement
 *
 * Filosofia: Glass surfaces · 3D depth · Gradient accents · Perfect contrast
 * Baseado na qualidade visual de /dashboard/admin/design-system
 * 10 seções · 100+ componentes · Light & Dark · Animações premium · Sem emojis
 *
 * v10.0 Improvements:
 * - Bolder typography (800wt labels, 28px section headers, tighter tracking)
 * - All buttons have 1px solid border matching their 3D shadow color
 * - Secondary button redesign: zinc scale for visible depth in both modes
 * - Larger border-radius on buttons (12/14/16px) for modern feel
 * - More padding in buttons and cards for breathing room
 * - Consistent design language across all 100+ components
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  // Core UI
  Button, Input, Badge, Avatar, AvatarWithPlanBadge, AvatarGroup,
  // Cards
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  GlassCard, GlassStatsCard, GlassFeatureCard,
  StatsCard,
  // Actions
  ActionIconButton,
  // Forms
  MD3Input, MD3TextArea, MD3SearchBar, MD3Select,
  StyledSelect, UserSearch,
  Toggle, Checkbox, RadioGroup, RadioItem,
  // Navigation
  SlidingTabs, FilterPills, MD3Tabs, PageHeader,
  // Progress
  LinearProgress, CircularProgress, StepProgress, ProgressBarDS,
  // Display
  DSIcon, type DSIconName, DS_ICON_NAMES,
  Divider,
  // Feedback
  Alert, Modal, Accordion, AccordionItem, AccordionTrigger, AccordionContent, Tooltip, EmptyStateDS,
  // Skeleton
  SkeletonCard, SkeletonStatsGrid, SkeletonList, SkeletonForm, Shimmer,
  // Animation
  Stagger, StaggerItem,
} from '@/components/ui'

// @deprecated — Direct imports for showcase-only display (not used in production pages)
import { MD3Card, MD3CardHeader, MD3CardTitle, MD3CardContent } from '@/components/ui/md3-card'
import { ToolCard } from '@/components/ui/tool-card'
import { NotificationCard } from '@/components/ui/notification-card'
import { ActionButton3D, ActionCard3D } from '@/components/ui/action-button-3d'
import { ActionButtons } from '@/components/ui/action-buttons'
import { CustomSelect3D } from '@/components/ui/custom-select-3d'
import { MD3Badge, MD3Chip, MD3Status } from '@/components/ui/md3-badge'
import { AuthGuard } from '@/components/auth/auth-guard'

// ============================================
// ICONS — inline SVG for page chrome only
// ============================================
type IconProps = { size?: number; color?: string }
const Icons = {
  sparkles: ({ size = 20, color = 'currentColor' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" /><path d="M18 14l.7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14z" /></svg>
  ),
  sun: ({ size = 20, color = 'currentColor' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
  ),
  moon: ({ size = 20, color = 'currentColor' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" /></svg>
  ),
  back: ({ size = 20, color = 'currentColor' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
  ),
}

// ============================================
// THEME SYSTEM — mirrors DS page approach
// ============================================
const themes = {
  light: {
    bg: 'linear-gradient(180deg, #f8fafb 0%, #eef1f5 100%)',
    surface: 'rgba(255,255,255,0.95)',
    surfaceHover: 'rgba(255,255,255,1)',
    surfaceSolid: '#ffffff',
    glass: 'rgba(255,255,255,0.82)',
    border: 'rgba(0,0,0,0.07)',
    borderLight: 'rgba(0,0,0,0.04)',
    borderFocus: '#10b981',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#57687b',
    primary: '#10b981',
    primaryLight: '#34d399',
    primaryLighter: '#6ee7b7',
    primaryDark: '#059669',
    primaryDarker: '#047857',
    primaryBg: 'rgba(16,185,129,0.1)',
    secondary: '#d4d4d8',
    secondaryLight: '#e4e4e7',
    secondaryLighter: '#f4f4f5',
    secondaryDark: '#a1a1aa',
    secondaryDarker: '#71717a',
    secondaryText: '#18181b',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#d97706',
    accentDarker: '#b45309',
    ai: '#8b5cf6',
    aiLight: '#a78bfa',
    error: '#ef4444',
    errorBg: 'rgba(239,68,68,0.1)',
    success: '#10b981',
    info: '#3b82f6',
    neutral50: '#f8fafc',
    neutral100: '#f1f5f9',
    neutral200: '#e2e8f0',
    neutral300: '#cbd5e1',
    cardShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04), 0 12px 28px rgba(0,0,0,0.025)',
    cardShadowHover: '0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.04)',
    btn3dPrimary: '0 4px 0 #047857, 0 6px 14px rgba(5,150,105,0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
    btn3dPrimaryHover: '0 5px 0 #047857, 0 8px 20px rgba(5,150,105,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
    btn3dPrimaryActive: '0 1px 0 #047857, 0 2px 6px rgba(5,150,105,0.2), inset 0 2px 4px rgba(0,0,0,0.15)',
    btn3dSecondary: '0 4px 0 #52525b, 0 6px 18px rgba(82,82,91,0.35), inset 0 1px 0 rgba(255,255,255,0.7)',
    btn3dSecondaryHover: '0 6px 0 #52525b, 0 10px 28px rgba(82,82,91,0.4), inset 0 1px 0 rgba(255,255,255,0.75)',
    btn3dSecondaryActive: '0 1px 0 #52525b, 0 2px 6px rgba(82,82,91,0.2), inset 0 2px 4px rgba(0,0,0,0.12)',
    backdrop: 'blur(20px)',
  },
  dark: {
    bg: 'linear-gradient(180deg, #050a12 0%, #0b1120 100%)',
    surface: 'rgba(255,255,255,0.045)',
    surfaceHover: 'rgba(255,255,255,0.075)',
    surfaceSolid: '#0e1726',
    glass: 'rgba(255,255,255,0.035)',
    border: 'rgba(255,255,255,0.09)',
    borderLight: 'rgba(255,255,255,0.055)',
    borderFocus: '#10b981',
    text: '#f0f4f8',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    primary: '#10b981',
    primaryLight: '#34d399',
    primaryLighter: '#6ee7b7',
    primaryDark: '#059669',
    primaryDarker: '#047857',
    primaryBg: 'rgba(16,185,129,0.1)',
    secondary: '#52525b',
    secondaryLight: '#71717a',
    secondaryLighter: '#a1a1aa',
    secondaryDark: '#3f3f46',
    secondaryDarker: '#27272a',
    secondaryText: '#fafafa',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#d97706',
    accentDarker: '#b45309',
    ai: '#8b5cf6',
    aiLight: '#a78bfa',
    error: '#ef4444',
    errorBg: 'rgba(239,68,68,0.1)',
    success: '#10b981',
    info: '#3b82f6',
    neutral50: 'rgba(255,255,255,0.03)',
    neutral100: 'rgba(255,255,255,0.05)',
    neutral200: 'rgba(255,255,255,0.08)',
    neutral300: 'rgba(255,255,255,0.12)',
    cardShadow: '0 1px 2px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.3)',
    cardShadowHover: '0 4px 8px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.4)',
    btn3dPrimary: '0 4px 0 #047857, 0 6px 14px rgba(5,150,105,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
    btn3dPrimaryHover: '0 5px 0 #047857, 0 8px 20px rgba(5,150,105,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
    btn3dPrimaryActive: '0 1px 0 #047857, 0 2px 6px rgba(5,150,105,0.25), inset 0 2px 4px rgba(0,0,0,0.2)',
    btn3dSecondary: '0 4px 0 #27272a, 0 6px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
    btn3dSecondaryHover: '0 6px 0 #27272a, 0 10px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.16)',
    btn3dSecondaryActive: '0 1px 0 #27272a, 0 2px 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.3)',
    backdrop: 'blur(20px)',
  },
}

type Theme = typeof themes.light

// ============================================
// INLINE COMPONENTS — DS page philosophy
// ============================================

function ShowcaseCard({ children, t, style = {} }: { children: React.ReactNode; t: Theme; style?: React.CSSProperties }) {
  const [h, setH] = useState(false)
  const isDark = t.bg.includes('#050a12') || t.bg.includes('#0b1120')

  // v9 improvement: use dynamic tokens instead of fixed gradient
  const bgBase = isDark ? t.surface : 'rgba(255,255,255,0.97)'
  const bgHover = isDark ? t.surfaceHover : '#ffffff'
  const accentBorder = isDark ? t.primary + '20' : t.primary + '15'
  const subtleBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'

  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: h ? bgHover : bgBase,
      backdropFilter: t.backdrop,
      border: `1px solid ${h ? accentBorder : subtleBorder}`,
      borderRadius: 20, padding: '28px 32px',
      boxShadow: h ? t.cardShadowHover : t.cardShadow,
      transform: h ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1), box-shadow 300ms cubic-bezier(0.16,1,0.3,1), border-color 300ms ease, background 300ms ease',
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      {/* Glass shine — mode aware + top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px',
        background: isDark
          ? 'linear-gradient(90deg, transparent, ' + t.primary + '40, transparent)'
          : 'linear-gradient(90deg, transparent, ' + t.primary + '30, transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: isDark ? '50%' : '40%',
        background: isDark
          ? 'linear-gradient(180deg, rgba(255,255,255,0.04), transparent)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.1), transparent)',
        borderRadius: 'inherit', pointerEvents: 'none',
      }} />
      {children}
    </div>
  )
}

function Label({ children, t }: { children: React.ReactNode; t: Theme }) {
  return <div style={{ fontSize: 12.5, fontWeight: 800, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 14 }}>{children}</div>
}

function DemoBtn({ variant = 'primary', size = 'md', children, t, icon, onClick }: {
  variant?: 'primary' | 'secondary' | 'warning' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  t: Theme
  icon?: React.ReactNode
  onClick?: () => void
}) {
  const [state, setState] = useState<'idle' | 'hover' | 'active'>('idle')
  const sizes = { sm: { p: '8px 18px', fs: 13, br: 12, g: 6 }, md: { p: '12px 26px', fs: 14.5, br: 14, g: 8 }, lg: { p: '16px 34px', fs: 16, br: 16, g: 10 } }
  const s = sizes[size]
  const isH = state === 'hover', isA = state === 'active'
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: s.g,
    padding: s.p, border: 'none', borderRadius: s.br, fontWeight: 800, fontSize: s.fs,
    lineHeight: 1, cursor: 'pointer', userSelect: 'none', fontFamily: 'inherit',
    letterSpacing: '-0.02em',
    transition: 'transform 150ms cubic-bezier(0.16,1,0.3,1), box-shadow 150ms cubic-bezier(0.16,1,0.3,1)',
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      ...base, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.15)',
      border: `1px solid ${t.primaryDarker}`,
      background: `linear-gradient(180deg, ${isH ? t.primaryLighter : t.primaryLight} 0%, ${isH ? t.primaryLight : t.primary} 50%, ${isH ? t.primary : t.primaryDark} 100%)`,
      boxShadow: isA ? t.btn3dPrimaryActive : isH ? t.btn3dPrimaryHover : t.btn3dPrimary,
      transform: isA ? 'translateY(3px)' : isH ? 'translateY(-1px)' : 'translateY(0)',
    },
    secondary: {
      ...base,
      color: t.secondaryText,
      textShadow: t.text === '#0f172a'
        ? '0 1px 1px rgba(255,255,255,0.5)'
        : '0 1px 2px rgba(0,0,0,0.3)',
      border: `1px solid ${t.secondaryDarker}`,
      // Correct 3D gradient: light top → mid → dark bottom
      background: `linear-gradient(180deg, ${isH ? t.secondaryLighter : t.secondaryLight} 0%, ${t.secondary} 50%, ${isH ? t.secondaryDark : t.secondaryDarker} 100%)`,
      boxShadow: isA ? t.btn3dSecondaryActive : isH ? t.btn3dSecondaryHover : t.btn3dSecondary,
      transform: isA ? 'translateY(3px)' : isH ? 'translateY(-1px)' : 'translateY(0)',
    },
    warning: {
      ...base, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.15)',
      border: `1px solid ${t.accentDarker}`,
      background: `linear-gradient(180deg, ${isH ? '#fcd34d' : t.accentLight} 0%, ${isH ? t.accentLight : t.accent} 50%, ${isH ? t.accent : t.accentDark} 100%)`,
      boxShadow: isA ? `0 1px 0 ${t.accentDarker}` : isH ? `0 5px 0 ${t.accentDarker}, 0 8px 20px rgba(217,119,6,0.4)` : `0 4px 0 ${t.accentDarker}, 0 6px 14px rgba(217,119,6,0.35), inset 0 1px 0 rgba(255,255,255,0.2)`,
      transform: isA ? 'translateY(3px)' : isH ? 'translateY(-1px)' : 'translateY(0)',
    },
    danger: {
      ...base, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.15)',
      border: '1px solid #991b1b',
      background: `linear-gradient(180deg, #f87171 0%, ${t.error} 50%, #dc2626 100%)`,
      boxShadow: isA ? '0 1px 0 #b91c1c' : isH ? '0 5px 0 #b91c1c, 0 8px 20px rgba(239,68,68,0.4)' : '0 4px 0 #b91c1c, 0 6px 14px rgba(239,68,68,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
      transform: isA ? 'translateY(3px)' : isH ? 'translateY(-1px)' : 'translateY(0)',
    },
    ghost: {
      ...base, color: isH ? t.text : t.textSecondary,
      border: `1.5px solid ${isH ? t.primary + '40' : t.neutral300}`,
      background: isH ? `linear-gradient(180deg, ${t.surfaceHover}, ${t.neutral100})` : `linear-gradient(180deg, ${t.surfaceHover}, ${t.surface})`,
      boxShadow: isA ? `inset 0 2px 4px ${t.neutral200}` : isH ? `0 3px 0 ${t.neutral200}, 0 0 12px ${t.primary}15` : `0 2px 0 ${t.neutral200}, inset 0 1px 0 rgba(255,255,255,0.06)`,
      transform: isA ? 'translateY(2px)' : isH ? 'translateY(-1px)' : 'translateY(0)',
      backdropFilter: 'blur(8px)',
    },
  }
  return (
    <button
      onMouseEnter={() => setState('hover')} onMouseLeave={() => setState('idle')}
      onMouseDown={() => setState('active')} onMouseUp={() => setState('hover')}
      onClick={onClick} style={variants[variant] || variants.primary}
    >{icon}{children}</button>
  )
}

function StatCard({ icon, label, value, accent, t, delay = 0 }: {
  icon: React.ReactNode; label: string; value: string; accent: string; t: Theme; delay?: number
}) {
  const [h, setH] = useState(false)
  const isDark = t.bg.includes('#050a12') || t.bg.includes('#0b1120')
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: isDark
        ? 'linear-gradient(145deg, rgba(15,23,42,0.8), rgba(10,15,30,0.9))'
        : h ? '#ffffff' : 'rgba(255,255,255,0.97)',
      backdropFilter: t.backdrop,
      border: `1px solid ${h ? accent + '25' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
      borderRadius: 20, padding: '22px 24px',
      boxShadow: h
        ? isDark
          ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${accent}15`
          : `0 4px 12px rgba(0,0,0,0.04), 0 12px 36px rgba(0,0,0,0.06), 0 0 24px ${accent}10`
        : isDark
          ? '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03)'
          : '0 1px 2px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.035), 0 0 0 1px rgba(0,0,0,0.02)',
      transform: h ? 'translateY(-4px)' : 'translateY(0)',
      transition: 'all 350ms cubic-bezier(0.16,1,0.3,1)',
      animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both',
      animationDelay: `${delay}ms`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent 5%, ${accent}, transparent 95%)`, opacity: h ? 0.8 : isDark ? 0.3 : 0.5, transition: 'opacity 350ms' }} />
      {/* Subtle corner glow */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${accent}${h ? (isDark ? '15' : '0d') : (isDark ? '08' : '06')}, transparent 70%)`, transition: 'background 350ms', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 13,
          background: `linear-gradient(145deg, ${accent}dd, ${accent})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 14px ${accent}40, inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 3px ${accent}12`,
          position: 'relative',
        }}>
          {/* Glass shine on icon */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)', pointerEvents: 'none' }} />
          {icon}
        </div>
        <span style={{ fontSize: 11, color: isDark ? 'rgba(148,163,184,0.9)' : '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: t.text, letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function NavPill({ active, children, t, onClick, icon }: {
  active: boolean; children: React.ReactNode; t: Theme; onClick: () => void; icon?: React.ReactNode
}) {
  const [h, setH] = useState(false)
  const isDark = t.bg.includes('#050a12') || t.bg.includes('#0b1120')
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px',
      borderRadius: 12, fontSize: 13.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
      letterSpacing: '-0.02em',
      background: active
        ? `linear-gradient(180deg, ${t.primaryLight}, ${t.primary})`
        : isDark
          ? (h ? t.surfaceHover : t.surface)
          : (h ? '#ffffff' : 'rgba(255,255,255,0.8)'),
      color: active ? '#fff' : h ? t.text : t.textSecondary,
      boxShadow: active
        ? `0 3px 0 ${t.primaryDarker}, 0 4px 12px rgba(5,150,105,0.3), inset 0 1px 0 rgba(255,255,255,0.15)`
        : isDark
          ? (h ? `0 2px 0 ${t.neutral200}` : 'none')
          : (h ? '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)' : '0 1px 3px rgba(0,0,0,0.03)'),
      border: active ? '1.5px solid transparent' : `1.5px solid ${isDark ? (h ? t.neutral300 : t.borderLight) : (h ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)')}`,
      transform: h && !active ? 'translateY(-1px)' : 'translateY(0)',
      transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
    }}>{icon}{children}</button>
  )
}

function ShimmerBar({ value, max, accent = '#10b981' }: { value: number; max: number; accent?: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ width: '100%', height: 10, borderRadius: 8, background: 'rgba(128,128,128,0.12)', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 8,
        background: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`,
        backgroundSize: '200% 100%', animation: 'shimmer 2s ease-in-out infinite',
        transition: 'width 600ms cubic-bezier(0.16,1,0.3,1)',
        boxShadow: `0 0 10px ${accent}40, inset 0 1px 0 rgba(255,255,255,0.25)`,
      }} />
    </div>
  )
}

// ============================================
// MOTION SECTION HELPERS
// ============================================

function EasingRow({ name, token, curve, color, use, t }: {
  name: string; token: string; curve: string; color: string; use: string; t: Theme
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 14px', borderRadius: 12, border: `1px solid ${hovered ? color + '30' : t.border}`, background: hovered ? color + '06' : 'transparent', transition: 'all 200ms ease', cursor: 'default' }}
    >
      <div style={{ width: 72, flexShrink: 0, fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>{name}</div>
      <div style={{ flex: 1, height: 6, borderRadius: 9999, background: t.border, overflow: 'hidden', position: 'relative' as const }}>
        <div style={{
          height: '100%', borderRadius: 9999,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          width: hovered ? '100%' : '0%',
          transition: `width 420ms ${curve}`,
        }} />
      </div>
      <div style={{ width: 200, fontSize: 12, color: t.textSecondary, flexShrink: 0 }}>{use}</div>
      <div style={{ width: 160, fontSize: 10, color: t.textMuted, fontFamily: 'monospace', textAlign: 'right' as const, flexShrink: 0 }}>{token}</div>
    </div>
  )
}

function MotionStaggerDemo({ t }: { t: Theme }) {
  const [key, setKey] = useState(0)
  const items = ['Aluno cadastrado', 'Treino criado', 'Pagamento recebido', 'Avaliação física', 'Meta atingida', 'Notificação enviada']
  return (
    <div>
      <button
        onClick={() => setKey(k => k + 1)}
        style={{ marginBottom: 16, padding: '8px 18px', borderRadius: 10, border: `1px solid ${t.primary}40`, background: t.primaryBg, color: t.primary, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms ease' }}
      >
        Replay
      </button>
      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <div
            key={item}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderRadius: 12, background: t.neutral50, border: `1px solid ${t.border}`,
              opacity: 0, transform: 'translateY(16px)',
              animation: `fadeInUp 420ms cubic-bezier(0.05,0.7,0.1,1.0) ${i * 50}ms both`,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.primary, boxShadow: `0 0 8px ${t.primary}60`, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{item}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: t.textMuted, fontFamily: 'monospace' }}>+{i * 50}ms</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// MAIN SHOWCASE
// ============================================
export default function ShowcasePage() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark')
  const [section, setSection] = useState('foundations')
  const [inputVal, setInputVal] = useState('')
  const [textareaVal, setTextareaVal] = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [selectVal, setSelectVal] = useState('')
  const [styledSelectVal, setStyledSelectVal] = useState('')
  const [toggleVal, setToggleVal] = useState(true)
  const [checkVal, setCheckVal] = useState(false)
  const [radioVal, setRadioVal] = useState('opt1')
  const [activeTab, setActiveTab] = useState('overview')
  const [activeFilter, setActiveFilter] = useState('all')
  const [md3TabId, setMd3TabId] = useState('treinos')
  const [showModal, setShowModal] = useState(false)
  const [iconFilter, setIconFilter] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const t = themes[mode]
  const originalTheme = useRef<string | null>(null)

  // Sync <html> class with showcase mode so dark:/light: Tailwind variants work
  useEffect(() => {
    const html = document.documentElement
    if (!originalTheme.current) {
      originalTheme.current = html.classList.contains('light') ? 'light' : 'dark'
    }
    if (mode === 'light') {
      html.classList.remove('dark')
      html.classList.add('light')
      html.style.colorScheme = 'light'
    } else {
      html.classList.remove('light')
      html.classList.add('dark')
      html.style.colorScheme = 'dark'
    }
    return () => {
      const restore = originalTheme.current || 'dark'
      html.classList.remove('light', 'dark')
      html.classList.add(restore)
      html.style.colorScheme = restore
    }
  }, [mode])

  const sections = [
    { id: 'foundations', label: 'Foundations', icon: 'sparkles' as DSIconName },
    { id: 'buttons', label: 'Botoes 3D', icon: 'target' as DSIconName },
    { id: 'cards', label: 'Cards', icon: 'copy' as DSIconName },
    { id: 'forms', label: 'Formularios', icon: 'edit' as DSIconName },
    { id: 'navigation', label: 'Navegacao', icon: 'menu' as DSIconName },
    { id: 'display', label: 'Data Display', icon: 'chart' as DSIconName },
    { id: 'feedback', label: 'Feedback', icon: 'bell' as DSIconName },
    { id: 'motion', label: 'Motion', icon: 'activity' as DSIconName },
    { id: 'icons', label: 'Iconografia', icon: 'image' as DSIconName },
    { id: 'patterns', label: 'Patterns', icon: 'home' as DSIconName },
  ]

  return (
    <AuthGuard>
      <div className={mode === 'light' ? 'light' : 'dark'} style={{
        minHeight: '100vh', background: t.bg, padding: '24px 16px',
        fontFamily: "var(--font-dm-sans, 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif)",
        color: t.text, transition: 'background 400ms ease',
      }}>
        <style>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes gentleBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          @keyframes shimmer { 0%, 100% { background-position: 0% 0%; } 50% { background-position: 100% 0%; } }
          @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 0 8px rgba(16,185,129,0); } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
          @keyframes dot-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.8); } }
          @keyframes shine-sweep { 0% { left: -100%; } 100% { left: 100%; } }
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 3px; }
        `}</style>

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* ───── HEADER ───── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link href="/dashboard/admin/design-system" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 10, background: t.neutral100,
                border: `1px solid ${t.borderLight}`, textDecoration: 'none', color: t.textSecondary,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}><Icons.back size={18} /></Link>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `linear-gradient(135deg, ${t.primaryLight}, ${t.primaryDark})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              }}><Icons.sparkles size={22} color="#fff" /></div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, margin: 0, fontFamily: "var(--font-syne, 'Syne', sans-serif)" }}>
                    <span style={{
                      background: `linear-gradient(90deg, ${t.primary}, ${t.ai}, ${t.accentLight}, ${t.primary})`,
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'gradient-shift 6s linear infinite'
                    }}>
                      Design System Showcase
                    </span>
                  </h1>
                  {/* v9.0 badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8,
                    background: `linear-gradient(135deg, ${t.primary}15, ${t.primary}08)`,
                    border: `1px solid ${t.primary}30`,
                    backdropFilter: 'blur(8px)',
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: t.primary,
                      animation: 'dot-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite'
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: t.primary, letterSpacing: 0.5, textTransform: 'uppercase' }}>v10.0</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>100+ componentes · 10 seções · WCAG AA · Athletic Luxury Dark</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, background: t.neutral100, padding: 4, borderRadius: 12, border: `1px solid ${t.borderLight}` }}>
              {([{ id: 'light' as const, Icon: Icons.sun }, { id: 'dark' as const, Icon: Icons.moon }]).map(({ id, Icon }) => (
                <button key={id} onClick={() => setMode(id)} style={{
                  width: 40, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: mode === id ? `linear-gradient(180deg, ${t.primaryLight}, ${t.primary})` : 'transparent',
                  color: mode === id ? '#fff' : t.textMuted,
                  boxShadow: mode === id ? `0 2px 0 ${t.primaryDark}` : 'none',
                  transition: 'all 200ms ease',
                }}><Icon size={16} /></button>
              ))}
            </div>
          </div>

          {/* ───── SECTION NAV ───── */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap', animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) 100ms both' }}>
            {sections.map((s) => (
              <NavPill key={s.id} active={section === s.id} t={t} onClick={() => setSection(s.id)} icon={<DSIcon name={s.icon} size={14} />}>
                {s.label}
              </NavPill>
            ))}
          </div>

          {/* ═══════════ BUTTONS ═══════════ */}
          {section === 'buttons' && (
            <div style={{ animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.03em' }}>
                <span style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.primaryLight})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Sistema de Botoes 3D
                </span>
                <span style={{ fontSize: 15, fontWeight: 500, color: t.textMuted, marginLeft: 10 }}>— {mode === 'light' ? 'Modo Claro' : 'Modo Escuro'}</span>
              </h2>

              {/* 3D Inline Buttons */}
              {([
                { title: 'Primary (Verde)', variant: 'primary' as const, desc: 'CTA principal — gradient 3-stop + depth shadow + translateY', examples: [
                  { s: 'sm' as const, t: 'Copiar', icon: undefined },
                  { s: 'md' as const, t: 'Gerar Treino', icon: <DSIcon name="sparkles" size={16} className="text-white" /> },
                  { s: 'lg' as const, t: '+ Nova Cobranca', icon: <DSIcon name="plus" size={18} className="text-white" /> },
                ]},
                { title: 'Secondary (Slate)', variant: 'secondary' as const, desc: 'Acao secundaria — profundidade dark slate, texto claro em dark / escuro em light', examples: [
                  { s: 'sm' as const, t: 'Copiar Link', icon: <DSIcon name="copy" size={14} /> },
                  { s: 'md' as const, t: 'Voltar', icon: undefined },
                  { s: 'lg' as const, t: 'Saques PIX', icon: <DSIcon name="download" size={18} /> },
                ]},
                { title: 'Warning (Amber)', variant: 'warning' as const, desc: 'Acoes financeiras — amber gradient com depth', examples: [
                  { s: 'sm' as const, t: 'Cobrar', icon: undefined },
                  { s: 'md' as const, t: '+ Nova Cobranca', icon: <DSIcon name="plus" size={16} className="text-white" /> },
                ]},
                { title: 'Danger (Vermelho)', variant: 'danger' as const, desc: 'Acoes destrutivas — vermelho com profundidade', examples: [
                  { s: 'sm' as const, t: 'Excluir', icon: <DSIcon name="trash" size={14} className="text-white" /> },
                  { s: 'md' as const, t: 'Remover Aluno', icon: undefined },
                ]},
                { title: 'Ghost (Outline)', variant: 'ghost' as const, desc: 'Acao terciaria — borda sutil com depth leve', examples: [
                  { s: 'sm' as const, t: 'Filtrar', icon: <DSIcon name="filter" size={14} /> },
                  { s: 'md' as const, t: 'Copiar Link', icon: <DSIcon name="link" size={16} /> },
                  { s: 'md' as const, t: 'Cancelar', icon: undefined },
                ]},
              ]).map((group) => (
                <ShowcaseCard key={group.variant} t={t} style={{ marginBottom: 16 }}>
                  <Label t={t}>{group.title}</Label>
                  <div style={{ fontSize: 14, color: t.textMuted, marginBottom: 16 }}>{group.desc}</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {group.examples.map((ex, i) => (
                      <DemoBtn key={i} variant={group.variant} size={ex.s} t={t} icon={ex.icon}>{ex.t}</DemoBtn>
                    ))}
                  </div>
                </ShowcaseCard>
              ))}

              {/* Real <Button> component */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>{'Componente <Button> — Todas as 9 Variantes'}</Label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="ghost-danger">Ghost Danger</Button>
                  <Button variant="workout">Workout</Button>
                  <Button variant="assessment">Assessment</Button>
                  <Button variant="payment">Payment</Button>
                </div>
              </ShowcaseCard>

              {/* Button States */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Estados e Tamanhos</Label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button loading>Salvando...</Button>
                  <Button disabled>Desabilitado</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon"><DSIcon name="plus" size={18} /></Button>
                  <Button variant="primary" size="sm"><DSIcon name="sparkles" size={14} className="text-white" /> Com Icone</Button>
                </div>
              </ShowcaseCard>

              {/* ActionButton3D */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>ActionButton3D — Cores Framer Motion</Label>
                <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 16 }}>Botoes com profundidade 3D e animacao spring — 8 cores disponiveis</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <ActionButton3D color="green" label="Gerar Treino" icon={<DSIcon name="sparkles" size={16} className="text-white" />} />
                  <ActionButton3D color="violet" label="Assistente IA" icon={<DSIcon name="brainCircuit" size={16} className="text-white" />} />
                  <ActionButton3D color="amber" label="Nova Cobranca" icon={<DSIcon name="dollar" size={16} className="text-white" />} />
                  <ActionButton3D color="blue" label="Indicar" size="sm" icon={<DSIcon name="users" size={14} className="text-white" />} />
                  <ActionButton3D color="rose" label="Remover" size="sm" icon={<DSIcon name="trash" size={14} className="text-white" />} />
                  <ActionButton3D color="cyan" label="Exportar" size="sm" icon={<DSIcon name="download" size={14} className="text-white" />} />
                  <ActionButton3D color="orange" label="Lembrete" size="sm" icon={<DSIcon name="bell" size={14} className="text-white" />} />
                </div>
              </ShowcaseCard>

              {/* ActionCard3D */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>ActionCard3D — Cards de Acao Rapida</Label>
                <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 16, lineHeight: 1.5 }}>Cards com hover 3D, glow colorido e feedback haptico — acesso rapido as funcoes mais usadas</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  <ActionCard3D color="green" icon={<DSIcon name="sparkles" size={22} className="text-white" />} label="Gerar Treino" description="IA personalizada" onClick={() => {}} />
                  <ActionCard3D color="violet" icon={<DSIcon name="brainCircuit" size={22} className="text-white" />} label="Assistente IA" description="Tire duvidas" onClick={() => {}} />
                  <ActionCard3D color="amber" icon={<DSIcon name="dollar" size={22} className="text-white" />} label="Nova Cobranca" description="PIX, boleto, cartao" onClick={() => {}} />
                  <ActionCard3D color="cyan" icon={<DSIcon name="users" size={22} className="text-white" />} label="Novo Aluno" description="Cadastrar aluno" onClick={() => {}} />
                  <ActionCard3D color="rose" icon={<DSIcon name="heart" size={22} className="text-white" />} label="Avaliacoes" description="Composicao corporal" onClick={() => {}} />
                  <ActionCard3D color="blue" icon={<DSIcon name="calendar" size={22} className="text-white" />} label="Agenda" description="Gerenciar horarios" onClick={() => {}} />
                </div>
              </ShowcaseCard>

              {/* ActionIconButton & ActionButtons */}
              <ShowcaseCard t={t}>
                <Label t={t}>ActionIconButton e ActionButtons</Label>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 10 }}>Botoes de icone individuais</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ActionIconButton icon={<DSIcon name="edit" size={16} />} />
                      <ActionIconButton icon={<DSIcon name="copy" size={16} />} />
                      <ActionIconButton icon={<DSIcon name="share" size={16} />} />
                      <ActionIconButton icon={<DSIcon name="download" size={16} />} />
                      <ActionIconButton icon={<DSIcon name="trash" size={16} />} destructive />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 10 }}>Grupo de acoes agrupadas</div>
                    <ActionButtons actions={[
                      { icon: 'edit' as DSIconName, onClick: () => {}, tooltip: 'Editar' },
                      { icon: 'copy' as DSIconName, onClick: () => {}, tooltip: 'Copiar' },
                      { icon: 'share' as DSIconName, onClick: () => {}, tooltip: 'Compartilhar' },
                      { icon: 'trash' as DSIconName, onClick: () => {}, tooltip: 'Excluir', danger: true },
                    ]} />
                  </div>
                </div>
              </ShowcaseCard>
            </div>
          )}

          {/* ═══════════ CARDS ═══════════ */}
          {section === 'cards' && (
            <div style={{ animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.03em' }}>
                <span style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Cards
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: t.textMuted, marginLeft: 10 }}>— {mode === 'light' ? 'Claro' : 'Escuro'}</span>
              </h2>

              {/* Inline Stats Cards */}
              <Label t={t}>Stats Cards Inline — Icones Gradiente</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
                <StatCard icon={<DSIcon name="check" size={20} className="text-white" />} label="Treinos Concluidos" value="127" accent="#10b981" t={t} delay={0} />
                <StatCard icon={<DSIcon name="star" size={20} className="text-white" />} label="Streak Atual" value="14 dias" accent="#f97316" t={t} delay={60} />
                <StatCard icon={<DSIcon name="sparkles" size={20} className="text-white" />} label="Conquistas" value="24" accent="#eab308" t={t} delay={120} />
                <StatCard icon={<DSIcon name="chart" size={20} className="text-white" />} label="Avaliacoes" value="8" accent="#8b5cf6" t={t} delay={180} />
              </div>

              {/* Real StatsCard Component */}
              <Label t={t}>{'Componente <StatsCard> — DS Real'}</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
                <StatsCard icon="users" label="Alunos Ativos" value={42} accent="#10b981" />
                <StatsCard icon="dollar" label="Receita Mensal" value="R$ 4.200" accent="#f59e0b" badge={{ text: '+12%', icon: 'chart' }} />
                <StatsCard icon="sparkles" label="Treinos Gerados" value={318} accent="#8b5cf6" />
                <StatsCard icon="heart" label="Satisfacao" value="98%" accent="#ef4444" />
              </div>

              {/* Real ToolCard Component */}
              <Label t={t}>{'Componente <ToolCard> — Ferramentas'}</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 28 }}>
                <ToolCard icon="wand" title="Gerar Treino com IA" description="Crie treinos personalizados baseado no perfil do aluno" accent="#10b981" onClick={() => {}} />
                <ToolCard icon="brainCircuit" title="Assistente IA" description="Tire duvidas e obtenha insights sobre seus alunos" accent="#3b82f6" onClick={() => {}} />
                <ToolCard icon="sparkles" title="Gerador de Conteudo" description="Crie posts para Instagram, stories e e-mails" accent="#f59e0b" onClick={() => {}} />
                <ToolCard icon="dollar" title="Gestao Financeira" description="Cobranças, saques e relatorios" accent="#8b5cf6" locked />
              </div>

              {/* Real Card Component */}
              <Label t={t}>{'Componente <Card> — Base do DS'}</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 28 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Titulo do Card</CardTitle>
                    <CardDescription>Descricao opcional com informacoes secundarias</CardDescription>
                  </CardHeader>
                  <CardContent><p style={{ fontSize: 14 }}>Conteudo principal do card. Aceita qualquer componente React.</p></CardContent>
                  <CardFooter><Button size="sm">Acao</Button></CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Card com Badge</CardTitle>
                    <CardDescription>Exemplo com badge integrado</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge variant="success">Ativo</Badge>
                      <Badge variant="premium">Premium</Badge>
                      <Badge variant="info">IA</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* GlassCard Variants */}
              <Label t={t}>{'GlassCard — 6 Variantes'}</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
                {(['surface', 'glass', 'elevated', 'outline', 'glow', 'gradient'] as const).map((v) => (
                  <GlassCard key={v} variant={v} hover padding="md">
                    <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{v}</div>
                    <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>GlassCard variant</div>
                  </GlassCard>
                ))}
              </div>

              {/* GlassStatsCard & GlassFeatureCard */}
              <Label t={t}>GlassStatsCard e GlassFeatureCard</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
                <GlassStatsCard title="Alunos" value={42} change={{ value: 12, label: 'este mes' }} icon={<DSIcon name="users" size={20} />} />
                <GlassStatsCard title="Receita" value="R$ 18.4k" change={{ value: -3, label: 'vs anterior' }} icon={<DSIcon name="dollar" size={20} />} variant="gradient" />
                <GlassFeatureCard icon={<DSIcon name="sparkles" size={24} />} title="Geracao IA" description="Treinos personalizados automaticamente" />
                <GlassFeatureCard icon={<DSIcon name="brain" size={24} />} title="Assistente" description="Insights e recomendacoes" iconColor="text-violet-500" />
              </div>

              {/* MD3Card Variants */}
              <Label t={t}>{'MD3Card — 5 Variantes com Shine e Press'}</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
                {(['filled', 'elevated', 'outlined', 'glass', 'tonal'] as const).map((v) => (
                  <MD3Card key={v} variant={v} interactive shine pressable padding="md">
                    <MD3CardHeader><MD3CardTitle>{v.charAt(0).toUpperCase() + v.slice(1)}</MD3CardTitle></MD3CardHeader>
                    <MD3CardContent><p style={{ fontSize: 13 }}>MD3Card com shine sweep + press feedback</p></MD3CardContent>
                  </MD3Card>
                ))}
              </div>

              {/* NotificationCard */}
              <Label t={t}>{'Componente <NotificationCard>'}</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                <NotificationCard icon="dollar" title="Pagamento Recebido" description="Victor Agostinho pagou R$ 150,00 via PIX" timestamp="Ha 2 minutos" unread />
                <NotificationCard icon="users" title="Novo Aluno" description="Camila Ferreira se cadastrou na plataforma" timestamp="Ha 15 minutos" />
                <NotificationCard icon="bell" title="Lembrete" description="3 cobranças vencem amanha" timestamp="Ha 1 hora" />
              </div>

              {/* Glassmorphism Layers */}
              <Label t={t}>Glassmorphism — Camadas de Vidro</Label>
              <div style={{ position: 'relative', height: 220, marginBottom: 28, borderRadius: 16, overflow: 'hidden', background: `linear-gradient(135deg, ${t.primary}15, ${t.ai}10, ${t.accent}08)` }}>
                <div style={{ position: 'absolute', top: 16, left: 16, width: '65%', height: 130, borderRadius: 16, background: `${t.primary}18`, backdropFilter: 'blur(8px)', border: `1px solid ${t.primary}20`, padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Camada 1 — blur(8px)</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>Menor desfoque, mais transparencia</div>
                </div>
                <div style={{ position: 'absolute', top: 40, left: '18%', width: '65%', height: 130, borderRadius: 16, background: `${t.info}15`, backdropFilter: 'blur(16px)', border: `1px solid ${t.info}20`, padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Camada 2 — blur(16px)</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>Desfoque padrao do sistema</div>
                </div>
                <div style={{ position: 'absolute', top: 68, left: '35%', width: '63%', height: 130, borderRadius: 16, background: `${t.ai}12`, backdropFilter: 'blur(24px)', border: `1px solid ${t.ai}20`, padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Camada 3 — blur(24px)</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>Maximo desfoque, superficie solida</div>
                </div>
              </div>

              {/* Empty State */}
              <Label t={t}>Empty State Animado</Label>
              <ShowcaseCard t={t} style={{ textAlign: 'center', padding: '48px 32px' }}>
                <div style={{
                  width: 64, height: 64, margin: '0 auto 20px', borderRadius: 20,
                  background: `linear-gradient(135deg, ${t.primary}20, ${t.ai}10)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'float 3s ease-in-out infinite',
                }}><DSIcon name="sparkles" size={28} className="text-brand-primary" /></div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: t.text }}>Nenhum treino criado</div>
                <div style={{ fontSize: 14, color: t.textMuted, maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.5 }}>
                  Comece gerando treinos personalizados para seus alunos com IA.
                </div>
                <DemoBtn variant="primary" t={t} icon={<DSIcon name="sparkles" size={16} className="text-white" />}>Gerar Primeiro Treino</DemoBtn>
              </ShowcaseCard>
            </div>
          )}

          {/* ═══════════ FORMS ═══════════ */}
          {section === 'forms' && (
            <div style={{ animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.03em' }}>
                <span style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.info})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Formularios
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: t.textMuted, marginLeft: 10 }}>— {mode === 'light' ? 'Claro' : 'Escuro'}</span>
              </h2>

              {/* Basic Input */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>{'Componente <Input> — Base com Label, Error, Hint'}</Label>
                <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                    <Input label="Nome completo" placeholder="Digite o nome" autoComplete="off" />
                    <Input label="Email" type="email" placeholder="email@exemplo.com" autoComplete="off" />
                    <Input label="Campo com erro" placeholder="Campo invalido" error="Este campo e obrigatorio" autoComplete="off" />
                    <Input label="Com dica" type="password" placeholder="Minimo 8 caracteres" hint="Use letras, numeros e simbolos" autoComplete="new-password" />
                  </div>
                </div>
                <div style={{ borderRadius: 14, padding: '20px 24px', marginTop: 12, background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.textSecondary, marginRight: 6 }} />
                    Estado Desabilitado
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Input label="Campo desabilitado" placeholder="Nao editavel" disabled autoComplete="off" />
                    <Input label="Com valor fixo" value="personal@vfit.app.br" disabled autoComplete="off" />
                  </div>
                </div>
              </ShowcaseCard>

              {/* MD3 Inputs — Outlined vs Filled */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>MD3Input — Outlined vs Filled</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.primary, marginRight: 6 }} />
                      Outlined (Default)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <MD3Input label="Nome completo" placeholder="Digite o nome" value={inputVal} onChange={(e) => setInputVal(e.target.value)} variant="outlined" />
                      <MD3Input label="Com helper text" placeholder="email@exemplo.com" helperText="Insira um email valido" variant="outlined" />
                      <MD3Input label="Com erro" placeholder="Campo invalido" error="Este campo e obrigatorio" variant="outlined" />
                    </div>
                  </div>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.info, marginRight: 6 }} />
                      Filled (Bottom border)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <MD3Input label="Nome completo" placeholder="Digite o nome" variant="filled" />
                      <MD3Input label="Com helper text" placeholder="email@exemplo.com" helperText="Insira um email valido" variant="filled" />
                      <MD3Input label="Desabilitado" placeholder="—" variant="filled" disabled />
                    </div>
                  </div>
                </div>
              </ShowcaseCard>

              {/* MD3Input Sizes + Icons */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>MD3Input — Tamanhos e Icones</Label>
                <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.accent, marginRight: 6 }} />
                    3 Tamanhos: SM · MD · LG
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    <MD3Input label="Small" placeholder="SM" size="sm" leadingIcon={<DSIcon name="search" size={14} />} />
                    <MD3Input label="Medium (default)" placeholder="MD" size="md" leadingIcon={<DSIcon name="users" size={16} />} />
                    <MD3Input label="Large" placeholder="LG" size="lg" leadingIcon={<DSIcon name="edit" size={18} />} trailingIcon={<DSIcon name="check" size={18} />} />
                  </div>
                </div>
              </ShowcaseCard>

              {/* TextArea standalone */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>MD3TextArea — Area de Texto com Floating Label</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <MD3TextArea label="Observacoes" placeholder="Notas sobre o aluno..." value={textareaVal} onChange={(e) => setTextareaVal(e.target.value)} rows={4} />
                  </div>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.error}06, ${t.error}03)`, border: `1px solid ${t.error}15` }}>
                    <MD3TextArea label="Com erro" placeholder="Descricao obrigatoria..." error="Campo obrigatorio — minimo 20 caracteres" rows={4} />
                  </div>
                </div>
              </ShowcaseCard>

              {/* SearchBar standalone */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>MD3SearchBar — Busca com Clear Button</Label>
                <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <MD3SearchBar placeholder="Buscar alunos..." value={searchVal} onChange={(e) => setSearchVal(e.target.value)} onClear={() => setSearchVal('')} />
                    <MD3SearchBar placeholder="Buscar exercicios..." size="sm" />
                  </div>
                </div>
              </ShowcaseCard>

              {/* MD3Select — Full Featured */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>MD3Select — Outlined vs Filled com Features</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.primary, marginRight: 6 }} />
                      Outlined + HelperText
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <MD3Select label="Tipo de treino" helperText="Selecione o objetivo do treino" options={[
                        { value: '', label: 'Selecione...' },
                        { value: 'hipertrofia', label: 'Hipertrofia', description: 'Ganho de massa' },
                        { value: 'cardio', label: 'Cardio', description: 'Resistencia' },
                        { value: 'funcional', label: 'Funcional', description: 'Mobilidade' },
                      ]} value={selectVal} onChange={setSelectVal} variant="outlined" />
                      <MD3Select label="Com erro" error="Selecione uma opcao" options={[
                        { value: '', label: 'Selecione...' },
                      ]} value="" onChange={() => {}} variant="outlined" />
                    </div>
                  </div>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.info, marginRight: 6 }} />
                      Filled + Sizes
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <MD3Select label="Small" size="sm" options={[
                        { value: 'mensal', label: 'Mensal' }, { value: 'trimestral', label: 'Trimestral' },
                      ]} value="mensal" onChange={() => {}} variant="filled" />
                      <MD3Select label="Medium" size="md" options={[
                        { value: 'mensal', label: 'Mensal' }, { value: 'trimestral', label: 'Trimestral' },
                      ]} value="mensal" onChange={() => {}} variant="filled" />
                      <MD3Select label="Desabilitado" options={[
                        { value: 'x', label: 'Bloqueado' },
                      ]} value="x" onChange={() => {}} variant="filled" disabled />
                    </div>
                  </div>
                </div>
              </ShowcaseCard>

              {/* Custom Select 3D + StyledSelect */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Selects Customizados — 3D Depth e Styled</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.accent, marginRight: 6 }} />
                      CustomSelect3D — Efeito Depth
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <CustomSelect3D
                        options={[{ value: 'all', label: 'Todos os tipos' }, { value: 'personal', label: 'Personal' }, { value: 'aluno', label: 'Aluno' }]}
                        value="all" onChange={() => {}}
                      />
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, marginBottom: 6 }}>Forma de pagamento</div>
                      <CustomSelect3D
                        options={[{ value: 'pix', label: 'PIX' }, { value: 'boleto', label: 'Boleto' }, { value: 'cartao', label: 'Cartao' }]}
                        value="pix" onChange={() => {}}
                      />
                    </div>
                  </div>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.ai, marginRight: 6 }} />
                      StyledSelect — Normal vs Compact
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <StyledSelect
                        options={[{ value: '', label: 'Selecione...' }, { value: 'mensal', label: 'Mensal' }, { value: 'trimestral', label: 'Trimestral' }, { value: 'anual', label: 'Anual' }]}
                        value={styledSelectVal} onChange={setStyledSelectVal} placeholder="Normal..."
                      />
                      <StyledSelect
                        options={[{ value: 'ativo', label: 'Ativos' }, { value: 'inativo', label: 'Inativos' }, { value: 'todos', label: 'Todos' }]}
                        value="ativo" onChange={() => {}} placeholder="Compact..." compact
                      />
                    </div>
                  </div>
                </div>
              </ShowcaseCard>

              {/* UserSearch */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>{'Componente <UserSearch> — Busca com Filtro'}</Label>
                <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <UserSearch
                    placeholder="Buscar alunos..."
                    onSearch={() => {}}
                    filterOptions={[
                      { value: 'all', label: 'Todos' },
                      { value: 'active', label: 'Ativos' },
                      { value: 'inactive', label: 'Inativos' },
                    ]}
                    filterValue="all"
                    onFilterChange={() => {}}
                  />
                </div>
              </ShowcaseCard>

              {/* Toggle with sizes and description */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Toggle — Tamanhos e Descricao</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.primary, marginRight: 6 }} />
                      3 Tamanhos
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Toggle label="Small" size="sm" checked={toggleVal} onCheckedChange={setToggleVal} />
                      <Toggle label="Medium (default)" size="md" checked={toggleVal} onCheckedChange={setToggleVal} />
                      <Toggle label="Large" size="lg" checked={toggleVal} onCheckedChange={setToggleVal} />
                    </div>
                  </div>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.info, marginRight: 6 }} />
                      Com Descricao + Estados
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Toggle label="Notificacoes push" description="Receba alertas de pagamentos e mensagens" checked={toggleVal} onCheckedChange={setToggleVal} />
                      <Toggle label="Modo escuro" description="Alterna entre tema claro e escuro" checked={mode === 'dark'} onCheckedChange={() => setMode(mode === 'dark' ? 'light' : 'dark')} />
                      <Toggle label="Desabilitado" description="Esta opcao nao pode ser alterada" checked={false} onCheckedChange={() => {}} disabled />
                    </div>
                  </div>
                </div>
              </ShowcaseCard>

              {/* Checkbox with indeterminate and description */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Checkbox — Indeterminate, Descricao e Tamanhos</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.primary, marginRight: 6 }} />
                      Estados
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <Checkbox label="Marcado" checked={true} onCheckedChange={() => {}} />
                      <Checkbox label="Desmarcado" checked={checkVal} onCheckedChange={setCheckVal} />
                      <Checkbox label="Indeterminate" indeterminate checked={false} onCheckedChange={() => {}} />
                      <Checkbox label="Desabilitado" checked={false} onCheckedChange={() => {}} disabled />
                    </div>
                  </div>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.info, marginRight: 6 }} />
                      3 Tamanhos
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <Checkbox label="Small" size="sm" checked={true} onCheckedChange={() => {}} />
                      <Checkbox label="Medium" size="md" checked={true} onCheckedChange={() => {}} />
                      <Checkbox label="Large" size="lg" checked={true} onCheckedChange={() => {}} />
                    </div>
                  </div>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.accent, marginRight: 6 }} />
                      Com Descricao
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <Checkbox label="Aceito os termos" description="Li e concordo com os termos de uso" checked={checkVal} onCheckedChange={setCheckVal} />
                      <Checkbox label="Newsletter" description="Receba novidades semanalmente" checked={true} onCheckedChange={() => {}} />
                    </div>
                  </div>
                </div>
              </ShowcaseCard>

              {/* RadioGroup with horizontal + card variant */}
              <ShowcaseCard t={t}>
                <Label t={t}>RadioGroup — Vertical, Horizontal e Card Variant</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.primary, marginRight: 6 }} />
                      Vertical (Default)
                    </div>
                    <RadioGroup value={radioVal} onValueChange={setRadioVal}>
                      <RadioItem value="opt1" label="Hipertrofia" description="Foco em ganho de massa muscular" />
                      <RadioItem value="opt2" label="Emagrecimento" description="Deficit calorico com exercicios" />
                      <RadioItem value="opt3" label="Funcional" description="Mobilidade e qualidade de vida" />
                    </RadioGroup>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.info, marginRight: 6 }} />
                        Horizontal
                      </div>
                      <RadioGroup value={radioVal} onValueChange={setRadioVal} orientation="horizontal">
                        <RadioItem value="opt1" label="Hipertrofia" />
                        <RadioItem value="opt2" label="Emagrecimento" />
                        <RadioItem value="opt3" label="Funcional" />
                      </RadioGroup>
                    </div>
                    <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.accent}06, ${t.accent}03)`, border: `1px solid ${t.accent}12` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.accent, marginRight: 6 }} />
                        Card Variant
                      </div>
                      <RadioGroup value={radioVal} onValueChange={setRadioVal}>
                        <RadioItem value="opt1" label="Mensal" description="R$ 97/mes" variant="card" />
                        <RadioItem value="opt2" label="Trimestral" description="R$ 79/mes" variant="card" />
                        <RadioItem value="opt3" label="Anual" description="R$ 59/mes" variant="card" />
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </ShowcaseCard>
            </div>
          )}

          {/* ═══════════ NAVIGATION ═══════════ */}
          {section === 'navigation' && (
            <div style={{ animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.03em' }}>
                <span style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.info})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Navegacao
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: t.textMuted, marginLeft: 10 }}>— {mode === 'light' ? 'Claro' : 'Escuro'}</span>
              </h2>

              {/* PageHeader */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>{'Componente <PageHeader> — Full Featured'}</Label>
                <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}`, marginBottom: 16 }}>
                  <PageHeader
                    title="Dashboard"
                    description="Visao geral do seu negocio de personal trainer"
                    icon="chart"
                    badge={<Badge variant="premium">Pro</Badge>}
                    onBack={() => {}}
                    actions={<Button size="sm"><DSIcon name="download" size={14} /> Exportar</Button>}
                  />
                </div>
                <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.ai}08, ${t.primary}06)`, border: `1px solid ${t.ai}15` }}>
                  <PageHeader
                    title="Assistente IA"
                    description="Gere treinos e conteudos com inteligencia artificial"
                    icon="brainCircuit"
                    badge={<Badge variant="info">Beta</Badge>}
                    actions={
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button variant="ghost" size="sm"><DSIcon name="settings" size={14} /> Config</Button>
                        <Button size="sm"><DSIcon name="sparkles" size={14} /> Gerar</Button>
                      </div>
                    }
                  />
                </div>
              </ShowcaseCard>

              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Sliding Tabs — 3D Green Indicator</Label>
                <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <SlidingTabs
                    tabs={[{ key: 'overview', label: 'Visao Geral' }, { key: 'referrals', label: 'Indicados' }, { key: 'commissions', label: 'Comissoes' }, { key: 'withdraw', label: 'Saque' }]}
                    activeTab={activeTab} onChange={setActiveTab}
                  />
                  <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 12, background: `linear-gradient(135deg, ${t.primary}08, ${t.primary}04)`, border: `1px solid ${t.primary}12` }}>
                    <span style={{ fontSize: 14, color: t.textSecondary }}>Aba ativa: </span>
                    <strong style={{ color: t.primary, fontWeight: 700 }}>{activeTab}</strong>
                  </div>
                </div>
              </ShowcaseCard>

              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Filter Pills — Seletor de Categoria</Label>
                <div style={{ borderRadius: 14, padding: '16px 20px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <FilterPills
                    options={[{ key: 'all', label: 'Todas' }, { key: 'hiper', label: 'Hipertrofia' }, { key: 'emag', label: 'Emagrecimento' }, { key: 'func', label: 'Funcional' }, { key: 'cardio', label: 'Cardio' }, { key: 'reab', label: 'Reabilitacao' }]}
                    selected={activeFilter} onChange={setActiveFilter}
                  />
                </div>
              </ShowcaseCard>

              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>MD3 Tabs — 4 Variantes</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Default (Pill deslizante)</div>
                    <div style={{ borderRadius: 12, padding: '14px 18px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                      <MD3Tabs
                        tabs={[{ id: 'treinos', label: 'Treinos' }, { id: 'avaliacoes', label: 'Avaliacoes' }, { id: 'pagamentos', label: 'Pagamentos' }]}
                        activeTab={md3TabId} onChange={setMd3TabId}
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pills (Glow ativo)</div>
                    <div style={{ borderRadius: 12, padding: '14px 18px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                      <MD3Tabs
                        tabs={[{ id: 'treinos', label: 'Treinos' }, { id: 'avaliacoes', label: 'Avaliacoes' }, { id: 'pagamentos', label: 'Pagamentos' }]}
                        activeTab={md3TabId} onChange={setMd3TabId} variant="pills"
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Segmented (Apple-style)</div>
                    <div style={{ borderRadius: 12, padding: '14px 18px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                      <MD3Tabs
                        tabs={[{ id: 'treinos', label: 'Treinos' }, { id: 'avaliacoes', label: 'Avaliacoes' }, { id: 'pagamentos', label: 'Pagamentos' }]}
                        activeTab={md3TabId} onChange={setMd3TabId} variant="segmented"
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Underline (Classico)</div>
                    <div style={{ borderRadius: 12, padding: '14px 18px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                      <MD3Tabs
                        tabs={[{ id: 'treinos', label: 'Treinos' }, { id: 'avaliacoes', label: 'Avaliacoes' }, { id: 'pagamentos', label: 'Pagamentos' }]}
                        activeTab={md3TabId} onChange={setMd3TabId} variant="underline"
                      />
                    </div>
                  </div>
                </div>
              </ShowcaseCard>

              {/* ProgressBarDS */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>{'Componente <ProgressBarDS> — Barras Completas'}</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ borderRadius: 12, padding: '16px 20px', background: `linear-gradient(135deg, ${t.primary}06, ${t.primary}03)`, border: `1px solid ${t.primary}12` }}>
                    <ProgressBarDS value={75} max={100} label="Progresso do mes" subLabel="75 / 100" />
                  </div>
                  <div style={{ borderRadius: 12, padding: '16px 20px', background: `linear-gradient(135deg, ${t.accent}06, ${t.accent}03)`, border: `1px solid ${t.accent}12` }}>
                    <ProgressBarDS value={3} max={10} label="Nivel Bronze para Prata" subLabel="3 / 10 indicacoes" />
                  </div>
                  <div style={{ borderRadius: 12, padding: '16px 20px', background: `linear-gradient(135deg, ${t.ai}06, ${t.ai}03)`, border: `1px solid ${t.ai}12` }}>
                    <ProgressBarDS value={14200} max={20000} label="Tokens IA usados" subLabel="14.2k / 20k" />
                  </div>
                </div>
              </ShowcaseCard>

              {/* Shimmer Bars */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Progress Bars — Shimmer Animado (Inline)</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {([
                    { label: 'Nivel Bronze para Prata', detail: '1/4 indicacoes', value: 1, max: 4, accent: '#10b981' },
                    { label: 'Meta mensal', detail: 'R$ 8.400 / R$ 12.000', value: 8400, max: 12000, accent: '#3b82f6' },
                    { label: 'Tokens IA usados', detail: '14.2k / 20k', value: 14200, max: 20000, accent: '#8b5cf6' },
                  ]).map((bar, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary }}>{bar.label}</span>
                        <span style={{ fontSize: 13, color: t.textMuted }}>{bar.detail}</span>
                      </div>
                      <ShimmerBar value={bar.value} max={bar.max} accent={bar.accent} />
                    </div>
                  ))}
                </div>
              </ShowcaseCard>

              <ShowcaseCard t={t}>
                <Label t={t}>Componentes de Progresso — Linear, Circular, Step</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                  <div style={{ borderRadius: 14, padding: '20px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Circular Progress</div>
                    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <CircularProgress value={35} size={70} />
                        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, fontWeight: 600 }}>35%</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <CircularProgress value={72} size={70} />
                        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, fontWeight: 600 }}>72%</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <CircularProgress value={100} size={70} />
                        <div style={{ fontSize: 11, color: t.primary, marginTop: 6, fontWeight: 700 }}>100%</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ borderRadius: 14, padding: '20px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Linear Progress — Variantes</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4, fontWeight: 600 }}>Brand (default)</div>
                        <LinearProgress value={65} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4, fontWeight: 600 }}>Success</div>
                        <LinearProgress value={85} variant="success" />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4, fontWeight: 600 }}>Warning</div>
                        <LinearProgress value={45} variant="warning" />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4, fontWeight: 600 }}>Error</div>
                        <LinearProgress value={20} variant="error" />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.primary}06, ${t.ai}04)`, border: `1px solid ${t.primary}10` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Step Progress — Fluxo de Onboarding</div>
                  <StepProgress steps={['Inicio', 'Dados', 'Plano', 'Pagamento', 'Conclusao']} currentStep={2} />
                </div>
              </ShowcaseCard>
            </div>
          )}

          {/* ═══════════ DATA DISPLAY ═══════════ */}
          {section === 'display' && (
            <div style={{ animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.03em' }}>
                <span style={{ background: `linear-gradient(135deg, ${t.info}, ${t.ai})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Data Display
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: t.textMuted, marginLeft: 10 }}>— {mode === 'light' ? 'Claro' : 'Escuro'}</span>
              </h2>

              {/* Color Palette */}
              <Label t={t}>Paleta de Cores</Label>
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {([
                    { name: 'Primary', hex: '#10b981', c: t.primary },
                    { name: 'Info', hex: '#3b82f6', c: t.info },
                    { name: 'Accent', hex: '#f59e0b', c: t.accent },
                    { name: 'AI', hex: '#8b5cf6', c: t.ai },
                    { name: 'Error', hex: '#ef4444', c: t.error },
                    { name: 'Success', hex: '#10b981', c: t.success },
                    { name: 'Secondary', hex: '#64748b', c: '#64748b' },
                  ]).map((color) => (
                    <div key={color.name} style={{ textAlign: 'center' }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, background: color.c,
                        boxShadow: `0 4px 16px ${color.c}40`, marginBottom: 6,
                      }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{color.name}</div>
                      <div style={{ fontSize: 10, color: t.textMuted, fontFamily: 'monospace' }}>{color.hex}</div>
                    </div>
                  ))}
                </div>
              </ShowcaseCard>

              {/* Typography */}
              <Label t={t}>Escala Tipografica</Label>
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                {([
                  { size: 28, weight: 800, label: 'Display', text: 'VFIT' },
                  { size: 22, weight: 700, label: 'H1', text: 'Heading 1' },
                  { size: 18, weight: 600, label: 'H2', text: 'Heading 2' },
                  { size: 16, weight: 600, label: 'H3', text: 'Heading 3' },
                  { size: 14, weight: 500, label: 'Body', text: 'Body text for paragraphs and content.' },
                  { size: 13, weight: 500, label: 'Small', text: 'Small text for secondary information.' },
                  { size: 11, weight: 600, label: 'Caption', text: 'CAPTION / LABELS / OVERLINES' },
                ] as const).map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '8px 0', borderBottom: i < 6 ? `1px solid ${t.borderLight}` : 'none' }}>
                    <span style={{ fontSize: 11, color: t.textMuted, width: 60, fontWeight: 600, flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: row.size, fontWeight: row.weight, color: t.text }}>{row.text}</span>
                  </div>
                ))}
              </ShowcaseCard>

              {/* Badges */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Badges — Todas as Variantes</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Status</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '12px 16px', borderRadius: 12, background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                      <Badge variant="default">Default</Badge>
                      <Badge variant="success">Ativo</Badge>
                      <Badge variant="warning">Pendente</Badge>
                      <Badge variant="error">Vencido</Badge>
                      <Badge variant="info">Info</Badge>
                      <Badge variant="premium">Premium</Badge>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Roles</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '12px 16px', borderRadius: 12, background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                      <Badge variant="info">IA</Badge>
                      <Badge variant="personal">Personal</Badge>
                      <Badge variant="aluno">Aluno</Badge>
                      <Badge variant="admin">Admin</Badge>
                      <Badge variant="super-admin">Super Admin</Badge>
                    </div>
                  </div>
                </div>
              </ShowcaseCard>
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>MD3 Components — Badge, Chip, Status</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', padding: '14px 18px', borderRadius: 12, background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <MD3Badge content={5} />
                      <MD3Badge content={42} />
                      <MD3Badge size="dot" />
                    </div>
                    <div style={{ width: 1, height: 24, background: t.border }} />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <MD3Chip label="Hipertrofia" />
                      <MD3Chip label="Cardio" variant="outlined" />
                    </div>
                    <div style={{ width: 1, height: 24, background: t.border }} />
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <MD3Status status="active" label="Ativo" />
                      <MD3Status status="inactive" label="Inativo" />
                      <MD3Status status="pending" label="Pendente" />
                    </div>
                  </div>
                </div>
              </ShowcaseCard>

              {/* Avatars */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Avatar — Tamanhos e Fallback</Label>
                <div style={{ padding: '16px 20px', borderRadius: 14, background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'end', justifyContent: 'center' }}>
                    {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                      <div key={sz} style={{ textAlign: 'center' }}>
                        <Avatar name={`${sz.toUpperCase()} User`} size={sz} />
                        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, fontWeight: 600 }}>{sz.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </ShowcaseCard>

              {/* AvatarWithPlanBadge */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>{'AvatarWithPlanBadge — Badge de Plano Integrado'}</Label>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'end' }}>
                  {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                    <div key={sz} style={{ textAlign: 'center' }}>
                      <AvatarWithPlanBadge name="Victor Duarte" size={sz} />
                      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6 }}>{sz.toUpperCase()}</div>
                    </div>
                  ))}
                  <div style={{ textAlign: 'center' }}>
                    <AvatarWithPlanBadge name="Sem Dot" size="lg" showActiveDot={false} />
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6 }}>Sem dot</div>
                  </div>
                </div>
              </ShowcaseCard>

              {/* AvatarGroup */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>{'AvatarGroup — Agrupamento com +N'}</Label>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 8 }}>max=4, size=md</div>
                    <AvatarGroup items={[
                      { name: 'Ana Silva' }, { name: 'Bruno Costa' }, { name: 'Carlos Dias' },
                      { name: 'Diana Ferreira' }, { name: 'Eduardo Lima' }, { name: 'Fernanda Alves' },
                    ]} max={4} size="md" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 8 }}>max=3, size=sm</div>
                    <AvatarGroup items={[
                      { name: 'Gabriel' }, { name: 'Helena' }, { name: 'Igor' }, { name: 'Julia' }, { name: 'Kevin' },
                    ]} max={3} size="sm" />
                  </div>
                </div>
              </ShowcaseCard>

              {/* Dividers & Skeleton */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Dividers — 4 Variantes + Vertical</Label>
                <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, marginBottom: 4 }}>Default</div>
                    <Divider />
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, marginTop: 8, marginBottom: 4 }}>Gradient</div>
                    <Divider variant="gradient" />
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, marginTop: 8, marginBottom: 4 }}>Dashed</div>
                    <Divider variant="dashed" />
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, marginTop: 8, marginBottom: 4 }}>Glow (Verde)</div>
                    <Divider variant="glow" />
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, marginTop: 8, marginBottom: 4 }}>Com Label</div>
                    <Divider label="ou continue com" variant="gradient" />
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 16, alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 600 }}>Vertical →</div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', height: 48 }}>
                      <span style={{ fontSize: 13, color: t.textSecondary }}>Opcao A</span>
                      <Divider orientation="vertical" />
                      <span style={{ fontSize: 13, color: t.textSecondary }}>Opcao B</span>
                      <Divider orientation="vertical" variant="glow" />
                      <span style={{ fontSize: 13, color: t.textSecondary }}>Opcao C</span>
                    </div>
                  </div>
                </div>
              </ShowcaseCard>

              <ShowcaseCard t={t}>
                <Label t={t}>Skeleton System — Loading States</Label>
                <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>SkeletonCard</div>
                      <SkeletonCard />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>SkeletonForm (3 fields)</div>
                      <SkeletonForm fields={3} />
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>SkeletonStatsGrid (4 cards)</div>
                    <SkeletonStatsGrid count={4} />
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>SkeletonList (3 items com avatar)</div>
                    <SkeletonList count={3} withAvatar />
                  </div>
                </div>
                <div style={{ marginTop: 16, borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Shimmer className="rounded-full" style={{ width: 44, height: 44 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Shimmer style={{ width: '60%', height: 14, borderRadius: 6 }} />
                      <Shimmer style={{ width: '40%', height: 14, borderRadius: 6 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 10, fontWeight: 600 }}>Shimmer base — composicao livre</div>
                </div>
              </ShowcaseCard>
            </div>
          )}

          {/* ═══════════ FEEDBACK ═══════════ */}
          {section === 'feedback' && (
            <div style={{ animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.03em' }}>
                <span style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.error})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Feedback
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: t.textMuted, marginLeft: 10 }}>— {mode === 'light' ? 'Claro' : 'Escuro'}</span>
              </h2>

              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Alerts — 6 Variantes com Action e Dismiss</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Alert variant="success" title="Sucesso!">Treino salvo com sucesso.</Alert>
                  <Alert variant="info" title="Informacao">Sua assinatura vence em 5 dias.</Alert>
                  <Alert variant="warning" title="Atencao" dismissible>Voce tem cobrancas pendentes.</Alert>
                  <Alert variant="error" title="Erro" action={{ label: 'Tentar novamente', onClick: () => {} }}>Nao foi possivel conectar ao servidor.</Alert>
                  <Alert variant="ai" title="Assistente IA">Treino gerado automaticamente com base no perfil do aluno.</Alert>
                  <Alert variant="neutral" title="Nota" dismissible>Esta funcionalidade esta em fase de teste.</Alert>
                </div>
              </ShowcaseCard>

              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Modal com Focus Trap</Label>
                <DemoBtn variant="primary" t={t} onClick={() => setShowModal(true)}>Abrir Modal</DemoBtn>
                {showModal && (
                  <Modal onClose={() => setShowModal(false)} title="Confirmar Acao">
                    <div style={{ padding: '0 0 16px' }}>
                      <p style={{ marginBottom: 16 }}>Tem certeza que deseja prosseguir? Esta acao nao pode ser desfeita.</p>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={() => setShowModal(false)}>Confirmar</Button>
                      </div>
                    </div>
                  </Modal>
                )}
              </ShowcaseCard>

              {/* EmptyStateDS */}
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>{'Componente <EmptyStateDS>'}</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <EmptyStateDS
                    icon="sparkles"
                    title="Nenhum treino encontrado"
                    description="Comece gerando treinos personalizados para seus alunos"
                    actionLabel="Gerar Treino"
                    actionIcon="sparkles"
                    onAction={() => {}}
                  />
                  <EmptyStateDS
                    icon="users"
                    title="Sem alunos cadastrados"
                    description="Adicione seu primeiro aluno para comecar"
                    actionLabel="Adicionar Aluno"
                    actionIcon="plus"
                    onAction={() => {}}
                  />
                </div>
              </ShowcaseCard>

              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Accordion — Default, Card e Ghost</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.primary, marginRight: 6 }} />
                      Default (Single)
                    </div>
                    <Accordion>
                      <AccordionItem value="faq1">
                        <AccordionTrigger>Como funciona o plano Premium?</AccordionTrigger>
                        <AccordionContent>O plano Premium inclui treinos ilimitados com IA, avaliacoes automaticas e suporte prioritario.</AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="faq2">
                        <AccordionTrigger>Posso cancelar a qualquer momento?</AccordionTrigger>
                        <AccordionContent>Sim, voce pode cancelar sua assinatura a qualquer momento sem multa ou fidelidade.</AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.info, marginRight: 6 }} />
                      Card (Multiple — ambos abrem)
                    </div>
                    <Accordion variant="card" type="multiple" defaultOpen={['c1']}>
                      <AccordionItem value="c1">
                        <AccordionTrigger icon={<DSIcon name="sparkles" size={16} />}>Geracao com IA</AccordionTrigger>
                        <AccordionContent>Treinos personalizados gerados automaticamente com inteligencia artificial.</AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="c2">
                        <AccordionTrigger icon={<DSIcon name="dollar" size={16} />}>Pagamentos</AccordionTrigger>
                        <AccordionContent>Gerencie cobranças via PIX, boleto e cartao de credito.</AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </ShowcaseCard>

              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Tooltip — 4 Posicoes com Auto-flip</Label>
                <div style={{ borderRadius: 14, padding: '32px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                    <Tooltip content="Posicao topo (default)" position="top" arrow>
                      <DemoBtn variant="ghost" size="sm" t={t}>Top</DemoBtn>
                    </Tooltip>
                    <Tooltip content="Posicao direita" position="right" arrow>
                      <DemoBtn variant="ghost" size="sm" t={t}>Right</DemoBtn>
                    </Tooltip>
                    <Tooltip content="Posicao inferior" position="bottom" arrow>
                      <DemoBtn variant="ghost" size="sm" t={t}>Bottom</DemoBtn>
                    </Tooltip>
                    <Tooltip content="Posicao esquerda" position="left" arrow>
                      <DemoBtn variant="ghost" size="sm" t={t}>Left</DemoBtn>
                    </Tooltip>
                    <div style={{ width: 1, height: 32, background: t.border }} />
                    <Tooltip content="Tooltip com largura customizada e texto mais longo que demonstra o maxWidth" maxWidth={280} arrow>
                      <DemoBtn variant="primary" size="sm" t={t} icon={<DSIcon name="info" size={14} className="text-white" />}>MaxWidth</DemoBtn>
                    </Tooltip>
                  </div>
                </div>
              </ShowcaseCard>

              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Spinners Modernos</Label>
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    {(['sm', 'md', 'lg'] as const).map((sz) => {
                      const sizes = { sm: 24, md: 40, lg: 56 }
                      const s = sizes[sz]
                      return (
                        <div key={sz} style={{ textAlign: 'center' }}>
                          <div style={{
                            width: s, height: s, borderRadius: '50%', position: 'relative',
                            background: `conic-gradient(${t.primary}, ${t.primaryLight}, ${t.primary}30, transparent)`,
                            animation: 'spin 1s linear infinite',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <div style={{
                              width: s - (sz === 'sm' ? 6 : sz === 'md' ? 8 : 10),
                              height: s - (sz === 'sm' ? 6 : sz === 'md' ? 8 : 10),
                              borderRadius: '50%', background: t.surfaceSolid,
                            }} />
                          </div>
                          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, fontWeight: 600 }}>{sz.toUpperCase()}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ width: 1, height: 48, background: t.border }} />
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', height: 40, justifyContent: 'center' }}>
                        {[0, 1, 2].map((i) => (
                          <div key={i} style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${t.primary}, ${t.primaryLight})`,
                            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                            boxShadow: `0 0 8px ${t.primary}50`,
                          }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, fontWeight: 600 }}>Dots</div>
                    </div>
                    {/* Orbit spinner */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 40, height: 40, position: 'relative', animation: 'spin 2s linear infinite' }}>
                        <div style={{
                          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                          width: 10, height: 10, borderRadius: '50%',
                          background: `linear-gradient(135deg, ${t.primary}, ${t.primaryLight})`,
                          boxShadow: `0 0 12px ${t.primary}60`,
                        }} />
                        <div style={{
                          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                          width: 6, height: 6, borderRadius: '50%',
                          background: `${t.primary}60`,
                        }} />
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6, fontWeight: 600 }}>Orbit</div>
                    </div>
                  </div>
                </div>
              </ShowcaseCard>

              {/* Skeleton System */}
              <ShowcaseCard t={t}>
                <Label t={t}>Skeleton System — Loading States</Label>
                <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>SkeletonCard</div>
                      <SkeletonCard />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>SkeletonForm (3 fields)</div>
                      <SkeletonForm fields={3} />
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 16, borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>SkeletonStatsGrid (4 cards)</div>
                  <SkeletonStatsGrid count={4} />
                </div>
                <div style={{ marginTop: 16, borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>SkeletonList (3 items com avatar)</div>
                  <SkeletonList count={3} withAvatar />
                </div>
                <div style={{ marginTop: 16, borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${t.neutral50}, ${t.neutral100})`, border: `1px solid ${t.borderLight}` }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Shimmer className="rounded-full" style={{ width: 44, height: 44 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Shimmer style={{ width: '60%', height: 14, borderRadius: 6 }} />
                      <Shimmer style={{ width: '40%', height: 14, borderRadius: 6 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 10, fontWeight: 600 }}>Shimmer base — composicao livre</div>
                </div>
              </ShowcaseCard>
            </div>
          )}

          {/* ═══════════ ICONS ═══════════ */}
          {section === 'icons' && (
            <div style={{ animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.02em' }}>
                <span style={{ background: `linear-gradient(135deg, ${t.ai}, ${t.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Iconografia
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: t.textMuted, marginLeft: 10 }}>— DSIcon SVG</span>
              </h2>

              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                <Label t={t}>Biblioteca Completa — {DS_ICON_NAMES.length} Icones</Label>
                {/* v9 improvement: Search bar */}
                <div style={{ marginBottom: 20, maxWidth: 400 }}>
                  <MD3SearchBar
                    placeholder="Buscar ícone (ex: bell, heart, star)..."
                    value={iconFilter}
                    onChange={(e) => setIconFilter(e.target.value || '')}
                  />
                </div>

                {/* Filter results */}
                {(() => {
                  const filtered = DS_ICON_NAMES.filter(n => n.toLowerCase().includes(iconFilter.toLowerCase()))
                  return (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, marginBottom: 16 }}>
                        Mostrando <span style={{ color: t.primary, fontWeight: 700 }}>{filtered.length}</span> de <span style={{ color: t.primary, fontWeight: 700 }}>{DS_ICON_NAMES.length}</span> ícones
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                        {filtered.length > 0 ? (
                          filtered.map((name) => (
                            <div
                              key={name}
                              onClick={() => {
                                navigator.clipboard.writeText(name)
                                setToastMsg(`Copiado: ${name}`)
                                setTimeout(() => setToastMsg(null), 2000)
                              }}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                padding: 16, borderRadius: 12, background: t.neutral50,
                                border: `1px solid ${t.borderLight}`, cursor: 'pointer',
                                transition: 'all 200ms ease',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = t.primaryBg; e.currentTarget.style.borderColor = t.primary + '30'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = t.neutral50; e.currentTarget.style.borderColor = t.borderLight; e.currentTarget.style.transform = 'translateY(0)' }}
                              title="Click para copiar o nome do ícone"
                            >
                              <DSIcon name={name} size={22} />
                              <span style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, textAlign: 'center' }}>{name}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: t.textMuted }}>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>Nenhum ícone encontrado</div>
                            <div style={{ fontSize: 12, marginTop: 8 }}>Tente uma busca diferente (ex: &ldquo;menu&rdquo;, &ldquo;settings&rdquo;)</div>
                          </div>
                        )}
                      </div>
                    </>
                  )
                })()}
              </ShowcaseCard>

              {/* Toast feedback */}
              {toastMsg && (
                <div style={{
                  position: 'fixed', bottom: 24, left: 24,
                  background: t.primary, color: '#fff',
                  padding: '12px 16px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  animation: 'fadeInUp 300ms cubic-bezier(0.16,1,0.3,1) both',
                  zIndex: 50,
                }}>
                  ✓ {toastMsg}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ PATTERNS ═══════════ */}
          {section === 'patterns' && (
            <div style={{ animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.02em' }}>
                <span style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.ai})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Real-World Patterns
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: t.textMuted, marginLeft: 10 }}>— {mode === 'light' ? 'Claro' : 'Escuro'}</span>
              </h2>

              {/* Profile Card */}
              <Label t={t}>Profile Card — Personal Trainer</Label>
              <ShowcaseCard t={t} style={{ marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${t.primary}, ${t.ai}, ${t.accent})`, opacity: 0.6 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 22, color: '#fff',
                    boxShadow: `0 4px 16px ${t.primary}40, 0 0 0 3px ${t.primary}20`,
                    animation: 'pulse 3s ease-in-out infinite',
                  }}>V</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: 17, color: t.text, letterSpacing: '-0.02em' }}>Victor Duarte</span>
                      <Badge variant="personal">Personal</Badge>
                      <Badge variant="super-admin">Super Admin</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: t.textMuted, marginTop: 3 }}>victor@vfit.app.br</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <DemoBtn variant="primary" size="sm" t={t} icon={<DSIcon name="edit" size={14} className="text-white" />}>Editar</DemoBtn>
                    <DemoBtn variant="ghost" size="sm" t={t} icon={<DSIcon name="share" size={14} />}>Perfil</DemoBtn>
                  </div>
                </div>
              </ShowcaseCard>

              {/* Dashboard KPI */}
              <Label t={t}>Dashboard KPI — Financeiro</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
                {([
                  { icon: 'dollar' as DSIconName, label: 'Receita Bruta', value: 'R$ 18.450', change: '+12%', accent: '#10b981', positive: true },
                  { icon: 'wallet' as DSIconName, label: 'Saldo Disponivel', value: 'R$ 6.280', change: '+5%', accent: '#3b82f6', positive: true },
                  { icon: 'users' as DSIconName, label: 'Inadimplentes', value: '3', change: '-2', accent: '#ef4444', positive: false },
                  { icon: 'chart' as DSIconName, label: 'Taxa Conversao', value: '78%', change: '+8%', accent: '#8b5cf6', positive: true },
                ]).map((kpi, i) => (
                  <ShowcaseCard key={i} t={t} style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${kpi.accent}, ${kpi.accent}60)`, opacity: 0.5 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 13,
                        background: `linear-gradient(135deg, ${kpi.accent}, ${kpi.accent}bb)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 16px ${kpi.accent}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
                      }}><DSIcon name={kpi.icon} size={20} className="text-white" /></div>
                      <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{kpi.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: t.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{kpi.value}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
                        color: kpi.positive ? '#10b981' : '#ef4444',
                        background: kpi.positive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        boxShadow: kpi.positive ? '0 0 8px rgba(16,185,129,0.15)' : '0 0 8px rgba(239,68,68,0.15)',
                      }}>{kpi.change}</span>
                    </div>
                  </ShowcaseCard>
                ))}
              </div>

              {/* User List with Stagger */}
              <Label t={t}>Lista de Alunos — Stagger Animation</Label>
              <Stagger className="flex flex-col gap-2.5" style={{ marginBottom: 28 }}>
                {([
                  { name: 'Camila Ferreira', email: 'camila@email.com', plan: 'Premium', status: 'Ativo', color: '#f59e0b', letter: 'C' },
                  { name: 'Lucas Mendes', email: 'lucas@email.com', plan: 'Basico', status: 'Pendente', color: '#3b82f6', letter: 'L' },
                  { name: 'Ana Clara Silva', email: 'ana@email.com', plan: 'Premium', status: 'Ativo', color: '#8b5cf6', letter: 'A' },
                  { name: 'Rafael Oliveira', email: 'rafael@email.com', plan: 'Pro', status: 'Ativo', color: '#10b981', letter: 'R' },
                ]).map((user, i) => (
                  <StaggerItem key={i}>
                    <ShowcaseCard t={t} style={{ position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${user.color}, ${user.color}60)`, borderRadius: '0 2px 2px 0' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 8 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                          background: `linear-gradient(135deg, ${user.color}, ${user.color}bb)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 17, color: '#fff',
                          boxShadow: `0 4px 12px ${user.color}35`,
                        }}>{user.letter}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 15, color: t.text, letterSpacing: '-0.01em' }}>{user.name}</span>
                            <Badge variant={user.plan === 'Premium' ? 'premium' : user.plan === 'Pro' ? 'personal' : 'default'}>{user.plan}</Badge>
                            <Badge variant={user.status === 'Ativo' ? 'success' : 'warning'}>{user.status}</Badge>
                          </div>
                          <div style={{ fontSize: 13, color: t.textMuted, marginTop: 3 }}>{user.email}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <DemoBtn variant="ghost" size="sm" t={t} icon={<DSIcon name="edit" size={14} />}>Editar</DemoBtn>
                          <DemoBtn variant="primary" size="sm" t={t} icon={<DSIcon name="sparkles" size={14} className="text-white" />}>Treino</DemoBtn>
                        </div>
                      </div>
                    </ShowcaseCard>
                  </StaggerItem>
                ))}
              </Stagger>

              {/* Settings Panel */}
              <Label t={t}>Settings Panel</Label>
              <ShowcaseCard t={t} style={{ marginBottom: 16 }}>
                {([
                  { icon: 'bell' as DSIconName, title: 'Notificacoes Push', desc: 'Receba alertas de pagamentos e mensagens', accent: '#3b82f6', on: true },
                  { icon: 'sparkles' as DSIconName, title: 'IA Automatica', desc: 'Gere treinos automaticamente para novos alunos', accent: '#10b981', on: true },
                  { icon: 'settings' as DSIconName, title: 'Modo Manutencao', desc: 'Desabilite funcionalidades temporariamente', accent: '#8b5cf6', on: false },
                ]).map((setting, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', margin: i < 2 ? '0 0 10px' : 0,
                    borderRadius: 14, background: setting.on ? `linear-gradient(135deg, ${setting.accent}06, transparent)` : 'transparent',
                    border: `1px solid ${setting.on ? setting.accent + '15' : t.borderLight}`,
                    transition: 'all 200ms ease',
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 13,
                      background: `linear-gradient(135deg, ${setting.accent}20, ${setting.accent}10)`,
                      color: setting.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 12px ${setting.accent}15`,
                    }}><DSIcon name={setting.icon} size={20} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: '-0.01em' }}>{setting.title}</div>
                      <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>{setting.desc}</div>
                    </div>
                    <Toggle checked={setting.on} onCheckedChange={() => {}} />
                  </div>
                ))}
              </ShowcaseCard>

              {/* Onboarding Steps */}
              <Label t={t}>Onboarding Flow</Label>
              <ShowcaseCard t={t} style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${t.primary}, ${t.info}, ${t.accent}, ${t.ai})`, opacity: 0.4 }} />
                <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  {/* Connecting line */}
                  <div style={{ position: 'absolute', top: 34, left: '12.5%', right: '12.5%', height: 2, background: t.neutral200, zIndex: 0 }} />
                  <div style={{ position: 'absolute', top: 34, left: '12.5%', width: '25%', height: 2, background: `linear-gradient(90deg, ${t.primary}, ${t.info})`, zIndex: 1 }} />
                  {([
                    { step: 1, title: 'Criar Conta', desc: 'Cadastre-se gratuitamente', accent: t.primary, done: true },
                    { step: 2, title: 'Adicionar Aluno', desc: 'Cadastre seu primeiro aluno', accent: t.info, done: true },
                    { step: 3, title: 'Gerar Treino', desc: 'Use IA para criar treinos', accent: t.accent, done: false },
                    { step: 4, title: 'Cobrar', desc: 'Configure pagamentos', accent: t.ai, done: false },
                  ]).map((item, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 2 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%', margin: '0 auto 12px',
                        background: item.done ? `linear-gradient(135deg, ${item.accent}, ${item.accent}bb)` : `linear-gradient(135deg, ${t.neutral100}, ${t.neutral200})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 17, color: item.done ? '#fff' : t.textMuted,
                        boxShadow: item.done ? `0 4px 16px ${item.accent}40, 0 0 0 4px ${item.accent}15` : `inset 0 2px 4px ${t.neutral200}`,
                        border: item.done ? 'none' : `2px dashed ${t.border}`,
                        transition: 'all 300ms ease',
                      }}>{item.done ? <DSIcon name="check" size={22} className="text-white" /> : item.step}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: item.done ? t.text : t.textMuted, letterSpacing: '-0.01em' }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </ShowcaseCard>
            </div>
          )}

          {/* ═══════════ FOUNDATIONS ═══════════ */}
          {section === 'foundations' && (
            <div style={{ animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em', fontFamily: "var(--font-syne,'Syne',sans-serif)" }}>
                <span style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.ai})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Foundations
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: t.textMuted, marginLeft: 10, fontFamily: 'inherit' }}>— cores · tipografia · tokens · elevação</span>
              </h2>
              <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 28 }}>Os primitivos que compõem o sistema. Cada token tem um propósito semântico.</p>

              {/* ── Paleta de Cores ── */}
              <ShowcaseCard t={t} style={{ marginBottom: 20 }}>
                <Label t={t}>Paleta de Cores</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                  {[
                    { name: 'brand-primary', hex: '#22C55E', label: 'Brand' },
                    { name: 'brand-mint', hex: '#86EFAC', label: 'Mint' },
                    { name: 'brand-lime', hex: '#A3E635', label: 'Lime' },
                    { name: 'brand-deep', hex: '#166534', label: 'Deep' },
                    { name: 'ai', hex: '#8B5CF6', label: 'AI' },
                    { name: 'info', hex: '#3B82F6', label: 'Info' },
                    { name: 'warning', hex: '#F59E0B', label: 'Warning' },
                    { name: 'error', hex: '#EF4444', label: 'Error' },
                    { name: 'success', hex: '#10B981', label: 'Success' },
                    { name: 'text-primary', hex: t.text, label: 'Text' },
                    { name: 'text-secondary', hex: t.textSecondary, label: 'Secondary' },
                    { name: 'text-muted', hex: t.textMuted, label: 'Muted' },
                  ].map((c) => (
                    <div key={c.name} style={{ textAlign: 'center' }}>
                      <div title={c.hex} style={{
                        width: '100%', paddingBottom: '100%', borderRadius: 12, marginBottom: 6,
                        background: c.hex, border: `1px solid ${t.border}`,
                        boxShadow: `0 2px 8px ${c.hex}40`,
                        transition: 'transform 200ms ease, box-shadow 200ms ease',
                        cursor: 'default',
                      }} />
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>{c.label}</div>
                      <div style={{ fontSize: 10, color: t.textMuted, fontFamily: 'monospace', marginTop: 1 }}>{c.hex}</div>
                    </div>
                  ))}
                </div>
              </ShowcaseCard>

              {/* ── Tonal Glass ── */}
              <ShowcaseCard t={t} style={{ marginBottom: 20 }}>
                <Label t={t}>Tonal Glass Surfaces</Label>
                <p style={{ fontSize: 12, color: t.textMuted, marginBottom: 16 }}>Cards com tint semântico de cor — verde para receita, azul para alunos, âmbar para pagamentos.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                  {[
                    { label: 'Revenue', bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.14)', shadow: '0 4px 24px rgba(34,197,94,0.12)', icon: '22C55E', name: '--ds-glass-green' },
                    { label: 'Students', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.14)', shadow: '0 4px 24px rgba(59,130,246,0.12)', icon: '3B82F6', name: '--ds-glass-blue' },
                    { label: 'Payments', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.14)', shadow: '0 4px 24px rgba(245,158,11,0.12)', icon: 'F59E0B', name: '--ds-glass-amber' },
                    { label: 'AI / Plans', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.14)', shadow: '0 4px 24px rgba(139,92,246,0.12)', icon: '8B5CF6', name: '--ds-glass-purple' },
                    { label: 'Alerts', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.14)', shadow: '0 4px 24px rgba(239,68,68,0.12)', icon: 'EF4444', name: '--ds-glass-red' },
                  ].map((c) => (
                    <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: '16px 18px', boxShadow: c.shadow }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `#${c.icon}`, marginBottom: 10, boxShadow: `0 3px 10px #${c.icon}50` }} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{c.label}</div>
                      <div style={{ fontSize: 10, color: t.textMuted, marginTop: 3, fontFamily: 'monospace' }}>{c.name}</div>
                    </div>
                  ))}
                </div>
              </ShowcaseCard>

              {/* ── Tipografia ── */}
              <ShowcaseCard t={t} style={{ marginBottom: 20 }}>
                <Label t={t}>Sistema Tipográfico</Label>
                <p style={{ fontSize: 12, color: t.textMuted, marginBottom: 20 }}>
                  <strong style={{ color: t.text }}>Syne</strong> para display/headings (600–800) · <strong style={{ color: t.text }}>DM Sans</strong> para body/UI (400–600)
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Hero', size: 'clamp(2.5rem, 6vw, 4rem)', weight: 800, font: "var(--font-syne,'Syne',sans-serif)", text: 'VFIT', token: '--text-display-hero / Syne 800' },
                    { label: 'Title', size: 'clamp(1.5rem, 3vw, 2rem)', weight: 700, font: "var(--font-syne,'Syne',sans-serif)", text: 'Personal Trainers', token: '--text-display-title / Syne 700' },
                    { label: 'Heading', size: '1.25rem', weight: 600, font: "var(--font-syne,'Syne',sans-serif)", text: 'Treinos & Avaliações', token: '--text-display-heading / Syne 600' },
                    { label: 'Body', size: '0.9375rem', weight: 400, font: "var(--font-dm-sans,'DM Sans',sans-serif)", text: 'Gerencie seus alunos com inteligência artificial avançada', token: '--font-body / DM Sans 400' },
                    { label: 'Label', size: '0.8125rem', weight: 500, font: "var(--font-dm-sans,'DM Sans',sans-serif)", text: 'PLANO PRO · ATIVO', token: '--font-body / DM Sans 500' },
                    { label: 'Stat', size: 'clamp(2rem, 4vw, 3rem)', weight: 700, font: "var(--font-syne,'Syne',sans-serif)", text: '1.284', token: '--text-display-stat / Syne 700 tabular' },
                  ].map((row) => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'baseline', gap: 20, borderBottom: `1px solid ${t.border}`, paddingBottom: 12 }}>
                      <div style={{ width: 60, flexShrink: 0, fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{row.label}</div>
                      <div style={{ flex: 1, fontSize: row.size, fontWeight: row.weight, fontFamily: row.font, color: t.text, letterSpacing: row.weight >= 700 ? '-0.03em' : 'normal', lineHeight: 1.1, fontVariantNumeric: row.label === 'Stat' ? 'tabular-nums' : undefined }}>{row.text}</div>
                      <div style={{ flexShrink: 0, fontSize: 10, color: t.textMuted, fontFamily: 'monospace', textAlign: 'right' }}>{row.token}</div>
                    </div>
                  ))}
                </div>
              </ShowcaseCard>

              {/* ── Elevação ── */}
              <ShowcaseCard t={t} style={{ marginBottom: 20 }}>
                <Label t={t}>Sistema de Elevação (5 Níveis)</Label>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {[
                    { level: 1, shadow: '0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)', token: '--shadow-elevation-1', use: 'Chips, Pills' },
                    { level: 2, shadow: '0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)', token: '--shadow-elevation-2', use: 'Cards' },
                    { level: 3, shadow: '0 12px 28px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05)', token: '--shadow-elevation-3', use: 'Dropdowns' },
                    { level: 4, shadow: '0 24px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)', token: '--shadow-elevation-4', use: 'Modais' },
                    { level: 5, shadow: '0 40px 64px rgba(0,0,0,0.14), 0 8px 20px rgba(0,0,0,0.07)', token: '--shadow-elevation-5', use: 'Sheets' },
                  ].map((e) => (
                    <div key={e.level} style={{ flex: '1 1 130px', minWidth: 130 }}>
                      <div style={{
                        height: 72, borderRadius: 14,
                        background: t.bg.includes('#050') ? 'rgba(255,255,255,0.05)' : '#fff',
                        boxShadow: e.shadow,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 8,
                        border: `1px solid ${t.border}`,
                      }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: t.textMuted, fontFamily: "var(--font-syne,'Syne',sans-serif)" }}>{e.level}</span>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.text }}>{e.use}</div>
                      <div style={{ fontSize: 9, color: t.textMuted, fontFamily: 'monospace', marginTop: 2 }}>{e.token}</div>
                    </div>
                  ))}
                </div>
              </ShowcaseCard>

              {/* ── Border Radius ── */}
              <ShowcaseCard t={t}>
                <Label t={t}>Border Radius Scale</Label>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  {[
                    { token: '--radius-sm', value: '6px', size: 40 },
                    { token: '--radius-md', value: '8px', size: 48 },
                    { token: '--radius-lg', value: '12px', size: 56 },
                    { token: '--radius-xl', value: '16px', size: 64 },
                    { token: '--radius-2xl', value: '24px', size: 72 },
                    { token: '--radius-3xl', value: '32px', size: 80 },
                    { token: '--radius-pill', value: '9999px', size: 44 },
                  ].map((r) => (
                    <div key={r.token} style={{ textAlign: 'center', flex: '1 1 80px' }}>
                      <div style={{
                        width: r.size, height: r.size, borderRadius: r.value, margin: '0 auto 8px',
                        background: `linear-gradient(135deg, ${t.primary}40, ${t.ai}40)`,
                        border: `1.5px solid ${t.primary}30`,
                      }} />
                      <div style={{ fontSize: 10, color: t.textMuted, fontFamily: 'monospace' }}>{r.value}</div>
                    </div>
                  ))}
                </div>
              </ShowcaseCard>
            </div>
          )}

          {/* ═══════════ MOTION ═══════════ */}
          {section === 'motion' && (
            <div style={{ animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) both' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em', fontFamily: "var(--font-syne,'Syne',sans-serif)" }}>
                <span style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.ai})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Motion System
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: t.textMuted, marginLeft: 10, fontFamily: 'inherit' }}>— durações · easings · stagger · feedback</span>
              </h2>
              <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 28 }}>Cada animação comunica hierarquia e causa-efeito. Nenhuma animação é puramente decorativa.</p>

              {/* ── Duration Scale ── */}
              <ShowcaseCard t={t} style={{ marginBottom: 20 }}>
                <Label t={t}>Duration Tokens</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { token: '--ds-motion-instant', value: '80ms', use: 'Ripple, estado de press' },
                    { token: '--ds-motion-fast', value: '150ms', use: 'Hover states, badge updates' },
                    { token: '--ds-motion-normal', value: '220ms', use: 'Micro-interações padrão' },
                    { token: '--ds-motion-slow', value: '350ms', use: 'Cards, expansões de accordion' },
                    { token: '--ds-motion-entrance', value: '420ms', use: 'Entrada de componentes na tela' },
                    { token: '--ds-motion-page', value: '500ms', use: 'Page transitions, modais' },
                  ].map((d) => (
                    <div key={d.token} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 80, flexShrink: 0, fontFamily: 'monospace', fontSize: 11, color: t.primary, fontWeight: 700 }}>{d.value}</div>
                      <div style={{ flex: 1, height: 6, borderRadius: 9999, background: t.border, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 9999,
                          background: `linear-gradient(90deg, ${t.primary}, ${t.primaryLight})`,
                          width: `${Math.round((parseInt(d.value) / 500) * 100)}%`,
                          boxShadow: `0 0 8px ${t.primary}60`,
                        }} />
                      </div>
                      <div style={{ width: 240, fontSize: 12, color: t.textSecondary }}>{d.use}</div>
                      <div style={{ width: 180, fontSize: 10, color: t.textMuted, fontFamily: 'monospace', textAlign: 'right' }}>{d.token}</div>
                    </div>
                  ))}
                </div>
              </ShowcaseCard>

              {/* ── Easing Playground ── */}
              <ShowcaseCard t={t} style={{ marginBottom: 20 }}>
                <Label t={t}>Easing Curves — Comparativo Visual</Label>
                <p style={{ fontSize: 12, color: t.textMuted, marginBottom: 20 }}>Passe o mouse sobre cada linha para ver a animação em ação.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { name: 'spring', token: '--ds-ease-spring', curve: 'cubic-bezier(0.34, 1.56, 0.64, 1)', color: t.primary, use: 'Botões, pills, badges — elemento físico e elástico' },
                    { name: 'decel', token: '--ds-ease-decel', curve: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)', color: t.ai, use: 'Entradas de componentes — rápido início, suave ao parar' },
                    { name: 'emphasize', token: '--ds-ease-emphasize', curve: 'cubic-bezier(0.2, 0, 0, 1)', color: '#3B82F6', use: 'Transições importantes — MD3 Emphasized' },
                    { name: 'out', token: '--ds-ease-out', curve: 'cubic-bezier(0.0, 0.0, 0.2, 1)', color: t.accent, use: 'Saída de elementos — Material deceleration' },
                    { name: 'accel', token: '--ds-ease-accel', curve: 'cubic-bezier(0.3, 0, 0.8, 0.15)', color: t.error, use: 'Dismiss, saídas rápidas — Material acceleration' },
                  ].map((e) => (
                    <EasingRow key={e.name} t={t} {...e} />
                  ))}
                </div>
              </ShowcaseCard>

              {/* ── Stagger Demo ── */}
              <ShowcaseCard t={t} style={{ marginBottom: 20 }}>
                <Label t={t}>Stagger Animation — .ds-stagger</Label>
                <p style={{ fontSize: 12, color: t.textMuted, marginBottom: 16 }}>Items entram com delay de <code style={{ background: t.neutral100, padding: '1px 4px', borderRadius: 4, fontFamily: 'monospace' }}>--ds-stagger-sm (50ms)</code> entre cada filho.</p>
                <MotionStaggerDemo t={t} />
              </ShowcaseCard>

              {/* ── Entrance Variants ── */}
              <ShowcaseCard t={t}>
                <Label t={t}>Entrance Variants</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {[
                    { cls: 'ds-enter', label: '.ds-enter', desc: 'translateY(12px) → 0, 420ms decel' },
                    { cls: 'ds-enter-fast', label: '.ds-enter-fast', desc: 'translateY(12px) → 0, 220ms decel' },
                    { cls: 'ds-enter-spring', label: '.ds-enter-spring', desc: 'translateY(16px) + scale(0.97) → spring' },
                  ].map((v) => (
                    <div key={v.cls} style={{ background: t.neutral50, border: `1px solid ${t.border}`, borderRadius: 12, padding: '16px 18px' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: t.primary, marginBottom: 6 }}>{v.label}</div>
                      <div style={{ fontSize: 12, color: t.textSecondary, lineHeight: 1.5 }}>{v.desc}</div>
                    </div>
                  ))}
                </div>
              </ShowcaseCard>
            </div>
          )}

          {/* ───── FOOTER ───── */}
          <div style={{ marginTop: 48, textAlign: 'center', padding: '24px 0', borderTop: `1px solid ${t.border}`, animation: 'fadeInUp 400ms cubic-bezier(0.16,1,0.3,1) 200ms both' }}>
            <p style={{ fontSize: 13, color: t.textMuted, fontWeight: 500 }}>VFIT Design System v10.0 — 100+ componentes · 10 seções · Glass + 3D + Gradients · WCAG AA</p>
            <p style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>Updated 2026-04-05 · Built with Next.js 15, Tailwind CSS v4, Framer Motion · Every detail matters</p>
          </div>

          {/* ───── SCROLL TO TOP FAB ───── */}
          <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08) rotate(-5deg)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.5)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.35)' }}
              title="Voltar ao topo"
              aria-label="Scroll to top"
              style={{
                width: 56, height: 56, borderRadius: 18, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})`,
                boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 300ms cubic-bezier(0.34,1.56,0.64,1)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <DSIcon name="sparkles" size={24} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
