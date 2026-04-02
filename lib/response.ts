// ============================================
// response.ts — Helpers de resposta HTTP padronizados
// ============================================
//
// O que faz:
//   Encapsula todas as respostas da API no envelope padrão
//   { success, data, error, meta }. Garante consistência de formato nos
//   180+ endpoints. Usado em absolutamente todos os route handlers.
//
// Exports principais:
//   success(data, status?) → Response 200
//   created(data) → Response 201
//   noContent() → Response 204
//   paginated(data[], { page, per_page, total }) → Response 200 com meta
//   error(message, status, code, details?) → Response de erro
//   ApiResponse<T> — tipo TypeScript do envelope de resposta
// ============================================

/**
 * API response envelope (standard format)
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    page?: number
    per_page?: number
    total?: number
    total_pages?: number
    timestamp?: string
  }
}

/**
 * Response de sucesso
 */
export function success<T>(data: T, status = 200): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
  }
  return Response.json(body, { status })
}

/**
 * Response de sucesso com paginação
 */
export function paginated<T>(
  data: T[],
  pagination: { page: number; per_page: number; total: number }
): Response {
  const body: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      page: pagination.page,
      per_page: pagination.per_page,
      total: pagination.total,
      total_pages: Math.ceil(pagination.total / pagination.per_page),
      timestamp: new Date().toISOString(),
    },
  }
  return Response.json(body, { status: 200 })
}

/**
 * Response de erro
 */
export function error(
  message: string,
  status = 500,
  code = 'INTERNAL_ERROR',
  details?: unknown
): Response {
  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  }
  return Response.json(body, { status })
}

/**
 * Response 201 Created
 */
export function created<T>(data: T): Response {
  return success(data, 201)
}

/**
 * Response 204 No Content
 */
export function noContent(): Response {
  return new Response(null, { status: 204 })
}
