/**
 * src/lib/api-client.ts
 *
 * API Client — fetch wrapper para o backend
 *
 * Exports: isDemoMode, setDemoMode, ApiResponse, ApiError, ApiClientError
 * Hooks: useAuthStore
 * Features: Auth: useAuthStore
 */

// ============================================
// API Client — fetch wrapper para o backend
// Com fallback automático para mock quando backend offline
// ============================================

import { useAuthStore } from '@/stores/auth-store'
import { handleMockRequest, isNetworkError } from './mock-api'
import { logClientIssue, flushDebugQueue } from './debug-logger'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vfit.app.br'

// Demo mode: ativado automaticamente quando API real falha
// Inclui mecanismo de recovery: tenta reconectar a cada 30s
let _demoMode = false
let _demoRetryTimer: ReturnType<typeof setInterval> | null = null
let _networkFailureStreak = 0
export function isDemoMode() { return _demoMode }
export function setDemoMode(v: boolean) {
  const changed = _demoMode !== v
  _demoMode = v
  if (changed) {
    // Dispatch event para componentes UI (banner)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('demo-mode-change', { detail: { active: v } }))
    }
  }
  if (v && !_demoRetryTimer) {
    // Tentar reconectar a cada 30s
    _demoRetryTimer = setInterval(async () => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)
        const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', signal: controller.signal })
        clearTimeout(timeout)
        if (res.ok) {
          console.log('[API] Backend online novamente — desativando modo demo ✅')
          setDemoMode(false)
        }
      } catch {
        // Ainda offline
      }
    }, 30_000)
  }
  if (!v && _demoRetryTimer) {
    clearInterval(_demoRetryTimer)
    _demoRetryTimer = null
  }
  if (!v) {
    _networkFailureStreak = 0
  }
}

// ============================================
// Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  meta?: {
    total?: number
    page?: number
    per_page?: number
    total_pages?: number
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export class ApiClientError extends Error {
  code: string
  status: number
  details?: unknown

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
    this.details = details
  }
}

// ============================================
// Token refresh logic
// ============================================

let refreshPromise: Promise<void> | null = null

async function refreshAccessToken(): Promise<void> {
  const { tokens, setTokens, logout } = useAuthStore.getState()
  if (!tokens?.refresh_token) {
    logout()
    throw new ApiClientError('No refresh token', 'AUTH_ERROR', 401)
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: tokens.refresh_token }),
    })

    if (!res.ok) {
      // Só encerrar sessão quando o refresh token está realmente inválido.
      // Falhas transitórias (rede/5xx) NÃO devem deslogar o usuário.
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        logout()
        throw new ApiClientError('Refresh token inválido', 'AUTH_REFRESH_INVALID', res.status)
      }
      throw new ApiClientError('Refresh failed (temporary)', 'AUTH_REFRESH_FAILED', res.status)
    }

    const data = (await res.json().catch(() => null)) as ApiResponse<{
      tokens: {
        access_token: string
        refresh_token: string
        token_type: string
        expires_in: number
      }
    }> | null

    if (!data?.success || !data?.data?.tokens?.access_token || !data?.data?.tokens?.refresh_token) {
      // Resposta inesperada — tratar como falha temporária (não desloga).
      throw new ApiClientError('Refresh response invalid', 'AUTH_REFRESH_FAILED', 502)
    }

    setTokens({
      access_token: data.data.tokens.access_token,
      refresh_token: data.data.tokens.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.data.tokens.expires_in,
    })
  } catch (err) {
    // Erro de rede/timeout: não deslogar. Mantém sessão local e deixa UI/requests re-tentarem.
    if (isNetworkError(err)) {
      throw new ApiClientError('Refresh network error', 'NETWORK_ERROR', 0)
    }
    throw err
  }
}

async function ensureValidToken(): Promise<string | null> {
  const state = useAuthStore.getState()
  if (!state.isAuthenticated || !state.tokens) return null

  if (state.isTokenExpired()) {
    // Deduplicate concurrent refresh calls
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }
    await refreshPromise
  }

  return useAuthStore.getState().getAccessToken()
}

// ============================================
// Core fetch wrapper
// ============================================

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  auth?: boolean // default true
  /** Skip in-flight deduplication for this request (useful for mutations disguised as GETs) */
  noDedup?: boolean
  /** Timeout em ms. Default: 5s para GET, 30s para mutações (IA/pagamentos podem demorar) */
  timeoutMs?: number
}

const DEFAULT_GET_TIMEOUT_MS = 5_000
const DEFAULT_MUTATION_TIMEOUT_MS = 30_000

// In-flight GET deduplication: same URL+params → same Promise (never fires twice concurrently)
const _inFlight = new Map<string, Promise<ApiResponse<unknown>>>()

