/**
 * src/components/layout/mobile-nav.tsx
 *
 * MobileNav — Ultra-Modern Green Bottom Nav
 *
 * Exports: MobileBottomNav, MobileDrawer
 * Hooks: usePathname, useRouter, useAppStore, useAuthStore, useEffectiveUserView, useEffect
 * Features: Auth: useAuthStore · 'use client' · Framer Motion · DSIcon
 */

// ============================================
// MobileNav — Ultra-Modern Green Bottom Nav
// v2.1: FAB central QR com 6 ações rápidas (Criar Treino, Avaliação,
// Exercício, Bibliotecas, Convidar Aluno QR) — Grid 2×3 moderno
// Tabs: Início · Alunos · QR(FAB) · Cobrança · Config
// ============================================

'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'
import { cn, getShortName } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import { useUpdateAdminSimulationSession } from '@/hooks/use-admin'
import { AvatarWithPlanBadge } from '@/components/ui/avatar-plan-badge'
import { useEffect, useMemo, useState } from 'react'
import { FeedbackModal } from './feedback-modal'
import {
  personalNavigation,
  studentNavigation,
  adminNavigation,
  SECTION_COLORS,
} from '@/lib/navigation'

// ============================================
// Haptic feedback helper
// ============================================
function haptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(8)
  }
}

type MobilePwaPlatform = 'ios' | 'android' | 'other'

function detectMobilePwaPlatform(): { standalone: boolean; platform: MobilePwaPlatform } {
  if (typeof window === 'undefined') {
    return { standalone: false, platform: 'other' }
  }

  const ua = window.navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const isAndroid = /android/.test(ua)
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')

  return {
    standalone,
    platform: isIOS ? 'ios' : isAndroid ? 'android' : 'other',
  }
}

// ============================================
// Ultra-Premium Nav Icons — SF Symbols / Apple HIG quality
// 24×24, 2px stroke (inactive), solid fill (active)
// Clean geometric shapes, perfect optical balance
// ============================================

function HomeIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12.6 2.4a1 1 0 00-1.2 0l-8 6A1 1 0 003 9.2V20a2 2 0 002 2h4.5a1 1 0 001-1v-5.5a1.5 1.5 0 013 0V21a1 1 0 001 1H19a2 2 0 002-2V9.2a1 1 0 00-.4-.8l-8-6z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3.5 9.6L12 3.2l8.5 6.4V20a1.5 1.5 0 01-1.5 1.5h-4a.5.5 0 01-.5-.5v-5a2 2 0 00-4 0v5a.5.5 0 01-.5.5H6A1.5 1.5 0 014.5 20V9.6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function AlunosIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" fill="currentColor" />
        <path d="M2 19.5C2 16 5 13 9 13s7 3 7 6.5a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5z" fill="currentColor" />
        <circle cx="17" cy="8.5" r="2.5" fill="currentColor" opacity="0.45" />
        <path d="M18 14c2.7.8 4 3 4 5.5a.5.5 0 01-.5.5H18" fill="currentColor" opacity="0.45" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 19.5C2.5 16.2 5.3 13.5 9 13.5s6.5 2.7 6.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17" cy="8.5" r="2.25" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M18.5 14c2 .7 3.5 2.5 3.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

function TreinosIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="1.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="19.5" y="9.5" width="3" height="5" rx="1" fill="currentColor" />
        <rect x="4.5" y="7" width="4" height="10" rx="1.5" fill="currentColor" />
        <rect x="15.5" y="7" width="4" height="10" rx="1.5" fill="currentColor" />
        <rect x="8.5" y="10.5" width="7" height="3" rx="1.5" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="1.5" y="9.5" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="19.5" y="9.5" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4.5" y="7" width="4" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="15.5" y="7" width="4" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PlusFabIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="#0a0f0a" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  )
}

function CobrancaIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {/* Back card */}
        <rect x="1" y="3" width="18" height="12" rx="2.5" fill="currentColor" opacity="0.45" />
        {/* Front card */}
        <rect x="5" y="9" width="18" height="12" rx="2.5" fill="currentColor" />
        {/* Chip */}
        <rect x="8" y="12" width="3.5" height="2.5" rx="0.7" stroke="white" strokeWidth="1.2" opacity="0.7" />
        {/* Card lines */}
        <line x1="13.5" y1="13" x2="19.5" y2="13" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
        <line x1="8" y1="17.5" x2="12" y2="17.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
        <line x1="13.5" y1="17.5" x2="20" y2="17.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Back card */}
      <rect x="1.5" y="3.5" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      {/* Front card */}
      <rect x="5.5" y="9.5" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      {/* Chip */}
      <rect x="8" y="12" width="3.5" height="2.5" rx="0.7" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      {/* Card lines */}
      <line x1="13.5" y1="13" x2="19.5" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
      <line x1="8" y1="17.5" x2="12" y2="17.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.35" />
      <line x1="13.5" y1="17.5" x2="20" y2="17.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.35" />
    </svg>
  )
}

function SettingsIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <circle cx="8" cy="6" r="2.8" fill="currentColor" />
        <circle cx="16" cy="12" r="2.8" fill="currentColor" />
        <circle cx="10" cy="18" r="2.8" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <circle cx="8" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="10" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function AvaliacoesIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M15 2H9a1 1 0 00-1 1v1H5a2 2 0 00-2 2v15a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-3V3a1 1 0 00-1-1z" fill="currentColor" />
        <path d="M8.5 13l2.5 2.5L16 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 2.5h6a.5.5 0 01.5.5v1.5h2.5A1.5 1.5 0 0119.5 6v15a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 21V6A1.5 1.5 0 016 4.5h2.5V3a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 13l2.5 2.5L16 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NutricaoIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="9" r="4.5" fill="currentColor" />
        <path d="M3 18c0-3 3.5-4.5 9-4.5s9 1.5 9 4.5v2.5a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5V18z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="9" r="4.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 18c0-2.8 3.5-4 8.5-4s8.5 1.2 8.5 4v2a.5.5 0 01-.5.5h-16a.5.5 0 01-.5-.5V18z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IAIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="currentColor" />
        <path d="M9 11h6v2H9z" fill="white" opacity="0.8" />
        <circle cx="10" cy="8" r="1.2" fill="white" opacity="0.8" />
        <circle cx="14" cy="8" r="1.2" fill="white" opacity="0.8" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 11h6v2H9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="8" r="0.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="8" r="0.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function PerfilIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" fill="currentColor" />
        <path d="M3 18.5C3 15.5 7.5 14 12 14s9 1.5 9 4.5v2a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5v-2z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 18.5C3.5 15.5 7.5 14.5 12 14.5s8.5 1 8.5 4v1.5a.5.5 0 01-.5.5h-16a.5.5 0 01-.5-.5v-1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PagamentosIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {/* Back card */}
        <rect x="1" y="3" width="18" height="12" rx="2.5" fill="currentColor" opacity="0.45" />
        {/* Front card */}
        <rect x="5" y="9" width="18" height="12" rx="2.5" fill="currentColor" />
        {/* Chip */}
        <rect x="8" y="12" width="3.5" height="2.5" rx="0.7" stroke="white" strokeWidth="1.2" opacity="0.7" />
        {/* Card lines */}
        <line x1="13.5" y1="13" x2="19.5" y2="13" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
        <line x1="8" y1="17.5" x2="12" y2="17.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
        <line x1="13.5" y1="17.5" x2="20" y2="17.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Back card */}
      <rect x="1.5" y="3.5" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      {/* Front card */}
      <rect x="5.5" y="9.5" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      {/* Chip */}
      <rect x="8" y="12" width="3.5" height="2.5" rx="0.7" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      {/* Card lines */}
      <line x1="13.5" y1="13" x2="19.5" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
      <line x1="8" y1="17.5" x2="12" y2="17.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.35" />
      <line x1="13.5" y1="17.5" x2="20" y2="17.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.35" />
    </svg>
  )
}

function ChatNavIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 11.5c0 4.7-4 8.5-9 8.5-1.6 0-3.1-.4-4.4-1L3 20.5l1.5-3.8C3.6 15.3 3 13.5 3 11.5 3 6.8 7 3 12 3s9 3.8 9 8.5z" fill="currentColor" />
        <circle cx="8.5" cy="11.5" r="1.1" fill="white" opacity="0.55" />
        <circle cx="12" cy="11.5" r="1.1" fill="white" opacity="0.55" />
        <circle cx="15.5" cy="11.5" r="1.1" fill="white" opacity="0.55" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M21 11.5c0 4.7-4 8.5-9 8.5-1.6 0-3.1-.4-4.4-1L3 20.5l1.5-3.8C3.6 15.3 3 13.5 3 11.5 3 6.8 7 3 12 3s9 3.8 9 8.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="8.5" cy="11.5" r="1" fill="currentColor" opacity="0.45" />
      <circle cx="12" cy="11.5" r="1" fill="currentColor" opacity="0.45" />
      <circle cx="15.5" cy="11.5" r="1" fill="currentColor" opacity="0.45" />
    </svg>
  )
}

// ============================================
// Quick Action Icons — Ultra-modern filled SVGs for FAB overlay
// Consistent 22×22, currentColor-based, premium filled style
// ============================================

function CriarTreinoQAIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="9" width="3.5" height="6" rx="1.2" fill="currentColor" opacity="0.85" />
      <rect x="19" y="9" width="3.5" height="6" rx="1.2" fill="currentColor" opacity="0.85" />
      <rect x="5" y="6.5" width="4.5" height="11" rx="1.8" fill="currentColor" />
      <rect x="14.5" y="6.5" width="4.5" height="11" rx="1.8" fill="currentColor" />
      <rect x="9.5" y="10.75" width="5" height="2.5" rx="1.25" fill="currentColor" />
      <circle cx="19.5" cy="5" r="4" fill="var(--color-bg-primary, #050A12)" />
      <circle cx="19.5" cy="5" r="3.2" fill="currentColor" opacity="0.2" />
      <path d="M19.5 3.2v3.6M17.7 5h3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CriarAvaliacaoQAIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3" width="16" height="18" rx="3" fill="currentColor" opacity="0.12" />
      <rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="8" y="1" width="8" height="4" rx="2" fill="currentColor" />
      <path d="M8.5 13l2.5 2.5L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CriarExercicioQAIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="6.5" r="3.5" fill="currentColor" opacity="0.25" />
      <circle cx="12" cy="6.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 12v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.5 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="19.5" cy="5" r="4" fill="var(--color-bg-primary, #050A12)" />
      <circle cx="19.5" cy="5" r="3.2" fill="currentColor" opacity="0.2" />
      <path d="M19.5 3.2v3.6M17.7 5h3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function BibliotecaExerciciosQAIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="8" height="8" rx="2.5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13.5" y="2.5" width="8" height="8" rx="2.5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2.5" y="13.5" width="8" height="8" rx="2.5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13.5" y="13.5" width="8" height="8" rx="2.5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="6.5" cy="6.5" r="1.8" fill="currentColor" />
      <circle cx="17.5" cy="6.5" r="1.8" fill="currentColor" />
      <circle cx="6.5" cy="17.5" r="1.8" fill="currentColor" />
      <circle cx="17.5" cy="17.5" r="1.8" fill="currentColor" />
    </svg>
  )
}

function BibliotecaMidiasQAIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 8v8l7-4-7-4z" fill="currentColor" />
    </svg>
  )
}

function ConvidarAlunoQRIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="7.5" height="7.5" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.4" />
      <rect x="14" y="2.5" width="7.5" height="7.5" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2.5" y="14" width="7.5" height="7.5" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.4" />
      <rect x="5" y="5" width="2.5" height="2.5" rx="0.6" fill="currentColor" />
      <rect x="16.5" y="5" width="2.5" height="2.5" rx="0.6" fill="currentColor" />
      <rect x="5" y="16.5" width="2.5" height="2.5" rx="0.6" fill="currentColor" />
      <rect x="14" y="14" width="4" height="4" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="19" y="14" width="2.5" height="3" rx="0.6" fill="currentColor" opacity="0.35" />
      <rect x="14" y="19" width="3" height="2.5" rx="0.6" fill="currentColor" opacity="0.35" />
      <rect x="19" y="19" width="2.5" height="2.5" rx="0.6" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

// ============================================
// Nav Item Type
// ============================================

interface MobileNavItem {
  id: string
  label: string
  href: string
  icon: (active: boolean) => React.ReactNode
  isFab?: boolean
  badge?: string
}

interface QuickAction {
  id: string
  label: string
  href?: string
  icon: React.ReactNode
}

// ============================================
// Nav Configs per Role
// ============================================

/** Personal + Admin: Início → Alunos → + (FAB central) → Cobrança → Config */
const personalAdminNavItems: MobileNavItem[] = [
  { id: 'home', label: 'Início', href: '/dashboard', icon: (a) => <HomeIcon active={a} /> },
  { id: 'alunos', label: 'Alunos', href: '/dashboard/students', icon: (a) => <AlunosIcon active={a} /> },
  { id: 'novo', label: 'Novo', href: '', isFab: true, icon: () => <PlusFabIcon /> },
  { id: 'cobranca', label: 'Cobrança', href: '/dashboard/payments', icon: (a) => <CobrancaIcon active={a} /> },
  { id: 'config', label: 'Config', href: '/dashboard/settings', icon: (a) => <SettingsIcon active={a} /> },
]

/** Super Admin: Início → Alunos → + (FAB central) → Cobrança → Config */
const superAdminNavItems: MobileNavItem[] = [
  { id: 'home', label: 'Início', href: '/dashboard', icon: (a) => <HomeIcon active={a} /> },
  { id: 'alunos', label: 'Alunos', href: '/dashboard/students', icon: (a) => <AlunosIcon active={a} /> },
  { id: 'novo', label: 'Novo', href: '', isFab: true, icon: () => <PlusFabIcon /> },
  { id: 'cobranca', label: 'Cobrança', href: '/dashboard/payments', icon: (a) => <CobrancaIcon active={a} /> },
  { id: 'config', label: 'Config', href: '/dashboard/settings', icon: (a) => <SettingsIcon active={a} /> },
]

/** Student: Início → Treinos → Avaliações (center) → Pagamentos → Config */
const studentNavItems: MobileNavItem[] = [
  { id: 'treinos', label: 'Treinos', href: '/treinos', icon: (a) => <TreinosIcon active={a} /> },
  { id: 'nutricao', label: 'Nutrição', href: '/nutricao', icon: (a) => <NutricaoIcon active={a} /> },
  { id: 'ia', label: 'IA', href: '/ia', icon: (a) => <IAIcon active={a} /> },
  { id: 'avaliacoes', label: 'Avaliações', href: '/avaliacoes', icon: (a) => <AvaliacoesIcon active={a} /> },
  { id: 'perfil', label: 'Perfil', href: '/perfil', icon: (a) => <PerfilIcon active={a} /> },
]

// ============================================
// Quick Actions (FAB overlay)
// ============================================

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'criar-treino',
    label: 'Criar Treino',
    href: '/dashboard/workouts/create',
    icon: <CriarTreinoQAIcon />,
  },
  {
    id: 'criar-avaliacao',
    label: 'Criar Avaliação',
    href: '/dashboard/assessments/create',
    icon: <CriarAvaliacaoQAIcon />,
  },
  {
    id: 'criar-exercicio',
    label: 'Crie seu Exercício',
    href: '/dashboard/workouts/exercises/create',
    icon: <CriarExercicioQAIcon />,
  },
  {
    id: 'biblioteca-exercicios',
    label: 'Biblioteca de Exercícios',
    href: '/dashboard/exercises',
    icon: <BibliotecaExerciciosQAIcon />,
  },
  {
    id: 'biblioteca-midias',
    label: 'Biblioteca de Mídias',
    href: '/dashboard/workouts/media/library',
    icon: <BibliotecaMidiasQAIcon />,
  },
  {
    id: 'convidar-aluno-qr',
    label: 'Convidar Aluno (QR Code)',
    href: '/dashboard/students/invite',
    icon: <ConvidarAlunoQRIcon />,
  },
]

