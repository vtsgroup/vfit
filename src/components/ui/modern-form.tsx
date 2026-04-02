/**
 * src/components/ui/modern-form.tsx
 *
 * Modern Form Card — White/light form containers
 *
 * Exports: FormCard, FormSection, FormDivider, ModernInput, ModernSelect
 * Features: 'use client'
 */

// ============================================
// Modern Form Card — White/light form containers
// Clean, elevated, with subtle shadows for maximum readability
// ============================================

'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// Form Card — Container branco para formulários
// ============================================

interface FormCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  icon?: ReactNode
  footer?: ReactNode
}

export const FormCard = forwardRef<HTMLDivElement, FormCardProps>(
  ({ title, subtitle, icon, footer, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Fundo branco com contraste limpo
          'rounded-2xl border dark:border-white/8 light:border-slate-200 dark:bg-white/4 light:bg-white backdrop-blur-sm',
          'dark:shadow-[0_2px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.06)] light:shadow-[0_2px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]',
          'overflow-hidden',
          className
        )}
        {...props}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="border-b dark:border-white/6 light:border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10">
                  {icon}
                </div>
              )}
              <div>
                <h3 className="text-base font-semibold dark:text-white light:text-slate-900">{title}</h3>
                {subtitle && <p className="mt-0.5 text-xs dark:text-white/50 light:text-slate-500">{subtitle}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t dark:border-white/6 light:border-slate-200 dark:bg-white/2 light:bg-slate-50 px-5 py-3.5 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    )
  }
)
FormCard.displayName = 'FormCard'

// ============================================
// Form Section — Agrupador de campos
// ============================================

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div>
          {title && <h4 className="text-sm font-semibold dark:text-white light:text-slate-900">{title}</h4>}
          {description && <p className="mt-0.5 text-xs dark:text-white/40 light:text-slate-500">{description}</p>}
        </div>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

// ============================================
// Form Divider — separador de seções
// ============================================

export function FormDivider({ label }: { label?: string }) {
  if (!label) return <div className="border-t dark:border-white/6 light:border-slate-200 my-5" />
  
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t dark:border-white/6 light:border-slate-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-bg-secondary px-3 text-[10px] font-semibold uppercase tracking-widest dark:text-white/25 light:text-slate-400">
          {label}
        </span>
      </div>
    </div>
  )
}

// ============================================
// Modern Input — Input com estilo branco/limpo
// ============================================

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  suffix?: ReactNode
}

export const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, label, error, hint, icon, suffix, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold dark:text-white/70 light:text-slate-600">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white/30 light:text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex h-11 w-full rounded-xl border dark:bg-white/6 light:bg-slate-50 text-sm dark:text-white light:text-slate-900 transition-all duration-200',
              'dark:placeholder:text-white/25 light:placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 dark:focus:bg-white/8 light:focus:bg-white',
              'disabled:cursor-not-allowed disabled:opacity-40',
              icon ? 'pl-10' : 'px-3.5',
              suffix ? 'pr-10' : 'pr-3.5',
              error
                ? 'border-red-500/40 focus:ring-red-500/25'
                : 'dark:border-white/8 light:border-slate-200 dark:hover:border-white/15 light:hover:border-slate-300',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-white/30 light:text-slate-400">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs dark:text-white/30 light:text-slate-500">{hint}</p>}
      </div>
    )
  }
)
ModernInput.displayName = 'ModernInput'

// ============================================
// Modern Select — Select com estilo limpo
// ============================================

interface ModernSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const ModernSelect = forwardRef<HTMLSelectElement, ModernSelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-xs font-semibold dark:text-white/70 light:text-slate-600">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'flex h-11 w-full rounded-xl border dark:bg-white/6 light:bg-slate-50 px-3.5 text-sm dark:text-white light:text-slate-900 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40',
            'disabled:cursor-not-allowed disabled:opacity-40',
            error ? 'border-red-500/40' : 'dark:border-white/8 light:border-slate-200 dark:hover:border-white/15 light:hover:border-slate-300',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="dark:bg-kpi-dark dark:text-white light:bg-white light:text-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
ModernSelect.displayName = 'ModernSelect'

// ============================================
// Modern Textarea
// ============================================

interface ModernTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const ModernTextarea = forwardRef<HTMLTextAreaElement, ModernTextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="mb-1.5 block text-xs font-semibold dark:text-white/70 light:text-slate-600">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'flex min-h-22 w-full rounded-xl border dark:bg-white/6 light:bg-slate-50 px-3.5 py-3 text-sm dark:text-white light:text-slate-900 transition-all duration-200',
            'dark:placeholder:text-white/25 light:placeholder:text-slate-400 resize-y',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 dark:focus:bg-white/8 light:focus:bg-white',
            'disabled:cursor-not-allowed disabled:opacity-40',
            error ? 'border-red-500/40' : 'dark:border-white/8 light:border-slate-200 dark:hover:border-white/15 light:hover:border-slate-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
ModernTextarea.displayName = 'ModernTextarea'