function buildDedupKey(method: string, url: string): string {
  return `${method}:${url}`
}

async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const method = (options.method || 'GET').toUpperCase()
  // Only deduplicate GET requests without noDedup flag
  if (method === 'GET' && !options.noDedup && !_demoMode) {
    // Build dedup key from normalized url + sorted params
    let normalizedEndpoint = endpoint
    if (!endpoint.startsWith('/api/') && !endpoint.startsWith('http')) {
      normalizedEndpoint = `/api/v1${endpoint}`
    }
    const url = new URL(
      normalizedEndpoint.startsWith('http')
        ? normalizedEndpoint
        : `https://placeholder${normalizedEndpoint}`
    )
    if (options.params) {
      const sorted = Object.entries(options.params)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
      sorted.forEach(([k, v]) => url.searchParams.set(k, String(v)))
    }
    const key = buildDedupKey('GET', url.pathname + url.search)
    if (_inFlight.has(key)) {
      return _inFlight.get(key)! as Promise<ApiResponse<T>>
    }
    const promise = apiFetchInternal<T>(endpoint, options, 0).finally(() => {
      _inFlight.delete(key)
    }) as Promise<ApiResponse<unknown>>
    _inFlight.set(key, promise)
    return promise as Promise<ApiResponse<T>>
  }

  return apiFetchInternal<T>(endpoint, options, 0)
}