// ============================================
// Bottom Tab Bar — Redesigned with FAB
// ============================================

export function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { isPersonalView, isStudentView, hasAdminCapabilities, isSimulationActive } = useEffectiveUserView()
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [pwaInfo, setPwaInfo] = useState<{ standalone: boolean; platform: MobilePwaPlatform }>({
    standalone: false,
    platform: 'other',
  })

  useEffect(() => {
    const update = () => setPwaInfo(detectMobilePwaPlatform())
    update()

    const mqStandalone = window.matchMedia('(display-mode: standalone)')
    const mqFullscreen = window.matchMedia('(display-mode: fullscreen)')
    mqStandalone.addEventListener('change', update)
    mqFullscreen.addEventListener('change', update)

    return () => {
      mqStandalone.removeEventListener('change', update)
      mqFullscreen.removeEventListener('change', update)
    }
  }, [])

  const pwaBottomExtraPx = useMemo(() => {
    if (!pwaInfo.standalone) return 0
    // iOS needs extra padding for home indicator bar
    if (pwaInfo.platform === 'ios') return 34
    // Android: env(safe-area-inset-bottom) handles gesture bar — no extra px needed
    return 0
  }, [pwaInfo])

  useEffect(() => {
    // When using max() in nav, the extra-bottom var is only needed when env() returns 0.
    // Set to 0 to avoid double-counting in main content area's pb calc.
    // The bottom nav itself handles its own padding via max().
    document.documentElement.style.setProperty('--mobile-nav-extra-bottom', '0px')
    return () => {
      document.documentElement.style.setProperty('--mobile-nav-extra-bottom', '0px')
    }
  }, [pwaBottomExtraPx])

  // iOS PWA: use max() to avoid double-counting env() + hardcoded px.
  // Non-PWA or Android: env() alone handles it (pwaBottomExtraPx = 0).
  const navBottomPadding = pwaBottomExtraPx > 0
    ? `max(env(safe-area-inset-bottom, 0px), ${pwaBottomExtraPx}px)`
    : `env(safe-area-inset-bottom, 0px)`

  // Determine items based on role
  let items: MobileNavItem[]
  if (isStudentView) {
    items = studentNavItems
  } else if (hasAdminCapabilities && !isSimulationActive) {
    items = superAdminNavItems
  } else if (isPersonalView || hasAdminCapabilities) {
    items = personalAdminNavItems
  } else {
    items = studentNavItems
  }

  const safeItems = Array.isArray(items) ? items : studentNavItems
  const hasFab = safeItems.some((item) => item.isFab)
  const centerIndex = Math.floor(safeItems.length / 2)

  const handleQuickAction = (action: QuickAction) => {
    haptic()
    setShowQuickActions(false)
    if (action.href) {
      router.push(action.href)
    }
  }

  const isItemActive = (item: MobileNavItem) => {
    if (item.isFab) return false
    if (item.href === '/dashboard') {
      // Início: active apenas em /dashboard (exato) ou /dashboard/ (trailing slash)
      return pathname === '/dashboard' || pathname === '/dashboard/'
    }
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <>
      {/* Quick Actions Overlay — only for personal/admin FAB */}
      <AnimatePresence>
        {showQuickActions && hasFab && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickActions(false)}
              className="fixed inset-0 z-40 bg-black/68 backdrop-blur-xl lg:hidden"
              style={{ backdropFilter: 'blur(16px) saturate(140%)', WebkitBackdropFilter: 'blur(16px) saturate(140%)' }}
            />

            {/* Quick Actions Card — z-44 so FAB stays on top */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-28 left-1/2 z-44 -translate-x-1/2 lg:hidden"
              style={{ bottom: pwaBottomExtraPx > 0 ? `calc(7rem + max(env(safe-area-inset-bottom, 0px), ${pwaBottomExtraPx}px))` : `calc(7rem + env(safe-area-inset-bottom, 0px))`, width: 'min(360px, 92vw)' }}
            >
              <div
                className="rounded-[22px] p-2 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-black/8 dark:bg-[rgba(14,16,18,0.92)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:border-white/10"
                style={{ backdropFilter: 'blur(28px) saturate(185%)', WebkitBackdropFilter: 'blur(28px) saturate(185%)' }}
              >
                <div className="px-4 pb-2.5 pt-3">
                  <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-brand-primary">
                    Ações Rápidas
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 px-1.5 pb-2">
                  {QUICK_ACTIONS.map((action, i) => (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, type: 'spring', damping: 25, stiffness: 300 }}
                      onClick={() => handleQuickAction(action)}
                      className="flex flex-col items-center gap-2 rounded-xl border-none bg-transparent px-2 py-3.5 transition-all duration-300 hover:bg-brand-primary/8 hover:shadow-[0_8px_22px_rgba(16,185,129,0.12)] active:scale-[0.95]"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary shadow-[0_2px_8px_rgba(16,185,129,0.12)] border border-brand-primary/15">
                        {action.icon}
                      </div>
                      <span className="text-center text-[11px] font-semibold leading-tight text-text-primary">
                        {action.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav
        aria-label="Navegação principal"
        className="mobile-bottom-nav fixed -bottom-px left-0 right-0 z-45 rounded-t-[28px] bg-bg-dark lg:hidden"
      >
        {/* Nav card (full width, premium glass) */}
        <div
          className="relative z-5 w-full overflow-visible rounded-t-[28px] backdrop-blur-2xl backdrop-saturate-200"
          style={{ paddingBottom: navBottomPadding }}
        >
          {/* Premium glass background — Apple Dynamic Island inspired */}
          <div
            className="nav-premium absolute inset-0 rounded-t-[28px]"
          />

          {/* PWA Standalone: solid theme fill for bottom safe area — prevents
              glass-to-solid seam between nav and system gesture bar */}
          {pwaInfo.standalone && (
            <div
              className="absolute bottom-0 left-0 right-0 z-1"
              style={{
                height: navBottomPadding,
                backgroundColor: '#050A12',
              }}
            />
          )}

          {/* Tab items */}
          <div className="relative flex items-end justify-around px-1" style={{ height: 64, paddingBottom: 6 }}>
            {safeItems.map((item, index) => {
              const isActive = isItemActive(item)

              // ===== FAB BUTTON (Personal/Admin — +Novo / QR) =====
              if (item.isFab) {
                return (
                  <div
                    key={item.id}
                    className="relative flex flex-col items-center"
                    style={{ marginTop: -20 }}
                  >
                    {item.badge && (
                      <span className="absolute -top-4 rounded-full bg-warning px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-bg-dark">
                        {item.badge}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        haptic()
                        setShowQuickActions(!showQuickActions)
                      }}
                      className="fab-ring relative flex h-13 w-13 items-center justify-center rounded-full border-none transition-all duration-300 active:scale-90"
                      style={{
                        background: showQuickActions
                          ? 'linear-gradient(135deg, #2ae88d, #1cc770)'
                          : 'linear-gradient(135deg, #3DFCA4, #28e08a)',
                        boxShadow: showQuickActions
                          ? '0 8px 32px rgba(61, 252, 164, 0.45), 0 4px 12px rgba(61, 252, 164, 0.25), 0 0 0 1px rgba(255,255,255,0.12) inset'
                          : undefined,
                        animation: showQuickActions ? 'none' : 'fab-pulse 3.2s ease-in-out infinite',
                        cursor: 'pointer',
                      }}
                    >
                      <motion.div
                        animate={{ rotate: showQuickActions ? 45 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        {showQuickActions ? <DSIcon name="x" size={20} className="text-bg-dark" /> : item.icon(false)}
                      </motion.div>
                    </button>
                    <span className="mt-0.5 text-[9px] font-semibold leading-none tracking-wide text-brand-primary">
                      {item.label}
                    </span>
                  </div>
                )
              }

              // ===== CENTER ELEVATED (Student — middle item, no FAB) =====
              if (!hasFab && index === centerIndex) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={haptic}
                    className="group relative flex flex-1 flex-col items-center active:scale-[0.88] transition-all duration-200"
                  >
                    <div className="relative flex h-9 w-9 items-center justify-center">
                      {isActive && (
                        <motion.div
                          layoutId="mobile-active-pill"
                          className="absolute inset-0 rounded-[14px] bg-brand-primary/12"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <div className={cn(
                        'relative z-10 transition-all duration-200',
                        isActive
                          ? 'text-brand-primary'
                          : 'text-slate-400 group-hover:text-slate-200'
                      )}>
                        {item.icon(isActive)}
                      </div>
                    </div>

                    <span className={cn(
                      'relative z-10 mt-0.5 text-[9px] leading-none tracking-[0.3px] transition-all duration-200',
                      isActive ? 'font-semibold text-brand-primary' : 'font-medium text-slate-400'
                    )}>
                      {item.label}
                    </span>
                  </Link>
                )
              }

              // ===== REGULAR TABS — Premium active indicator =====
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={haptic}
                  className="group relative flex min-w-10 flex-1 flex-col items-center active:scale-[0.88] transition-all duration-200"
                >
                  <div className="relative flex h-9 w-9 items-center justify-center">
                    {isActive && (
                      <motion.div
                        layoutId="mobile-active-pill"
                        className="absolute inset-0 rounded-[14px] bg-brand-primary/12"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <div className={cn(
                      'relative z-10 transition-all duration-200',
                      isActive
                        ? 'text-brand-primary'
                        : 'text-slate-400 group-hover:text-slate-200'
                    )}>
                      {item.icon(isActive)}
                    </div>
                  </div>

                  <span className={cn(
                    'relative z-10 mt-0.5 text-[9px] leading-none tracking-[0.3px] transition-all duration-200',
                    isActive ? 'font-semibold text-brand-primary' : 'font-medium text-slate-400'
                  )}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}

// ============================================
// Mobile Drawer (full nav, triggered by hamburger)
// ============================================

// SECTION_COLORS imported from @/lib/navigation (shared with sidebar)

export function MobileDrawer() {
  const open = useAppStore((s) => s.mobileNavOpen)
  const setOpen = useAppStore((s) => s.setMobileNavOpen)
  const { isPersonalView, isStudentView, hasAdminCapabilities, isSimulationActive, canSimulate, simulationMode, simulation } = useEffectiveUserView()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const pathname = usePathname()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const updateSimulation = useUpdateAdminSimulationSession()

  let navigation = (isPersonalView || hasAdminCapabilities) && !isStudentView ? [...personalNavigation] : [...studentNavigation]
  if (hasAdminCapabilities && !isSimulationActive) {
    navigation = [...navigation, adminNavigation]
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/58 backdrop-blur-xl lg:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Drawer — slides from RIGHT */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col sidebar-premium shadow-2xl lg:hidden"
            style={{
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Header — logo left, close button right */}
            <div className="flex h-16 items-center justify-between border-b border-white/8 px-4">
              <div className="flex items-center gap-0">
                <img
                  src="/images/vfit-logo-white.svg"
                  alt="VFIT"
                  className="h-6 w-auto"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.35))' }}
                />
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 hover:bg-white/8 hover:text-white/80 transition-colors"
              >
                <DSIcon name="x" size={20} />
              </button>
            </div>

            {/* Nav items — premium animated with section colors */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {navigation.map((section, sIdx) => {
                const sectionColor = SECTION_COLORS[section.title] || 'text-white/40'
                return (
                <div key={section.title} className="mb-6">
                  {sIdx > 0 && (
                    <div className="mb-3 mx-3 h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
                  )}
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                    {section.title}
                  </p>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                              isActive
                                ? 'bg-brand-primary/10 border border-brand-primary/25 text-white font-semibold shadow-[0_0_20px_rgba(16,185,129,0.1),inset_0_1px_0_rgba(16,185,129,0.08)]'
                                : 'text-white/50 hover:bg-white/6 hover:text-white/85 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:translate-x-0.5 active:scale-[0.97] active:bg-white/3'
                            )}
                          >
                            {isActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.75 rounded-r-full bg-brand-primary shadow-[0_0_12px_rgba(16,185,129,0.5),0_0_4px_rgba(16,185,129,0.8)] animate-[sidebar-accent-breathe_3s_ease-in-out_infinite]" />
                            )}
                            <DSIcon name={item.icon} size={18} className={cn('shrink-0 transition-all duration-200', isActive ? 'text-brand-primary scale-110 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]' : cn(sectionColor, 'group-hover:scale-110 group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.15)]'))} />
                            {item.label}
                            {item.badge && (
                              <span className="ml-auto rounded-md bg-brand-primary/20 border border-brand-primary/30 px-1.5 py-0.5 text-[10px] font-bold text-brand-primary"
                                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                )
              })}
            </nav>

            {/* User footer — white on charcoal */}
            <div className="border-t border-white/8 p-4">
              {/* Simulation pills — Admin/Personal/Aluno */}
              {canSimulate && (
                <div className="mb-3 flex flex-col gap-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/25 px-1" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>Simular como</p>
                  <div className="flex items-center gap-1">
                    {(['super_admin', 'personal', 'student'] as const).map((mode) => {
                      const isActive = (simulationMode || 'super_admin') === mode
                      const labels = { super_admin: 'Admin', personal: 'Personal', student: 'Aluno' } as const
                      const icons = { super_admin: 'shield' as const, personal: 'users' as const, student: 'user' as const }
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={async () => {
                            if (mode === 'super_admin') {
                              await updateSimulation.mutateAsync({ mode: 'super_admin' })
                              setOpen(false)
                            } else if (isActive) {
                              // Already in this mode, do nothing
                              return
                            } else {
                              // Switch to personal/student as self
                              await updateSimulation.mutateAsync({ mode, target_user_id: user?.id })
                              setOpen(false)
                            }
                          }}
                          disabled={updateSimulation.isPending}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-all duration-200 cursor-pointer select-none',
                            isActive
                              ? 'text-white bg-brand-primary/20 border border-brand-primary/40'
                              : 'text-white/35 bg-white/4 border border-white/6 hover:border-white/15 hover:text-white/60'
                          )}
                        >
                          <DSIcon name={icons[mode]} size={12} />
                          {labels[mode]}
                        </button>
                      )
                    })}
                  </div>
                  {isSimulationActive && simulation?.target_email && (
                    <p className="text-[9px] text-white/30 px-1 truncate">→ {simulation.target_email}</p>
                  )}
                </div>
              )}
              {user && (
                <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
                  <AvatarWithPlanBadge
                    src={user.avatar_url}
                    name={user.full_name}
                    size="md"
                    linkToPlans
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white/90">{getShortName(user.full_name)}</p>
                    <p className="truncate text-xs text-white/40">{user.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => { setFeedbackOpen(true); setOpen(false) }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/50 hover:bg-white/8 hover:text-white/80"
              >
                <DSIcon name="messageSquareHeart" size={16} />
                Sugestões & Melhorias
              </button>
              <Button
                variant="ghost-danger"
                onClick={() => { logout(); setOpen(false) }}
                className="w-full justify-start gap-3 px-3"
                aria-label="Sair da conta"
              >
                <DSIcon name="logout" size={16} />
                Sair da conta
              </Button>
            </div>
          </motion.div>
        </>
      )}

      {/* Feedback Modal */}
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </AnimatePresence>
  )
}
