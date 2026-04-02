/**
 * src/hooks/use-cpf-lookup.ts
 *
 * useCpfLookup — Consulta nome completo via CPF + nascimento
 *
 * Exports: useCpfLookup
 * Hooks: useCpfLookup, useMutation
 * Features: React Query
 */

// ============================================
// useCpfLookup — Consulta nome completo via CPF + nascimento
// Chama o backend que consulta Hub do Desenvolvedor (Receita Federal)
// Dados processados server-side — LGPD compliant
// ============================================

import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

interface CpfLookupResponse {
  available: boolean
  found?: boolean
  full_name?: string
  birth_date?: string
  status_rf?: string
  message?: string
}

/**
 * Hook para consultar nome completo + nascimento a partir de CPF
 *
 * @example
 * const lookup = useCpfLookup()
 * lookup.mutate({ cpf: '000.000.000-00' })
 * // lookup.data?.full_name → "NOME COMPLETO"
 * // lookup.data?.birth_date → "01/01/1990"
 */
export function useCpfLookup() {
  return useMutation({
    mutationFn: async (data: { cpf: string; birth_date?: string }) => {
      const res = await api.post<CpfLookupResponse>('/api/v1/cpf/lookup', data, { auth: false })
      return res.data
    },
  })
}
