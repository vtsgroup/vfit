'use client'

/**
 * src/components/onboarding/onboarding-animations.tsx
 *
 * Reusable animation components for ultra-modern onboarding redesign.
 * - AnimatedLogo: Floating + glow effect
 * - FloatingOrbs: Mesh gradient with drifting orbs
 * - MeshGradientBg: Dynamic mesh gradient background
 * - GlassCard: Glassmorphic container with rim light
 * - AnimatedCounter: Spring-based number counter
 * - AnimatedCheckmark: Stroke-based checkmark animation
 */

import { motion } from 'framer-motion'
import React from 'react'

// ─────────────────────────────────────────
// Animated Logo with Glow
// ─────────────────────────────────────────

interface AnimatedLogoProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  glowColor?: string
}

export function AnimatedLogo({
  children,
  size = 'lg',
  glowColor = 'rgba(34, 197, 94, 0.6)',
}: AnimatedLogoProps) {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-36 w-36',
  }

  return (
    <motion.div
      className="relative"
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Outer glow */}
      <motion.div
        className={`absolute inset-0 rounded-[2rem] blur-3xl ${sizeClasses[size]}`}
        style={{
          backgroundColor: glowColor,
      }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Inner glow + rim light */}
      <motion.div
        className={`relative ${sizeClasses[size]} flex items-center justify-center rounded-[2rem] backdrop-blur-md`}
        style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(30, 41, 59, 0.8) 100%)',
          boxShadow: `
            inset 0 1px 20px rgba(34, 197, 94, 0.2),
            0 0 40px ${glowColor}
          `,
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────
// Floating Orbs with Mesh Gradient
// ─────────────────────────────────────────

interface OrbConfig {
  id: string
  size: 'sm' | 'md' | 'lg'
  color: string
  duration: number
  delay: number
  startX: number
  startY: number
  offsetX: number
  offsetY: number
}

const DEFAULT_ORBS: OrbConfig[] = [
  {
    id: 'orb-1',
    size: 'md',
    color: 'rgba(34, 197, 94, 0.25)',
    duration: 8,
    delay: 0,
    startX: 10,
    startY: 20,
    offsetX: 40,
    offsetY: 60,
  },
  {
    id: 'orb-2',
    size: 'sm',
    color: 'rgba(74, 222, 128, 0.15)',
    duration: 10,
    delay: 1,
    startX: 70,
    startY: 60,
    offsetX: -30,
    offsetY: 50,
  },
  {
    id: 'orb-3',
    size: 'lg',
    color: 'rgba(34, 197, 94, 0.15)',
    duration: 12,
    delay: 2,
    startX: 50,
    startY: 10,
    offsetX: 30,
    offsetY: 40,
  },
]

interface FloatingOrbsProps {
  orbs?: OrbConfig[]
  className?: string
}

export function FloatingOrbs({ orbs = DEFAULT_ORBS, className = '' }: FloatingOrbsProps) {
  const sizeMap = { sm: 80, md: 160, lg: 240 }

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-3xl"
          style={{
            width: sizeMap[orb.size],
            height: sizeMap[orb.size],
            background: orb.color,
            left: `${orb.startX}%`,
            top: `${orb.startY}%`,
            x: '-50%',
            y: '-50%',
          }}
          animate={{
            x: ['-50%', `calc(-50% + ${orb.offsetX}px)`, '-50%'],
            y: ['-50%', `calc(-50% + ${orb.offsetY}px)`, '-50%'],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// Mesh Gradient Background
// ─────────────────────────────────────────

interface MeshGradientBgProps {
  className?: string
  animate?: boolean
}

export function MeshGradientBg({ className = '', animate = true }: MeshGradientBgProps) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 ${className}`}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 1000 1000"
    >
      <defs>
        <filter id="mesh-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
        </filter>
        <linearGradient id="mesh-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0d1b2a" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="1000" height="1000" fill="url(#mesh-grad)" />

      {/* Animated blobs */}
      {animate && (
        <>
          <motion.ellipse
            cx="200"
            cy="300"
            rx="300"
            ry="200"
            fill="rgba(34, 197, 94, 0.15)"
            filter="url(#mesh-blur)"
            animate={{
              cx: [200, 250, 200],
              cy: [300, 350, 300],
              rx: [300, 320, 300],
              ry: [200, 220, 200],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.ellipse
            cx="800"
            cy="700"
            rx="250"
            ry="300"
            fill="rgba(74, 222, 128, 0.12)"
            filter="url(#mesh-blur)"
            animate={{
              cx: [800, 750, 800],
              cy: [700, 650, 700],
              rx: [250, 270, 250],
              ry: [300, 320, 300],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}
    </svg>
  )
}

// ─────────────────────────────────────────
// Glass Card Container
// ─────────────────────────────────────────

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function GlassCard({ children, className = '', delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: 'easeOut',
      }}
      className={`backdrop-blur-2xl rounded-3xl border border-emerald-500/20 p-8 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.5) 100%)',
        boxShadow: `
          inset 0 1px 20px rgba(34, 197, 94, 0.15),
          0 0 40px rgba(34, 197, 94, 0.25),
          0 8px 32px rgba(0, 0, 0, 0.4)
        `,
      }}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────
// Animated Counter (Spring Physics)
// ─────────────────────────────────────────

interface AnimatedCounterProps {
  value: number | string
  duration?: number
  delay?: number
  suffix?: string
  format?: (val: number) => string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  delay = 0,
  suffix = '',
  format,
  className = '',
}: AnimatedCounterProps) {
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value

  if (isNaN(numValue)) {
    return <span className={className}>{value}{suffix}</span>
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 75,
        damping: 15,
      }}
      className={className}
    >
      <motion.span
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: delay + 0.1,
          duration: 0.6,
          ease: 'easeOut',
        }}
      >
        {format ? format(numValue) : numValue.toLocaleString('pt-BR')}
        {suffix}
      </motion.span>
    </motion.div>
  )
}

// ─────────────────────────────────────────
// Animated Checkmark
// ─────────────────────────────────────────

interface AnimatedCheckmarkProps {
  delay?: number
  size?: number
  className?: string
}

export function AnimatedCheckmark({
  delay = 0,
  size = 24,
  className = '',
}: AnimatedCheckmarkProps) {
  const strokeWidth = size * 0.12

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 12,
      }}
    >
      <motion.path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          delay: delay + 0.1,
          duration: 0.6,
          ease: 'easeOut',
        }}
      />
    </motion.svg>
  )
}

// ─────────────────────────────────────────
// Animated Progress Bar with Shimmer
// ─────────────────────────────────────────

interface AnimatedProgressBarProps {
  progress: number
  className?: string
}

export function AnimatedProgressBar({
  progress,
  className = '',
}: AnimatedProgressBarProps) {
  return (
    <div className={`relative h-2 overflow-hidden rounded-full bg-white/10 ${className}`}>
      <motion.div
        className="h-full rounded-full bg-linear-to-r from-emerald-300 via-brand-primary to-lime-300"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 18px rgba(34, 197, 94, 0.42)',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{
          type: 'spring',
          stiffness: 30,
          damping: 15,
        }}
      >
        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────
// Staggered Container
// ─────────────────────────────────────────

interface StaggerContainerProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

export function StaggerContainer({
  children,
  staggerDelay = 0.05,
  className = '',
}: StaggerContainerProps) {
  const childArray = React.Children.toArray(children)

  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            delay: index * staggerDelay,
            duration: 0.4,
            ease: 'easeOut',
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
