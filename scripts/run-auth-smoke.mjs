#!/usr/bin/env node

import { randomUUID } from 'node:crypto'
import dns from 'node:dns'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Evita flakes de rede quando IPv6 está instável/local (undici pode preferir AAAA).
// Ref: NODE_OPTIONS=--dns-result-order=ipv4first
dns.setDefaultResultOrder('ipv4first')

function parsePositiveInt(value, fallback) {
  const n = Number.parseInt(String(value || ''), 10)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return n
}

function parseBool(value, fallback = false) {
  if (value == null || value === '') return fallback
  return /^(1|true|yes|y|on)$/i.test(String(value).trim())
}

function decodeJwtPayload(token) {
  try {
    const parts = String(token || '').split('.')
    if (parts.length < 2) return null
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

function getJwtExpMs(token) {
  const payload = decodeJwtPayload(token)
  const exp = Number(payload?.exp || 0)
  if (!Number.isFinite(exp) || exp <= 0) return null
  return exp * 1000
}

function isJwtExpired(token, skewMs = 30_000) {
  const expMs = getJwtExpMs(token)
  if (!expMs) return false
  return Date.now() >= (expMs - skewMs)
}

const baseUrl = (process.env.SMOKE_BASE_URL || 'https://api.vfit.app.br').replace(/\/$/, '')
let personalToken = process.env.SMOKE_PERSONAL_TOKEN || ''
let studentToken = process.env.SMOKE_STUDENT_TOKEN || ''
let adminToken = process.env.SMOKE_ADMIN_TOKEN || ''
const configuredStudentId = process.env.SMOKE_TEST_STUDENT_ID || ''

// Segurança operacional: por padrão, não criar/alterar dados em produção.
// Para habilitar mutações (chat/feedback/payments create), exporte SMOKE_ALLOW_MUTATIONS=1.
const allowMutations = parseBool(process.env.SMOKE_ALLOW_MUTATIONS, false)

// Robustez: timeout e retry leve para reduzir flakes de rede (especialmente em GET).
const timeoutMs = parsePositiveInt(process.env.SMOKE_TIMEOUT_MS, 15_000)
const maxRetries = Math.max(0, parsePositiveInt(process.env.SMOKE_RETRIES, 1) - 1)

let mintPersonalId = process.env.SMOKE_MINT_PERSONAL_ID || ''
let mintPersonalEmail = process.env.SMOKE_MINT_PERSONAL_EMAIL || ''
let mintStudentId = process.env.SMOKE_MINT_STUDENT_ID || ''
let mintStudentEmail = process.env.SMOKE_MINT_STUDENT_EMAIL || ''

const runId = process.env.SMOKE_TEST_RUN_ID || `run-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-auth`
const sessionId = `session-smoke-${Math.floor(Date.now() / 1000)}`
const generatedAt = new Date().toISOString()
const outputPath = resolve(process.cwd(), 'docs/ULTRA-PLANO-MVP-PRODUCAO/AUTH-SMOKE.generated.md')

const results = []
const tokenPreflight = {
  personal: { provided: false, expired: false },
  student: { provided: false, expired: false },
  admin: { provided: false, expired: false },
}

function nowMs() {
  return Number(process.hrtime.bigint()) / 1_000_000
}

function pushResult(item) {
  results.push(item)
}

function pickRequestId(res, body) {
  return (
    res.headers.get('x-request-id') ||
    res.headers.get('cf-ray') ||
    body?.request_id ||
    body?.meta?.request_id ||
    null
  )
}

function pickError(body) {
  if (!body) return null
  if (body.error?.message) return body.error.message
  if (typeof body.message === 'string') return body.message
  return null
}

async function apiRequest({
  name,
  method,
  path,
  token,
  body,
  expectedStatuses = [200],
  skipIfNoToken = true,
}) {
  if (skipIfNoToken && !token) {
    pushResult({
      name,
      method,
      path,
      status: 'skipped',
      httpStatus: '-',
      latencyMs: 0,
      requestId: '-',
      error: 'token não informado para este fluxo',
    })
    return { ok: false, skipped: true }
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Test-Run-Id': runId,
    'X-Session-Id': sessionId,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const shouldRetryOnNetworkError = method === 'GET'

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const t0 = nowMs()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })
      const t1 = nowMs()

      const raw = await res.text()
      let parsed = null
      try {
        parsed = raw ? JSON.parse(raw) : null
      } catch {
        parsed = null
      }

      const ok = expectedStatuses.includes(res.status)

      pushResult({
        name,
        method,
        path,
        status: ok ? 'passed' : 'failed',
        httpStatus: res.status,
        latencyMs: Number((t1 - t0).toFixed(2)),
        requestId: pickRequestId(res, parsed) || '-',
        error: ok ? null : pickError(parsed) || `status inesperado (${res.status})`,
      })

      return { ok, skipped: false, res, parsed }
    } catch (error) {
      const t1 = nowMs()
      const message = error instanceof Error ? error.message : 'erro de rede'
      const isTimeout = error instanceof Error && (error.name === 'AbortError' || /abort/i.test(message))
      const httpStatus = isTimeout ? 'timeout' : 'network_error'

      const canRetry = shouldRetryOnNetworkError && attempt < maxRetries
      if (canRetry) {
        // Backoff pequeno só para reduzir flakes de rede.
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)))
        continue
      }

      pushResult({
        name,
        method,
        path,
        status: 'failed',
        httpStatus,
        latencyMs: Number((t1 - t0).toFixed(2)),
        requestId: '-',
        error: message,
      })

      return { ok: false, skipped: false, parsed: null }
    } finally {
      clearTimeout(timeout)
    }
  }

  // Não deve acontecer.
  pushResult({
    name,
    method,
    path,
    status: 'failed',
    httpStatus: 'internal_error',
    latencyMs: 0,
    requestId: '-',
    error: 'loop de retry terminou inesperadamente',
  })
  return { ok: false, skipped: false, parsed: null }
}

