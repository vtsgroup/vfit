/**
 * src/components/ui/sliding-tabs.tsx
 *
 * SlidingTabs — DS v3 Tabs with Sliding Indicator
 *
 * Exports: SlidingTabsProps, SlidingTabs
 * Hooks: useState, useRef, useEffect, useCallback
 * Features: 'use client'
 */

// ============================================
// SlidingTabs — DS v3 Tabs with Sliding Indicator
// Based on vfit-design-system-v2.jsx "SlidingTabs" component
// ============================================

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  key: string
  label: string
  count?: number
}

export interface SlidingTabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (key: string) => void
  className?: string
}

export function SlidingTabs({ tabs, activeTab, onChange, className }: SlidingTabsProps) {
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Update indicator position when active tab changes
  useEffect(() => {
    const idx = tabs.findIndex((t) => t.key === activeTab)
    const el = tabRefs.current[idx]
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
  }, [activeTab, tabs])

  const handleTabClick = useCallback(
    (key: string) => {
      onChange(key)
    },
    [onChange]
  )

  return (
    <div
      role="tablist"
      className={cn(
        // Container — DS v3: neutral bg, padding 4px, borderRadius 14px
        'relative inline-flex gap-1 overflow-hidden rounded-[14px] p-1',
        'bg-bg-tertiary dark:bg-white/5',
        className
      )}
    >
      {/* Sliding indicator — DS v2: gradient emerald, 3D shadow, smooth transition */}
      <div
        className={cn(
          'absolute bottom-1 top-1 rounded-[10px]',
          'bg-linear-to-b from-brand-primary-hover to-brand-primary',
          'shadow-[0_2px_0_#047857,0_4px_8px_rgba(34,197,94,0.25)]',
          'transition-all duration-300 ease-out-expo'
        )}
        style={{ left: indicator.left, width: indicator.width }}
      />

      {/* Tabs */}
      {tabs.map((tab, i) => (
        <button
          key={tab.key}
          ref={(el) => { tabRefs.current[i] = el }}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          tabIndex={activeTab === tab.key ? 0 : -1}
          onClick={() => handleTabClick(tab.key)}
          className={cn(
            'relative z-1 cursor-pointer whitespace-nowrap rounded-[10px] border-none bg-transparent',
            'px-5 py-2.5 text-[13px] font-semibold',
            'transition-colors duration-200 ease-linear',
            'font-[inherit]',
            activeTab === tab.key
              ? 'text-white'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-neutral-200 text-text-muted dark:bg-white/10'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