async function apiFetchInternal<T = unknown>(
  endpoint: string,
  options: FetchOptions,
  attempt: 0 | 1
): Promise<ApiResponse<T>> {
  const { body, params, auth = true, headers: customHeaders, timeoutMs, ...init } = options
  const method = (init.method || 'GET').toUpperCase()

  // Normalizar endpoint: adicionar /api/v1 se não presente
  let normalizedEndpoint = endpoint
  if (!endpoint.startsWith('/api/') && !endpoint.startsWith('http')) {
    normalizedEndpoint = `/api/v1${endpoint}`
  }

  // Se já estamos em demo mode, vai direto pro mock
  if (_demoMode) {
    const mockResult = await handleMockRequest<T>(method, endpoint, body)
    if (mockResult) return mockResult
  }

  // Build URL with query params
  const url = new URL(normalizedEndpoint.startsWith('http') ? normalizedEndpoint : `${API_BASE_URL}${normalizedEndpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value))
    })
  }

  // Build headers
  const headers: Record<string, string> = {
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(customHeaders as Record<string, string>),
  }

  // Add auth token
  if (auth && !_demoMode) {
    const token = await ensureValidToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  // Timeout: evita páginas presas em "Carregando..." quando o backend não responde
  const effectiveTimeout = timeoutMs ?? (method === 'GET' ? DEFAULT_GET_TIMEOUT_MS : DEFAULT_MUTATION_TIMEOUT_MS)
  const controller = new AbortController()
  let timedOut = false
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, effectiveTimeout)
  const externalSignal = init.signal
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort()
    else externalSignal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  try {
    // Make request
    const res = await fetch(url.toString(), {
      ...init,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    // Handle 204 No Content
    if (res.status === 204) {
      return { success: true, data: null as T }
    }

    const json = await res.json().catch(() => null)

    // Handle errors
    if (!res.ok) {
      // 401: tentar refresh uma vez (clock skew, token expirou no servidor, etc)
      // Se falhar, o refresh fará logout e evitamos ficar com UI “presa” em 401 infinito.
      if (
        res.status === 401 &&
        auth &&
        !_demoMode &&
        attempt === 0 &&
        // Não tentar refresh em endpoints de auth que não dependem do access token
        !normalizedEndpoint.startsWith('/api/v1/auth/login') &&
        !normalizedEndpoint.startsWith('/api/v1/auth/refresh')
      ) {
        try {
          if (!refreshPromise) {
            refreshPromise = refreshAccessToken().finally(() => {
              refreshPromise = null
            })
          }
          await refreshPromise
          return apiFetchInternal<T>(endpoint, options, 1)
        } catch {
          // refreshAccessToken já faz logout() quando necessário
          // cair no fluxo padrão de erro
        }
      }

      // Se ainda assim deu 401 em rota autenticada, a sessão local está inconsistente
      // (token revogado/secret rotacionado/etc). NÃO deslogar automaticamente.
      // A sessão só deve ser encerrada quando o refresh token é confirmado inválido.

      const apiErr = json as ApiError | null
      throw new ApiClientError(
        apiErr?.error?.message || `Request failed: ${res.status}`,
        apiErr?.error?.code || 'UNKNOWN_ERROR',
        res.status,
        apiErr?.error?.details
      )
    }

    _networkFailureStreak = 0
    return json as ApiResponse<T>
  } catch (rawErr) {
    // Abort causado pelo timeout → erro amigável e identificável (não confundir com abort do caller)
    const err = timedOut
      ? new ApiClientError(
          'Falha ao carregar. Tente novamente.',
          'TIMEOUT',
          0,
          { endpoint: normalizedEndpoint, timeoutMs: effectiveTimeout }
        )
      : rawErr

    // Log de erro para fase de pré-produção (best-effort)
    if (typeof window !== 'undefined' && !normalizedEndpoint.startsWith('/api/v1/debug')) {
      const e = err as { message?: string; stack?: string }
      void logClientIssue({
        level: 'error',
        source: 'api-client',
        message: `Falha ${method} ${normalizedEndpoint}: ${e?.message || 'erro desconhecido'}`,
        stack: e?.stack,
        context: {
          endpoint: normalizedEndpoint,
          method,
          params,
        },
      })
    }

    // Se é erro de rede → ativa demo mode e usa mock
    if (isNetworkError(err)) {
      _networkFailureStreak += 1

      if (_networkFailureStreak >= 2) {
        console.warn('[API] Backend offline — ativando modo demo 🎭')
        setDemoMode(true)
        const mockResult = await handleMockRequest<T>(method, endpoint, body)
        if (mockResult) return mockResult
      }
    }

    // Tentar flush ao final para evitar fila local acumulada
    void flushDebugQueue()
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

// ============================================
// HTTP method helpers
// ============================================

export const api = {
  get: <T = unknown>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T = unknown>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),

  /**
   * Upload file (multipart/form-data)
   */
  upload: async <T = unknown>(endpoint: string, formData: FormData, options?: FetchOptions) => {
    const { auth = true, ...init } = options || {}
    const headers: Record<string, string> = {}

    if (auth) {
      const token = await ensureValidToken()
      if (token) headers['Authorization'] = `Bearer ${token}`
    }

    const url = `${API_BASE_URL}${endpoint}`
    const res = await fetch(url, {
      ...init,
      method: 'POST',
      headers,
      body: formData, // NÃO definir Content-Type — browser seta boundary
    })

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as ApiError | null
      throw new ApiClientError(
        json?.error?.message || `Upload failed: ${res.status}`,
        json?.error?.code || 'UPLOAD_ERROR',
        res.status
      )
    }

    return (await res.json()) as ApiResponse<T>
  },

  /**
   * Upload raw File com Content-Type do arquivo (sem FormData)
   * Usado em endpoints que recebem arrayBuffer diretamente (cover-image, exercise video, muscle image)
   */
  uploadFile: async <T = unknown>(endpoint: string, file: File) => {
    const token = await ensureValidToken()
    const headers: Record<string, string> = {
      'Content-Type': file.type,
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    let normalizedEndpoint = endpoint
    if (!endpoint.startsWith('/api/') && !endpoint.startsWith('http')) {
      normalizedEndpoint = `/api/v1${endpoint}`
    }

    const url = normalizedEndpoint.startsWith('http') ? normalizedEndpoint : `${API_BASE_URL}${normalizedEndpoint}`
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: file,
    })

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as ApiError | null
      throw new ApiClientError(
        json?.error?.message || `Upload failed: ${res.status}`,
        json?.error?.code || 'UPLOAD_ERROR',
        res.status
      )
    }

    return (await res.json()) as ApiResponse<T>
  },

  /**
   * Download file (binary/text) com autenticação
   */
  download: async (endpoint: string, options?: FetchOptions & { params?: Record<string, string | number | boolean | undefined> }) => {
    const { auth = true, params, headers: customHeaders, ...initRaw } = options || {}

    let normalizedEndpoint = endpoint
    if (!endpoint.startsWith('/api/') && !endpoint.startsWith('http')) {
      normalizedEndpoint = `/api/v1${endpoint}`
    }

    const url = new URL(normalizedEndpoint.startsWith('http') ? normalizedEndpoint : `${API_BASE_URL}${normalizedEndpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.set(key, String(value))
      })
    }

    const headers: Record<string, string> = {
      ...(customHeaders as Record<string, string>),
    }

    if (auth) {
      const token = await ensureValidToken()
      if (token) headers['Authorization'] = `Bearer ${token}`
    }

    const init = { ...initRaw } as RequestInit
    if ('body' in init) {
      delete (init as { body?: unknown }).body
    }

    const res = await fetch(url.toString(), {
      ...init,
      method: init.method || 'GET',
      headers,
    })

    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as ApiError | null
      throw new ApiClientError(
        json?.error?.message || `Download failed: ${res.status}`,
        json?.error?.code || 'DOWNLOAD_ERROR',
        res.status,
        json?.error?.details
      )
    }

    return res
  },
}