async function mintTokensViaAdmin() {
  if (!adminToken) return

  const users = []

  if (!personalToken && (mintPersonalId || mintPersonalEmail)) {
    users.push({
      ...(mintPersonalId ? { user_id: mintPersonalId } : {}),
      ...(mintPersonalEmail ? { email: mintPersonalEmail } : {}),
    })
  }

  if (!studentToken && (mintStudentId || mintStudentEmail)) {
    users.push({
      ...(mintStudentId ? { user_id: mintStudentId } : {}),
      ...(mintStudentEmail ? { email: mintStudentEmail } : {}),
    })
  }

  if (users.length === 0) return

  const res = await apiRequest({
    name: 'Admin: mint smoke tokens (super_admin)',
    method: 'POST',
    path: '/api/v1/admin/smoke/tokens',
    token: adminToken,
    body: { users },
    expectedStatuses: [200],
    skipIfNoToken: false,
  })

  if (!res.ok) return

  const data = extractData(res.parsed)
  const issued = data?.users || []

  for (const item of issued) {
    const u = item?.user
    const t = item?.tokens
    if (!u?.id || !t?.access_token) continue

    // Heurística: student tem user_type=student; admin vem como admin; personal -> personal
    if (!personalToken && (u.user_type === 'personal' || u.user_type === 'admin')) {
      personalToken = t.access_token
    }
    if (!studentToken && u.user_type === 'student') {
      studentToken = t.access_token
    }
  }
}

function normalizeExpiredTokensForMint() {
  tokenPreflight.personal.provided = Boolean(personalToken)
  tokenPreflight.student.provided = Boolean(studentToken)
  tokenPreflight.admin.provided = Boolean(adminToken)

  // Se token de personal expirou, tenta inferir ID do subject para remint automático.
  if (personalToken && isJwtExpired(personalToken)) {
    tokenPreflight.personal.expired = true
    const payload = decodeJwtPayload(personalToken)
    if (!mintPersonalId && !mintPersonalEmail && payload?.sub) {
      mintPersonalId = String(payload.sub)
    }
    personalToken = ''
  }

  // Se token de student expirou, tenta inferir ID do subject para remint automático.
  if (studentToken && isJwtExpired(studentToken)) {
    tokenPreflight.student.expired = true
    const payload = decodeJwtPayload(studentToken)
    if (!mintStudentId && !mintStudentEmail && payload?.sub) {
      mintStudentId = String(payload.sub)
    }
    studentToken = ''
  }

  // Se admin expirou, mantém vazio para forçar instrução clara no relatório.
  if (adminToken && isJwtExpired(adminToken)) {
    tokenPreflight.admin.expired = true
    adminToken = ''
  }
}

