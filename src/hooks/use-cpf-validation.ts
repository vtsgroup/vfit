/**
 * src/hooks/use-cpf-validation.ts
 *
 * CPF Validation Hook — Real-time validation with modulo 11 algorithm
 * Exports: useCpfValidation
 */

import { useState, useCallback, useMemo } from 'react'

interface CpfValidationState {
  isValid: boolean
  hasError: boolean
  errorMessage: string
}

/**
 * Validates CPF using modulo 11 algorithm
 * Checks both verification digits (Dv1 and Dv2)
 */
function validateCpfAlgorithm(cpf: string): boolean {
  // Remove formatting
  const clean = cpf.replace(/\D/g, '')

  // Must have exactly 11 digits
  if (clean.length !== 11) return false

  // Cannot be all same digits (e.g., 111.111.111-11)
  if (/^(\d)\1{10}$/.test(clean)) return false

  // Calculate first verification digit
  let sum = 0
  let multiplier = 10
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i], 10) * multiplier
    multiplier--
  }
  let remainder = sum % 11
  const dv1 = remainder < 2 ? 0 : 11 - remainder

  // If first DV doesn't match, invalid
  if (dv1 !== parseInt(clean[9], 10)) return false

  // Calculate second verification digit
  sum = 0
  multiplier = 11
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i], 10) * multiplier
    multiplier--
  }
  remainder = sum % 11
  const dv2 = remainder < 2 ? 0 : 11 - remainder

  // If second DV doesn't match, invalid
  if (dv2 !== parseInt(clean[10], 10)) return false

  return true
}

export function useCpfValidation(cpfInput: string = '') {
  const [touched, setTouched] = useState(false)

  // Validate
  const validation: CpfValidationState = useMemo(() => {
    const clean = cpfInput.replace(/\D/g, '')

    // Not touched = no error
    if (!touched) {
      return {
        isValid: false,
        hasError: false,
        errorMessage: '',
      }
    }

    // Empty
    if (clean.length === 0) {
      return {
        isValid: false,
        hasError: true,
        errorMessage: 'CPF é obrigatório',
      }
    }

    // Incomplete
    if (clean.length < 11) {
      return {
        isValid: false,
        hasError: true,
        errorMessage: `${11 - clean.length} dígitos faltando`,
      }
    }

    // Too long (shouldn't happen with maxLength, but be safe)
    if (clean.length > 11) {
      return {
        isValid: false,
        hasError: true,
        errorMessage: 'CPF muito longo',
      }
    }

    // Validate algorithm
    if (!validateCpfAlgorithm(cpfInput)) {
      return {
        isValid: false,
        hasError: true,
        errorMessage: 'CPF inválido',
      }
    }

    // Valid
    return {
      isValid: true,
      hasError: false,
      errorMessage: '',
    }
  }, [cpfInput, touched])

  const handleBlur = useCallback(() => {
    setTouched(true)
  }, [])

  const handleFocus = useCallback(() => {
    // Optionally mark touched on focus
    // setTouched(true)
  }, [])

  return {
    ...validation,
    touched,
    setTouched,
    handleBlur,
    handleFocus,
  }
}
