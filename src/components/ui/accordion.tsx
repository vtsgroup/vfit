/**
 * src/components/ui/accordion.tsx
 *
 * Accordion / Collapsible — Ultra-Modern MD3 + Apple-style
 * Features: 'use client', spring animation, single/multi mode, a11y, glass surface
 */

'use client'

import { createContext, useContext, useState, useRef, useEffect, useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// --- Context ---
interface AccordionContextValue {
  openItems: string[]
  toggle: (id: string) => void
  variant: AccordionVariant
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

// --- Types ---
type AccordionVariant = 'default' | 'card' | 'ghost'

interface AccordionProps {
  children: ReactNode
  className?: string
  /** 'single' = only one open at a time, 'multiple' = independent */
  type?: 'single' | 'multiple'
  /** Default open item IDs */
  defaultOpen?: string[]
  variant?: AccordionVariant
}

interface AccordionItemProps {
  children: ReactNode
  value: string
  className?: string
  disabled?: boolean
}

interface AccordionTriggerProps {
  children: ReactNode
  className?: string
  icon?: ReactNode
}

interface AccordionContentProps {
  children: ReactNode
  className?: string
}

// --- Accordion (container) ---
export function Accordion({
  children,
  className,
  type = 'single',
  defaultOpen = [],
  variant = 'default',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen)

  const toggle = (id: string) => {
    setOpenItems((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id)
      if (type === 'single') return [id]
      return [...prev, id]
    })
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggle, variant }}>
      <div className={cn('flex flex-col', variant === 'default' ? 'divide-y dark:divide-white/8 light:divide-slate-200/60' : 'gap-2', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

// --- Item Context ---
interface ItemContextValue {
  itemId: string
  isOpen: boolean
  disabled: boolean
}

const ItemContext = createContext<ItemContextValue | null>(null)

// --- AccordionItem ---
export function AccordionItem({ children, value, className, disabled = false }: AccordionItemProps) {
  const ctx = useContext(AccordionContext)
  if (!ctx) throw new Error('AccordionItem must be within Accordion')
  const isOpen = ctx.openItems.includes(value)

  const variantClasses: Record<AccordionVariant, string> = {
    default: '',
    card: cn(
      'rounded-xl border transition-all duration-200',
      isOpen
        ? 'border-brand-primary/25 bg-bg-tertiary/60 shadow-[0_4px_16px_rgba(0,0,0,0.2),0_0_24px_rgba(16,185,129,0.08)] backdrop-blur-sm'
        : 'border-border-light/60 bg-bg-secondary/40 hover:border-brand-primary/20'
    ),
    ghost: 'rounded-lg',
  }

  return (
    <ItemContext.Provider value={{ itemId: value, isOpen, disabled }}>
      <div className={cn(variantClasses[ctx.variant], disabled && 'opacity-50', className)}>
        {children}
      </div>
    </ItemContext.Provider>
  )
}

// --- AccordionTrigger ---
export function AccordionTrigger({ children, className, icon }: AccordionTriggerProps) {
  const ctx = useContext(AccordionContext)
  const itemCtx = useContext(ItemContext)
  if (!ctx || !itemCtx) throw new Error('AccordionTrigger must be within AccordionItem')
  const { toggle } = ctx
  const { itemId, isOpen, disabled } = itemCtx
  const triggerId = useId()

  return (
    <button
      type="button"
      id={triggerId}
      aria-expanded={isOpen}
      aria-controls={`${triggerId}-content`}
      disabled={disabled}
      onClick={() => toggle(itemId)}
      className={cn(
        'group flex w-full items-center justify-between gap-3 py-4 px-4',
        'text-left text-sm font-semibold text-text-primary',
        'transition-colors duration-150',
        'hover:text-brand-primary-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:rounded-lg',
        'disabled:cursor-not-allowed',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="shrink-0 text-text-secondary">{icon}</span>}
        <span>{children}</span>
      </div>
      {/* Chevron */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'shrink-0 text-text-muted transition-transform duration-300 ease-bounce',
          isOpen && 'rotate-180 text-brand-primary-hover'
        )}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

// --- AccordionContent ---
export function AccordionContent({ children, className }: AccordionContentProps) {
  const itemCtx = useContext(ItemContext)
  if (!itemCtx) throw new Error('AccordionContent must be within AccordionItem')
  const { isOpen } = itemCtx
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [isOpen, children])

  return (
    <div
      role="region"
      style={{ height: isOpen ? height : 0 }}
      className={cn(
        'overflow-hidden transition-[height] duration-300 ease-out-expo'
      )}
    >
      <div ref={contentRef} className={cn('px-4 pb-4 text-sm text-text-secondary leading-relaxed', className)}>
        {children}
      </div>
    </div>
  )
}