function extractData(parsed) {
  if (!parsed || typeof parsed !== 'object') return null
  if ('data' in parsed) return parsed.data
  return parsed
}

async function runPersonalFlow(ctx) {
  await apiRequest({
    name: 'Personal: auth/me',
    method: 'GET',
    path: '/api/v1/auth/me',
    token: personalToken,
    expectedStatuses: [200],
  })

  if (!personalToken) return

  let studentId = configuredStudentId || ''

  if (!studentId) {
    const studentsRes = await apiRequest({
      name: 'Personal: students list (seed)',
      method: 'GET',
      path: '/api/v1/students?page=1&per_page=1',
      token: personalToken,
      expectedStatuses: [200],
    })

    if (studentsRes.ok) {
      const data = extractData(studentsRes.parsed)
      studentId = data?.students?.[0]?.id || ''
    }
  }

  if (!studentId) {
    pushResult({
      name: 'Personal: seed student_id',
      method: 'GET',
      path: '/api/v1/students?page=1&per_page=1',
      status: 'skipped',
      httpStatus: '-',
      latencyMs: 0,
      requestId: '-',
      error: 'nenhum aluno disponível para smoke autenticado',
    })
    return
  }

  ctx.studentId = studentId

  if (!allowMutations) {
    const reason = 'mutations desabilitadas (exporte SMOKE_ALLOW_MUTATIONS=1 para habilitar)'
    pushResult({
      name: 'Chat: create/get conversation',
      method: 'POST',
      path: '/api/v1/chat/conversations',
      status: 'skipped',
      httpStatus: '-',
      latencyMs: 0,
      requestId: '-',
      error: reason,
    })
    pushResult({
      name: 'Feedback (user): create',
      method: 'POST',
      path: '/api/v1/feedback',
      status: 'skipped',
      httpStatus: '-',
      latencyMs: 0,
      requestId: '-',
      error: reason,
    })
    pushResult({
      name: 'Payments: create local pending (no Asaas)',
      method: 'POST',
      path: '/api/v1/payments',
      status: 'skipped',
      httpStatus: '-',
      latencyMs: 0,
      requestId: '-',
      error: reason,
    })
    return
  }

  const convRes = await apiRequest({
    name: 'Chat: create/get conversation',
    method: 'POST',
    path: '/api/v1/chat/conversations',
    token: personalToken,
    body: { participant_id: studentId },
    expectedStatuses: [200, 201],
  })

  const conversationId = extractData(convRes.parsed)?.conversation?.id || ''

  if (conversationId) {
    await apiRequest({
      name: 'Chat: send message',
      method: 'POST',
      path: `/api/v1/chat/conversations/${conversationId}/messages`,
      token: personalToken,
      body: {
        content: `[SMOKE ${runId}] Mensagem de validação autenticada`,
        message_type: 'text',
      },
      expectedStatuses: [201],
    })

    await apiRequest({
      name: 'Chat: archive conversation',
      method: 'PATCH',
      path: `/api/v1/chat/conversations/${conversationId}/archive`,
      token: personalToken,
      expectedStatuses: [204],
    })
  }

  const feedbackRes = await apiRequest({
    name: 'Feedback (user): create',
    method: 'POST',
    path: '/api/v1/feedback',
    token: personalToken,
    body: {
      category: 'improvement',
      title: `[SMOKE ${runId}] Validação autenticada`,
      description: 'Teste de smoke autenticado para validar fluxo de feedback com token real.',
    },
    expectedStatuses: [201],
  })

  await apiRequest({
    name: 'Feedback (user): mine',
    method: 'GET',
    path: '/api/v1/feedback/mine?page=1&per_page=5',
    token: personalToken,
    expectedStatuses: [200],
  })

  const createdFeedbackId = extractData(feedbackRes.parsed)?.id || ''
  if (createdFeedbackId) {
    ctx.feedbackId = createdFeedbackId
  }

  const paymentRes = await apiRequest({
    name: 'Payments: create local pending (no Asaas)',
    method: 'POST',
    path: '/api/v1/payments',
    token: personalToken,
    body: {
      payer_id: studentId,
      amount: 1,
      payment_method: 'pix',
      description: `[SMOKE ${runId}] cobrança local`,
      create_in_asaas: false,
    },
    expectedStatuses: [201],
  })

  const createdPaymentId = extractData(paymentRes.parsed)?.id || ''
  if (createdPaymentId) {
    ctx.paymentId = createdPaymentId
  }
}

