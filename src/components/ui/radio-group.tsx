/**
 * src/components/ui/radio-group.tsx
 *
 * RadioGroup — Ultra-Modern MD3 + Apple-style
 * Features: 'use client', spring animation, card variant, a11y
 */

'use client'

import { createContext, useContext, useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// --- Context ---
interface RadioGroupContextValue {
  value: string
  onValueChange: (value: string) => void
  name: string
  disabled?: boolean
  size: RadioSize
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

// --- Types ---
type RadioSize = 'sm' | 'md' | 'lg'
type RadioVariant = 'default' | 'card'

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  name?: string
  children: ReactNode
  className?: string
  disabled?: boolean
  size?: RadioSize
  label?: string
  error?: string
  /** Layout direction */
  orientation?: 'vertical' | 'horizontal'
}

interface RadioItemProps {
  value: string
  label?: string
  description?: string
  children?: ReactNode
  disabled?: boolean
  className?: string
  variant?: RadioVariant
}

// --- Size map ---
const sizeMap = {
  sm: { outer: 'h-4 w-4', inner: 'h-2 w-2' },
  md: { outer: 'h-5 w-5', inner: 'h-2.5 w-2.5' },
  lg: { outer: 'h-6 w-6', inner: 'h-3 w-3' },
}

// --- RadioGroup ---
export function RadioGroup({
  value,
  onValueChange,
  name: providedName,
  children,
  className,
  disabled,
  size = 'md',
  label,
  error,
  orientation = 'vertical',
}: RadioGroupProps) {
  const generatedName = useId()
  const name = providedName || generatedName

  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, name, disabled, size }}>
      <fieldset
        role="radiogroup"
        aria-orientation={orientation}
        className={cn('flex', orientation === 'vertical' ? 'flex-col gap-3' : 'flex-row flex-wrap gap-4', className)}
        disabled={disabled}
      >
        {label && (
          <legend className="mb-2 text-sm font-semibold text-text-primary">{label}</legend>
        )}
        {children}
        {error && (
          <span className="text-xs text-error font-medium mt-1">{error}</span>
        )}
      </fieldset>
    </RadioGroupContext.Provider>
  )
}

// --- RadioItem ---
export function RadioItem({
  value: itemValue,
  label,
  description,
  children,
  disabled: itemDisabled,
  className,
  variant = 'default',
}: RadioItemProps) {
  const ctx = useContext(RadioGroupContext)
  if (!ctx) throw new Error('RadioItem must be used within RadioGroup')

  const { value: groupValue, onValueChange, name, disabled: groupDisabled, size } = ctx
  const isSelected = groupValue === itemValue
  const isDisabled = itemDisabled || groupDisabled
  const id = useId()

  if (variant === 'card') {
    return (
      <label
        htmlFor={id}
        className={cn(
          'group relative flex cursor-pointer items-start gap-3 rounded-xl p-4',
          'border transition-all duration-200',
          isSelected
            ? 'border-brand-primary/40 bg-brand-primary/8 shadow-[0_0_20px_rgba(16,185,129,0.08)] light:border-brand-primary/30 light:bg-brand-primary/6 light:shadow-[0_0_16px_rgba(16,185,129,0.06)]'
            : 'border-white/8 bg-white/3 hover:border-white/14 hover:bg-white/5 light:border-slate-200 light:bg-slate-50/60 light:hover:border-slate-300 light:hover:bg-white',
          isDisabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <RadioDot size={size} selected={isSelected} />
        <div className="flex flex-col gap-0.5">
          {label && <span className="text-sm font-semibold text-text-primary">{label}</span>}
          {description && <span className="text-xs text-text-secondary leading-relaxed">{description}</span>}
          {children}
        </div>
        <input
          type="radio"
          id={id}
          name={name}
          value={itemValue}
          checked={isSelected}
          onChange={() => onValueChange(itemValue)}
          disabled={isDisabled}
          className="sr-only"
        />
      </label>
    )
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        'group flex cursor-pointer items-start gap-3',
        isDisabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <RadioDot size={size} selected={isSelected} />
      {(label || description) && (
        <div className="flex flex-col gap-0.5 pt-px">
          {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
          {description && <span className="text-xs text-text-secondary">{description}</span>}
        </div>
      )}
      <input
        type="radio"
        id={id}
        name={name}
        value={itemValue}
        checked={isSelected}
        onChange={() => onValueChange(itemValue)}
        disabled={isDisabled}
        className="sr-only"
      />
    </label>
  )
}

// --- RadioDot (visual) ---
function RadioDot({ size, selected }: { size: RadioSize; selected: boolean }) {
  const s = sizeMap[size]
  return (
    <span
      className={cn(
        'relative mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full',
        'border-2 transition-all duration-200 ease-bounce',
        s.outer,
        selected
          ? 'border-brand-primary bg-brand-primary shadow-[0_0_8px_rgba(16,185,129,0.3)]'
          : 'border-zinc-500/50 group-hover:border-brand-primary-hover/60 light:border-slate-300 light:group-hover:border-brand-primary/50'
      )}
    >
      <span
        className={cn(
          'rounded-full bg-white transition-all duration-200 ease-bounce',
          s.inner,
          selected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        )}
      />
    </span>
  )
}
