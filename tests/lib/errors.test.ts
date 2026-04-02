// ============================================
// Tests: lib/errors.ts — Custom Error Classes
// ============================================

import { describe, it, expect } from 'vitest'
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError,
  ServiceUnavailableError,
} from '@lib/errors'

describe('AppError', () => {
  it('deve criar com statusCode, message e code', () => {
    const err = new AppError(418, 'I am a teapot', 'TEAPOT')
    expect(err.statusCode).toBe(418)
    expect(err.message).toBe('I am a teapot')
    expect(err.code).toBe('TEAPOT')
    expect(err.name).toBe('AppError')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
  })

  it('deve aceitar details opcionais', () => {
    const details = { field: 'email', reason: 'invalid' }
    const err = new AppError(400, 'Erro', 'ERR', details)
    expect(err.details).toEqual(details)
  })

  it('deve ter code padrão APP_ERROR', () => {
    const err = new AppError(500, 'Erro')
    expect(err.code).toBe('APP_ERROR')
  })
})

describe('BadRequestError', () => {
  it('deve ter statusCode 400 e code BAD_REQUEST', () => {
    const err = new BadRequestError()
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('BAD_REQUEST')
    expect(err.message).toBe('Requisição inválida')
    expect(err.name).toBe('BadRequestError')
  })

  it('deve aceitar mensagem e details custom', () => {
    const err = new BadRequestError('Campo inválido', { field: 'name' })
    expect(err.message).toBe('Campo inválido')
    expect(err.details).toEqual({ field: 'name' })
  })
})

describe('UnauthorizedError', () => {
  it('deve ter statusCode 401', () => {
    const err = new UnauthorizedError()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
    expect(err.name).toBe('UnauthorizedError')
  })

  it('deve aceitar mensagem custom', () => {
    const err = new UnauthorizedError('Token expirado')
    expect(err.message).toBe('Token expirado')
  })
})

describe('ForbiddenError', () => {
  it('deve ter statusCode 403', () => {
    const err = new ForbiddenError()
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('FORBIDDEN')
    expect(err.name).toBe('ForbiddenError')
  })
})

describe('NotFoundError', () => {
  it('deve ter statusCode 404 com mensagem genérica', () => {
    const err = new NotFoundError()
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toBe('Recurso não encontrado')
  })

  it('deve formatar mensagem com resource name', () => {
    const err = new NotFoundError('Treino')
    expect(err.message).toBe('Treino não encontrado')
  })

  it('deve formatar mensagem com resource name e id', () => {
    const err = new NotFoundError('Aluno', 'abc123')
    expect(err.message).toBe('Aluno (abc123) não encontrado')
  })
})

describe('ConflictError', () => {
  it('deve ter statusCode 409', () => {
    const err = new ConflictError()
    expect(err.statusCode).toBe(409)
    expect(err.code).toBe('CONFLICT')
    expect(err.message).toBe('Recurso já existe')
  })
})

describe('RateLimitError', () => {
  it('deve ter statusCode 429 sem retryAfter', () => {
    const err = new RateLimitError()
    expect(err.statusCode).toBe(429)
    expect(err.code).toBe('RATE_LIMITED')
    expect(err.message).toContain('Muitas requisições')
  })

  it('deve incluir retryAfter na mensagem', () => {
    const err = new RateLimitError(60)
    expect(err.message).toBe('Muitas requisições. Tente novamente em 60s')
  })
})

describe('InternalError', () => {
  it('deve ter statusCode 500', () => {
    const err = new InternalError()
    expect(err.statusCode).toBe(500)
    expect(err.code).toBe('INTERNAL_ERROR')
    expect(err.name).toBe('InternalError')
  })
})

describe('ServiceUnavailableError', () => {
  it('deve ter statusCode 503 com nome do serviço', () => {
    const err = new ServiceUnavailableError('Asaas')
    expect(err.statusCode).toBe(503)
    expect(err.code).toBe('SERVICE_UNAVAILABLE')
    expect(err.message).toBe('Asaas temporariamente indisponível')
  })

  it('deve usar "Serviço" como padrão', () => {
    const err = new ServiceUnavailableError()
    expect(err.message).toBe('Serviço temporariamente indisponível')
  })
})

describe('Hierarquia de herança', () => {
  it('todas as subclasses devem herdar de AppError', () => {
    expect(new BadRequestError()).toBeInstanceOf(AppError)
    expect(new UnauthorizedError()).toBeInstanceOf(AppError)
    expect(new ForbiddenError()).toBeInstanceOf(AppError)
    expect(new NotFoundError()).toBeInstanceOf(AppError)
    expect(new ConflictError()).toBeInstanceOf(AppError)
    expect(new RateLimitError()).toBeInstanceOf(AppError)
    expect(new InternalError()).toBeInstanceOf(AppError)
    expect(new ServiceUnavailableError()).toBeInstanceOf(AppError)
  })

  it('todas devem ser instância de Error nativo', () => {
    expect(new BadRequestError()).toBeInstanceOf(Error)
    expect(new InternalError()).toBeInstanceOf(Error)
  })
})
