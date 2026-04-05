/**
 * workers/types.ts
 *
 * types.ts — Tipos globais do Cloudflare Worker
 *
 * Exports: Bindings, Variables, JWTPayload, AppContext
 */

// ============================================
// types.ts — Tipos globais do Cloudflare Worker
// ============================================
//
// O que faz:
//   Define todos os tipos TypeScript do worker: bindings de ambiente
//   (D1, KV, R2, Queues, Secrets), variáveis de contexto Hono injetadas
//   pelo middleware de auth, e o payload do JWT. Fonte de verdade para
//   tipagem de todo o worker.
//
// Exports principais:
//   Bindings — todos os bindings Cloudflare (D1, KV, R2, Queues, Secrets)
//   Variables — variáveis injetadas no contexto Hono pelo authMiddleware
//   AppContext — { Bindings, Variables } — usado em new Hono<AppContext>()
//   JWTPayload — shape do JWT: sub, email, type, role, iat, exp
// ============================================

export type Bindings = {
  // D1 Database (Cold Data)
  DB: D1Database

  // Cloudflare Workers AI (Llama 3.3, Llama 4 Scout, etc.)
  AI: Ai

  // Hyperdrive (Hot Data - PostgreSQL) — opcional, fallback para NEON_DATABASE_URL
  HYPERDRIVE?: Hyperdrive

  // KV Namespaces
  KV_CACHE: KVNamespace
  KV_SESSIONS: KVNamespace
  KV_RATE_LIMIT: KVNamespace

  // R2 Buckets
  R2_VIDEOS: R2Bucket
  R2_IMAGES: R2Bucket

  // Queues (opcionais — desabilitadas temporariamente)
  EMAIL_QUEUE?: Queue
  VIDEO_ENCODE_QUEUE?: Queue
  PDF_QUEUE?: Queue
  AI_QUEUE?: Queue

  // Analytics Engine
  ANALYTICS: AnalyticsEngineDataset

  // Secrets
  JWT_SECRET: string
  JWT_REFRESH_SECRET: string
  ASAAS_API_KEY: string
  ASAAS_WEBHOOK_TOKEN: string
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  REPLICATE_API_TOKEN: string
  RESEND_API_KEY: string
  EMAIL_FROM: string
  ONESIGNAL_APP_ID: string
  ONESIGNAL_REST_KEY: string
  DATABASE_URL?: string
  NEON_DATABASE_URL?: string

  // Sentry (Observability)
  SENTRY_DSN_WORKER?: string
  SENTRY_ENVIRONMENT?: string
  SENTRY_RELEASE?: string
  SENTRY_TRACES_SAMPLE_RATE?: string

  // OAuth
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_REDIRECT_URI: string

  // Unipile Agents (Sprint D)
  UNIPILE_API_URL?: string
  UNIPILE_API_KEY?: string
  UNIPILE_INSTAGRAM_ACCOUNT_ID?: string
  AGENTS_UNIPILE_ENABLED?: string
  AGENTS_UNIPILE_KILL_SWITCH?: string
  AGENTS_UNIPILE_DRY_RUN?: string

  // WhatsApp Gateway (best-effort)
  WHATSAPP_GATEWAY_URL?: string
  WHATSAPP_NOTIFY_TOKEN?: string
  WHATSAPP_ADMIN_AUTH_TOKEN?: string

  // Turnstile
  TURNSTILE_SECRET_KEY: string

  // CPF Lookup — Hub do Desenvolvedor (hubdodesenvolvedor.com.br)
  HUBDEV_API_TOKEN?: string

  // R2 Public URLs
  R2_VIDEOS_URL: string  // https://videos.vfit.app.br
  R2_IMAGES_URL: string  // https://images.vfit.app.br

  // Cloudflare Stream (Sprint E — exercise videos with adaptive bitrate)
  CF_STREAM_API_TOKEN?: string
  CF_STREAM_SUBDOMAIN?: string  // customer-xxx.cloudflarestream.com
  CF_STREAM_SIGNING_KEY_ID?: string
  CF_STREAM_SIGNING_KEY_JWK?: string
}

// Variables set by middleware
export type Variables = {
  requestId: string
  userId: string
  userType: 'personal' | 'student' | 'nutritionist' | 'admin' | 'super_admin'
  userRole: 'admin' | 'super_admin' | 'user'
  actorUserId?: string
  actorUserType?: 'personal' | 'student' | 'nutritionist' | 'admin' | 'super_admin'
  simulationMode?: 'super_admin' | 'personal' | 'student' | 'nutritionist'
  jwtPayload: JWTPayload
}

// JWT Payload
export type JWTPayload = {
  sub: string           // user id
  email: string
  type: 'personal' | 'student' | 'nutritionist'
  role?: 'admin' | 'super_admin' | 'user'
  iat: number
  exp: number
}

// App context for Hono
export type AppContext = {
  Bindings: Bindings
  Variables: Variables
}