async function runStudentFlow(ctx) {
  await apiRequest({
    name: 'Student: auth/me',
    method: 'GET',
    path: '/api/v1/auth/me',
    token: studentToken,
    expectedStatuses: [200],
  })

  if (!studentToken) return

  await apiRequest({
    name: 'Payments: my list',
    method: 'GET',
    path: '/api/v1/payments/my?page=1&per_page=5',
    token: studentToken,
    expectedStatuses: [200],
  })

  // Importante: NÃO usar ctx.paymentId aqui.
  // Mesmo com create_in_asaas=false na criação, chamar /pay com um payment real pode
  // disparar validações/integração de checkout (ex.: Asaas) e gerar efeitos colaterais.
  // Para smoke de autenticação/route-guard, use sempre um UUID inexistente.
  const fakePaymentId = randomUUID()

  await apiRequest({
    name: 'Checkout auth route: pix (expect not-found on fake/isolated payment)',
    method: 'POST',
    path: `/api/v1/payments/${fakePaymentId}/pay`,
    token: studentToken,
    body: { payment_method: 'pix' },
    expectedStatuses: [404],
  })

  await apiRequest({
    name: 'Checkout auth route: boleto (expect not-found on fake/isolated payment)',
    method: 'POST',
    path: `/api/v1/payments/${fakePaymentId}/pay`,
    token: studentToken,
    body: { payment_method: 'boleto' },
    expectedStatuses: [404],
  })

  await apiRequest({
    name: 'Checkout auth route: credit_card (expect not-found on fake/isolated payment)',
    method: 'POST',
    path: `/api/v1/payments/${fakePaymentId}/pay`,
    token: studentToken,
    body: {
      payment_method: 'credit_card',
      credit_card_token: 'smoke-token',
    },
    expectedStatuses: [404],
  })
}

async function runAdminFeedbackFlow(ctx) {
  await apiRequest({
    name: 'Admin: feedback list',
    method: 'GET',
    path: '/api/v1/admin/feedback?page=1&per_page=5',
    token: adminToken,
    expectedStatuses: [200],
  })

  if (!adminToken) return

  if (ctx.feedbackId) {
    await apiRequest({
      name: 'Admin: feedback detail (from user smoke)',
      method: 'GET',
      path: `/api/v1/admin/feedback/${ctx.feedbackId}`,
      token: adminToken,
      expectedStatuses: [200],
    })
  } else {
    pushResult({
      name: 'Admin: feedback detail (from user smoke)',
      method: 'GET',
      path: '/api/v1/admin/feedback/{feedback_id}',
      status: 'skipped',
      httpStatus: '-',
      latencyMs: 0,
      requestId: '-',
      error: allowMutations
        ? 'feedback_id não foi criado durante o smoke'
        : 'mutations desabilitadas; feedback_id não é gerado (SMOKE_ALLOW_MUTATIONS=1 para habilitar)'
    })
  }
}

