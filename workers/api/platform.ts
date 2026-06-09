/**
 * workers/api/platform.ts
 *
 * Platform Routes — /api/v1/platform
 *
 * Exports: platformRoutes
 * Endpoints:
 *   GET  /subscription → legacy (deprecated)
 *   POST /checkout     → legacy (deprecated)
 */

import { Hono } from 'hono'
import { BadRequestError } from '@lib/errors'
import { success } from '@lib/response'
import { authMiddleware, requireType } from '@workers/middleware/auth'
import type { AppContext } from '@workers/types'

const platform = new Hono<AppContext>()

// All routes require auth
platform.use('*', authMiddleware)

const DEPRECATED_CREATOR_BILLING_MESSAGE =
  'Cobrança de planos para profissionais foi descontinuada. Use monetização por alunos e consultorias no VFIT.'

// ══════════════════════════════════════════════
//  GET /subscription — legacy endpoint (deprecated)
// ══════════════════════════════════════════════
platform.get(
  '/subscription',
  requireType('personal', 'admin', 'super_admin'),
  async () => {
    return success({
      subscription: null,
      deprecated: true,
      monetization_model: 'student-first',
      message: DEPRECATED_CREATOR_BILLING_MESSAGE,
    })
  }
)

// ══════════════════════════════════════════════
//  POST /checkout — deprecated
// ══════════════════════════════════════════════
platform.post(
  '/checkout',
  requireType('personal', 'admin', 'super_admin'),
  async () => {
    throw new BadRequestError(DEPRECATED_CREATOR_BILLING_MESSAGE)
  }
)

// ══════════════════════════════════════════════
//  POST /upgrade — deprecated
// ══════════════════════════════════════════════
platform.post(
  '/upgrade',
  requireType('personal', 'admin', 'super_admin'),
  async () => {
    throw new BadRequestError(DEPRECATED_CREATOR_BILLING_MESSAGE)
  }
)

// ══════════════════════════════════════════════
//  POST /downgrade — deprecated
// ══════════════════════════════════════════════
platform.post(
  '/downgrade',
  requireType('personal', 'admin', 'super_admin'),
  async () => {
    throw new BadRequestError(DEPRECATED_CREATOR_BILLING_MESSAGE)
  }
)

// ══════════════════════════════════════════════
//  POST /subscription/cancel — deprecated
// ══════════════════════════════════════════════
platform.post(
  '/subscription/cancel',
  requireType('personal', 'admin', 'super_admin'),
  async () => {
    throw new BadRequestError(DEPRECATED_CREATOR_BILLING_MESSAGE)
  }
)

export { platform as platformRoutes }
