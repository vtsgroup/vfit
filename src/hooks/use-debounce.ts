/**
 * src/hooks/use-debounce.ts
 *
 * useDebounce — debounce a value
 *
 * Exports: useDebounce
 * Hooks: useDebounce, useEffect, useState
 * Features: 'use client'
 */

// ============================================
// useDebounce — debounce a value
// ============================================

'use client'

import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
