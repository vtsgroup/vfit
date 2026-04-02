// ============================================
// errors.ts — Hierarquia de erros HTTP da aplicação
// ============================================
//
// O que faz:
//   Define AppError (base) e 8 subclasses com status codes HTTP padronizados.
//   Todos os route handlers lançam instâncias dessas classes; o error handler
//   global em workers/index.ts as captura e formata a resposta JSON.
//
// Exports principais:
//   AppError — base (statusCode, message, code, details)
//   BadRequestError (400) | UnauthorizedError (401) | ForbiddenError (403)
//   NotFoundError (404) | ConflictError (409) | RateLimitError (429)
//   InternalError (500) | ServiceUnavailableError (503)
// ============================================

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'APP_ERROR',
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * 400 - Bad Request (validação, input inválido)
 */
export class BadRequestError extends AppError {
  constructor(message = 'Requisição inválida', details?: unknown) {
    super(400, message, 'BAD_REQUEST', details)
    this.name = 'BadRequestError'
  }
}

/**
 * 401 - Unauthorized (token ausente/expirado)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Autenticação necessária') {
    super(401, message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

/**
 * 403 - Forbidden (sem permissão)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Sem permissão para esta ação') {
    super(403, message, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

/**
 * 404 - Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Recurso', id?: string) {
    super(404, id ? `${resource} (${id}) não encontrado` : `${resource} não encontrado`, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

/**
 * 409 - Conflict (duplicado, já existe)
 */
export class ConflictError extends AppError {
  constructor(message = 'Recurso já existe') {
    super(409, message, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

/**
 * 429 - Too Many Requests (rate limit)
 */
export class RateLimitError extends AppError {
  constructor(retryAfterSeconds?: number) {
    super(
      429,
      retryAfterSeconds
        ? `Muitas requisições. Tente novamente em ${retryAfterSeconds}s`
        : 'Muitas requisições. Tente novamente mais tarde',
      'RATE_LIMITED'
    )
    this.name = 'RateLimitError'
  }
}

/**
 * 500 - Internal Server Error
 */
export class InternalError extends AppError {
  constructor(message = 'Erro interno do servidor') {
    super(500, message, 'INTERNAL_ERROR')
    this.name = 'InternalError'
  }
}

/**
 * 503 - Service Unavailable (DB fora, serviço externo)
 */
export class ServiceUnavailableError extends AppError {
  constructor(service = 'Serviço') {
    super(503, `${service} temporariamente indisponível`, 'SERVICE_UNAVAILABLE')
    this.name = 'ServiceUnavailableError'
  }
}