function buildReport(context) {
  const passed = results.filter((r) => r.status === 'passed').length
  const failed = results.filter((r) => r.status === 'failed').length
  const skipped = results.filter((r) => r.status === 'skipped').length

  const lines = [
    '# Authenticated Smoke Report (Gerado automaticamente)',
    '',
    `> Gerado em: ${generatedAt}`,
    `> Base URL: ${baseUrl}`,
    `> test_run_id: ${runId}`,
    `> session_id: ${sessionId}`,
    '',
    '## Como executar (sem vazar token)',
    '',
    'Opção 1 — Tokens diretos (mais simples)',
    '- exportar no terminal (sem eco):',
    '  - `export SMOKE_PERSONAL_TOKEN=...`',
    '  - `export SMOKE_STUDENT_TOKEN=...`',
    '  - (opcional) `export SMOKE_ADMIN_TOKEN=...`',
    '',
    'Opção 2 — Mint via super_admin (recomendado)',
    '- Se você tiver `SMOKE_ADMIN_TOKEN`, o script consegue mintar tokens de personal/aluno automaticamente quando você informar o alvo:',
    '  - `export SMOKE_ADMIN_TOKEN=...`',
    '  - `export SMOKE_MINT_PERSONAL_EMAIL=...` (ou `SMOKE_MINT_PERSONAL_ID`)',
    '  - `export SMOKE_MINT_STUDENT_EMAIL=...` (ou `SMOKE_MINT_STUDENT_ID`)',
    '',
    'Opção 3 — UI (super_admin)',
    '- Abra `https://vfit.app.br/dashboard/admin/smoke` e gere tokens temporários para colar no terminal usando `read -s`.',
    '',
    '## Configuração de tokens',
    `- Personal token: ${personalToken ? 'informado' : 'ausente'}`,
    `- Student token: ${studentToken ? 'informado' : 'ausente'}`,
    `- Admin token: ${adminToken ? 'informado' : 'ausente'}`,
    `- Personal préflight: ${tokenPreflight.personal.provided ? (tokenPreflight.personal.expired ? 'expirado' : 'válido') : 'não informado'}`,
    `- Student préflight: ${tokenPreflight.student.provided ? (tokenPreflight.student.expired ? 'expirado' : 'válido') : 'não informado'}`,
    `- Admin préflight: ${tokenPreflight.admin.provided ? (tokenPreflight.admin.expired ? 'expirado' : 'válido') : 'não informado'}`,
    '',
    '## Configuração operacional',
    `- allow_mutations: ${allowMutations ? 'true' : 'false'}`,
    `- timeout_ms: ${timeoutMs}`,
    `- retries(GET): ${maxRetries + 1}`,
    '',
    '## Resumo',
    `- Passou: **${passed}**`,
    `- Falhou: **${failed}**`,
    `- Skipped: **${skipped}**`,
    '',
    '## Execuções',
    '| Fluxo | Método | Rota | Status | HTTP | Latência (ms) | request_id | Observação |',
    '|---|---|---|---|---:|---:|---|---|',
    ...results.map((r) => `| ${r.name} | ${r.method} | ${r.path} | ${r.status} | ${r.httpStatus} | ${r.latencyMs} | ${r.requestId} | ${r.error || '-'} |`),
    '',
    '## Evidências de contexto',
    `- student_id utilizado: ${context.studentId || '(não definido)'}`,
    `- feedback_id criado: ${context.feedbackId || '(não criado)'}`,
    `- payment_id criado: ${context.paymentId || '(não criado)'}`,
    '',
    '## Notas de segurança',
    '- O script não imprime token em logs.',
    '- Checkout é validado com pagamento isolado/fake quando não há contexto de cobrança real.',
    '- Para execução controlada em produção, usar conta de teste e janela operacional aprovada.',
    '',
  ]

  writeFileSync(outputPath, lines.join('\n'), 'utf8')
  console.log(`Smoke report gerado em: ${outputPath}`)

  if (!personalToken && !studentToken && !adminToken) {
    const hadExpired = tokenPreflight.personal.expired || tokenPreflight.student.expired || tokenPreflight.admin.expired
    if (hadExpired) {
      console.error('[auth-smoke] Tokens SMOKE_* presentes, porém expirados no preflight (JWT exp).')
    } else {
      console.error('[auth-smoke] Nenhum token informado (SMOKE_PERSONAL_TOKEN/SMOKE_STUDENT_TOKEN/SMOKE_ADMIN_TOKEN).')
    }
    console.error('[auth-smoke] Próximo passo recomendado: abrir https://vfit.app.br/dashboard/admin/smoke (super_admin) e gerar tokens temporários.')
    console.error('[auth-smoke] Alternativa: exporte SMOKE_ADMIN_TOKEN + SMOKE_MINT_PERSONAL_EMAIL/ID + SMOKE_MINT_STUDENT_EMAIL/ID para mint automático.')
    process.exit(1)
  }

  if (failed > 0) {
    console.error('[auth-smoke] Falha em uma ou mais etapas. Verifique o relatório gerado.')
    process.exit(1)
  }
}

async function main() {
  const context = {
    studentId: configuredStudentId || '',
    feedbackId: '',
    paymentId: '',
  }

  // Preflight de JWT: limpa tokens expirados e prepara remint automático quando possível.
  normalizeExpiredTokensForMint()

  // Se só tiver admin token, tentar mintar tokens para destravar o smoke.
  await mintTokensViaAdmin()

  await runPersonalFlow(context)
  await runStudentFlow(context)
  await runAdminFeedbackFlow(context)

  buildReport(context)
}

main().catch((err) => {
  console.error('[auth-smoke] failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
