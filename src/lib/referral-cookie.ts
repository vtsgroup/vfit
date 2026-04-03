/**
 * src/lib/referral-cookie.ts
 *
 * Referral Cookie — Client-side tracking
 *
 * Exports: saveReferralCode, getReferralCode, clearReferralCode
 */

// ============================================
// Referral Cookie — Client-side tracking
// Salva o código de indicação por 3 dias
// Proteção: primeiro link clicado vale por 3 dias
// ============================================

const COOKIE_NAME = 'pia_ref'
const COOKIE_DAYS = 3

interface ReferralData {
  code: string
  timestamp: number // ms since epoch
}

/**
 * Salva o código de referral em cookie por 3 dias.
 * Se já existe um cookie válido (dentro dos 3 dias), NÃO sobrescreve —
 * o primeiro indicador tem proteção de 3 dias.
 */
export function saveReferralCode(code: string): void {
  if (!code || typeof document === 'undefined') return

  const existing = getReferralData()

  // Se já tem cookie válido e está dentro dos 3 dias, NÃO sobrescreve
  if (existing) {
    const elapsed = Date.now() - existing.timestamp
    const threeDaysMs = COOKIE_DAYS * 24 * 60 * 60 * 1000
    if (elapsed < threeDaysMs) {
      if (process.env.NODE_ENV === 'development') console.log(`[Referral] Cookie protegido: ${existing.code}`)
      return
    }
  }

  // Salvar novo cookie
  const data: ReferralData = { code, timestamp: Date.now() }
  const expires = new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000)
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; path=/; expires=${expires.toUTCString()}; SameSite=Lax; Secure`

  // Backup em localStorage para robustez
  try {
    localStorage.setItem(COOKIE_NAME, JSON.stringify(data))
  } catch { /* ignore */ }

  if (process.env.NODE_ENV === 'development') console.log(`[Referral] Cookie salvo: ${code}`)
}

/**
 * Lê o código de referral do cookie ou localStorage
 */
export function getReferralCode(): string | null {
  const data = getReferralData()
  if (!data) return null

  // Verificar se ainda está dentro dos 3 dias
  const elapsed = Date.now() - data.timestamp
  const threeDaysMs = COOKIE_DAYS * 24 * 60 * 60 * 1000
  if (elapsed >= threeDaysMs) {
    clearReferralCode()
    return null
  }

  return data.code
}

/**
 * Limpa o cookie de referral (após registro bem-sucedido)
 */
export function clearReferralCode(): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`
  }
  try {
    localStorage.removeItem(COOKIE_NAME)
  } catch { /* ignore */ }
}

/**
 * Dados internos do cookie
 */
function getReferralData(): ReferralData | null {
  // Tentar cookie primeiro
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === COOKIE_NAME && value) {
        try {
          return JSON.parse(decodeURIComponent(value))
        } catch { /* ignore */ }
      }
    }
  }

  // Fallback para localStorage
  try {
    const stored = localStorage.getItem(COOKIE_NAME)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }

  return null
}
