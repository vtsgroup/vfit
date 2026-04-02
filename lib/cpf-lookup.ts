/**
 * lib/cpf-lookup.ts
 *
 * CPF Lookup — Hub do Desenvolvedor API
 *
 * Exports: CpfLookupResult
 */

// ============================================
// CPF Lookup — Hub do Desenvolvedor API
// https://www.hubdodesenvolvedor.com.br/detalhes/cpf/
//
// Consulta Receita Federal: CPF + Nascimento → Nome Completo
// Dados são processados server-side (LGPD compliant)
// Nenhum dado pessoal é exposto além do nome ao frontend
// ============================================

export interface CpfLookupResult {
  success: boolean
  full_name?: string
  /** Data de nascimento retornada pela Receita (DD/MM/YYYY) */
  birth_date?: string
  /** Situação cadastral na Receita: "Regular", "Pendente", etc. */
  status_rf?: string
  error?: string
}

interface HubDevCpfResponse {
  status: boolean
  /** "OK" = sucesso, "NOK" = erro */
  return: 'OK' | 'NOK'
  /** Créditos consumidos (1=base, 5=receita, 25=turbo) */
  consumed?: number
  /** Dados do CPF — presente quando return === "OK" */
  result?: {
    numero_de_cpf?: string
    nome_da_pf?: string
    data_nascimento?: string
    situacao_cadastral?: string
    data_inscricao?: string
    digito_verificador?: string
    comprovante_emitido?: string
    comprovante_emitido_data?: string
  }
  /** Mensagem de erro — presente quando return === "NOK" */
  message?: string
}

/**
 * Consulta nome completo a partir de CPF + data de nascimento
 * via Hub do Desenvolvedor API (dados da Receita Federal)
 *
 * @param cpf     - CPF limpo (só dígitos) ou formatado
 * @param apiToken  - Token da API Hub do Desenvolvedor
 * @param birthDate - Data de nascimento no formato DD/MM/YYYY (opcional)
 */
export async function lookupCpf(
  cpf: string,
  apiToken: string,
  birthDate?: string
): Promise<CpfLookupResult> {
  const cleanCpf = cpf.replace(/\D/g, '')

  if (cleanCpf.length !== 11) {
    return { success: false, error: 'CPF inválido' }
  }

  if (!apiToken) {
    return { success: false, error: 'Serviço de consulta CPF não configurado' }
  }

  try {
    const url = new URL('https://ws.hubdodesenvolvedor.com.br/v2/cpf/')
    url.searchParams.set('cpf', cleanCpf)
    if (birthDate) url.searchParams.set('data', birthDate)
    url.searchParams.set('token', apiToken)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VFIT/1.0',
      },
      // 15s timeout — API pode demorar na consulta Receita Federal
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      console.error(`[cpf-lookup] HTTP ${response.status}: ${response.statusText}`)
      return { success: false, error: 'Serviço temporariamente indisponível' }
    }

    const data = await response.json() as HubDevCpfResponse

    // return === "NOK" indica erro
    if (data.return !== 'OK' || !data.result) {
      const msg = data.message || 'CPF não encontrado ou dados incorretos'
      console.warn(`[cpf-lookup] NOK: ${msg}`)
      return { success: false, error: msg }
    }

    const nome = data.result.nome_da_pf || ''

    if (!nome) {
      return { success: false, error: 'Nome não encontrado para este CPF' }
    }

    return {
      success: true,
      full_name: nome.trim(),
      birth_date: data.result.data_nascimento || undefined,
      status_rf: data.result.situacao_cadastral,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error(`[cpf-lookup] Error: ${msg}`)

    if (msg.includes('timeout') || msg.includes('abort')) {
      return { success: false, error: 'Consulta expirou. Tente novamente.' }
    }

    return { success: false, error: 'Falha ao consultar CPF' }
  }
}
