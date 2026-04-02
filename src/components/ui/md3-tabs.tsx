/**
 * src/components/ui/md3-tabs.tsx
 *
 * MD3 Tabs — Material You Sliding Pill Indicator
 *
 * Exports: MD3Tabs, MD3TabPanel
 * Hooks: useState, useRef, useEffect, useCallback
 * Features: 'use client' · Framer Motion
 */

// ============================================
// MD3 Tabs — Material You Sliding Pill Indicator
// Apple-smooth transitions, brand-consistent
// ============================================

'use client'

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  badge?: number | string
}

interface MD3TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline' | 'segmented'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
}

// ============================================
// MD3 Tabs Component
// ============================================

export function MD3Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className,
}: MD3TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  // ─── Update indicator position ───
  const updateIndicator = useCallback(() => {
    const activeEl = tabRefs.current.get(activeTab)
    const container = containerRef.current
    if (!activeEl || !container) return

    const containerRect = container.getBoundingClientRect()
    const activeRect = activeEl.getBoundingClientRect()

    setIndicatorStyle({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
    })
  }, [activeTab])

  useEffect(() => {
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [updateIndicator])

  // ─── Size classes ───
  const sizeClasses = {
    sm: 'text-xs h-8 px-2.5 gap-1',
    md: 'text-sm h-10 px-3.5 gap-1.5',
    lg: 'text-base h-12 px-5 gap-2',
  }

  // ─── Segmented variant (Apple-style) ───
  if (variant === 'segmented') {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative inline-flex rounded-xl p-0.5 gap-0.5',
          'bg-(--surface-container) border border-(--outline-variant)',
          fullWidth && 'w-full',
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative z-10 inline-flex items-center justify-center rounded-[10px] font-medium transition-all duration-200',
                sizeClasses[size],
                fullWidth && 'flex-1',
                isActive
                  ? 'text-(--on-surface) font-semibold'
                  : 'text-(--on-surface-variant) hover:text-(--on-surface)'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={cn(
                  'ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                  isActive ? 'bg-brand-primary/15 text-brand-primary' : 'bg-(--surface-container-high) text-(--on-surface-variant)'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
        {/* Sliding background pill */}
        <motion.div
          layout
          layoutId="segmented-bg"
          className="absolute top-0.5 z-0 rounded-[10px] bg-(--surface-container-lowest) shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            height: 'calc(100% - 4px)',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      </div>
    )
  }

  // ─── Pills variant ───
  if (variant === 'pills') {
    return (
      <div
        ref={containerRef}
        className={cn(
          'flex gap-1.5 overflow-x-auto no-scrollbar',
          fullWidth && 'w-full',
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative shrink-0 inline-flex items-center justify-center rounded-full font-medium transition-all duration-200',
                sizeClasses[size],
                fullWidth && 'flex-1',
                isActive
                  ? 'bg-brand-primary/12 text-brand-primary border border-brand-primary/20 shadow-[0_0_12px_rgba(34,197,94,0.08)]'
                  : 'bg-(--surface-container-low) text-(--on-surface-variant) border border-(--outline-variant) hover:bg-(--surface-container) hover:text-(--on-surface) hover:border-(--outline)'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={cn(
                  'ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                  isActive ? 'bg-brand-primary/20 text-brand-primary' : 'bg-(--surface-container-high) text-(--on-surface-variant)'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // ─── Underline variant ───
  if (variant === 'underline') {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative flex border-b border-(--outline-variant)',
          fullWidth && 'w-full',
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative inline-flex items-center justify-center font-medium transition-all duration-200 border-b-2 -mb-px',
                sizeClasses[size],
                fullWidth && 'flex-1',
                isActive
                  ? 'text-brand-primary border-brand-primary'
                  : 'text-(--on-surface-variant) border-transparent hover:text-(--on-surface) hover:border-(--outline)'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={cn(
                  'ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                  isActive ? 'bg-brand-primary/15 text-brand-primary' : 'bg-(--surface-container-high) text-(--on-surface-variant)'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // ─── Default: MD3 tabs with sliding pill indicator ───
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex gap-0.5 overflow-x-auto no-scrollbar',
        fullWidth && 'w-full',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative z-10 inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-200',
              sizeClasses[size],
              fullWidth && 'flex-1',
              isActive
                ? 'text-brand-primary font-semibold'
                : 'text-(--on-surface-variant) hover:text-(--on-surface)'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                'ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                isActive ? 'bg-brand-primary/15 text-brand-primary' : 'bg-(--surface-container-high) text-(--on-surface-variant)'
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
      {/* Sliding pill background */}
      <motion.div
        className="absolute z-0 rounded-xl bg-brand-primary/8 dark:bg-brand-primary/12"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          top: 0,
          height: '100%',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        layout
      />
    </div>
  )
}

// ============================================
// MD3 Tab Panel — Content area with smooth transitions
// ============================================

interface MD3TabPanelProps {
  tabId: string
  activeTab: string
  children: ReactNode
  className?: string
}

export function MD3TabPanel({ tabId, activeTab, children, className }: MD3TabPanelProps) {
  if (tabId !== activeTab) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={cn('', className)}
    >
      {children}
    </motion.div>
  )
}
