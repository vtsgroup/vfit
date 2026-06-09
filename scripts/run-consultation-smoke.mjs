#!/usr/bin/env node

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const baseUrl = (process.env.SMOKE_BASE_URL || 'https://api.vfit.app.br').replace(/\/$/, '')
const adminToken = process.env.SMOKE_ADMIN_TOKEN || ''
const personalToken = process.env.SMOKE_PERSONAL_TOKEN || ''
const studentToken = process.env.SMOKE_STUDENT_TOKEN || ''

const runId = `consult-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`
const outputPath = resolve(process.cwd(), '.claude/docs/archive/legacy-plans/CONSULTATION-SMOKE.generated.md')

const results = []

async function request(name, method, path, token, expected = [200]) {
  const started = Date.now()

  if (!token) {
    results.push({ name, status: 'skipped', code: '-', latency: 0, error: 'token ausente' })
    return null
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Test-Run-Id': runId,
      },
    })

    const latency = Date.now() - started
    let body = null
    try {
      body = await res.json()
    } catch {
      body = null
    }

    const ok = expected.includes(res.status)
    results.push({
      name,
      status: ok ? 'passed' : 'failed',
      code: res.status,
      latency,
      error: ok ? null : (body?.error?.message || body?.message || 'status inesperado'),
    })

    return ok ? body : null
  } catch (err) {
    const latency = Date.now() - started
    results.push({
      name,
      status: 'failed',
      code: 'network_error',
      latency,
      error: err instanceof Error ? err.message : 'erro de rede',
    })
    return null
  }
}

function getData(payload) {
  if (!payload || typeof payload !== 'object') return null
  if ('data' in payload) return payload.data
  return payload
}

async function run() {
  const mePersonal = await request('Personal auth me', 'GET', '/api/v1/auth/me', personalToken, [200])
  const meStudent = await request('Student auth me', 'GET', '/api/v1/auth/me', studentToken, [200])
  const meAdmin = await request('Admin auth me', 'GET', '/api/v1/auth/me', adminToken, [200])

  const personalId = getData(mePersonal)?.user?.id || getData(mePersonal)?.id || null

  await request('Public consultation offers', 'GET', '/api/v1/consultations/offers?limit=5', studentToken, [200])

  if (personalId) {
    await request(
      'Admin ledger creator status',
      'GET',
      `/api/v1/consultations/admin/ledger/creator/${encodeURIComponent(personalId)}/status`,
      adminToken,
      [200]
    )
    await request(
      'Creator own offers list',
      'GET',
      `/api/v1/consultations/offers?creator_id=${encodeURIComponent(personalId)}&limit=5`,
      personalToken,
      [200]
    )
  } else {
    results.push({
      name: 'Admin ledger creator status',
      status: 'skipped',
      code: '-',
      latency: 0,
      error: 'personal id indisponivel',
    })
  }

  await request(
    'Admin ledger reconciliation',
    'GET',
    '/api/v1/consultations/admin/ledger/reconciliation?days=7',
    adminToken,
    [200]
  )

  await request('Student cannot access admin ledger', 'GET', '/api/v1/consultations/admin/ledger/reconciliation?days=7', studentToken, [401, 403])

  const summary = {
    passed: results.filter((r) => r.status === 'passed').length,
    failed: results.filter((r) => r.status === 'failed').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
  }

  const lines = []
  lines.push('# Consultation Smoke Report')
  lines.push('')
  lines.push(`- Run ID: ${runId}`)
  lines.push(`- Generated at: ${new Date().toISOString()}`)
  lines.push(`- Base URL: ${baseUrl}`)
  lines.push(`- Passed: ${summary.passed}`)
  lines.push(`- Failed: ${summary.failed}`)
  lines.push(`- Skipped: ${summary.skipped}`)
  lines.push('')
  lines.push('| Check | Status | Code | Latency (ms) | Error |')
  lines.push('|---|---|---:|---:|---|')

  for (const row of results) {
    lines.push(`| ${row.name} | ${row.status} | ${row.code} | ${row.latency} | ${row.error || ''} |`)
  }

  writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8')

  console.log(`Consultation smoke finished: passed=${summary.passed}, failed=${summary.failed}, skipped=${summary.skipped}`)
  console.log(`Report: ${outputPath}`)

  if (summary.failed > 0) {
    process.exitCode = 1
  }

  if (!meAdmin && !meStudent && !mePersonal) {
    process.exitCode = 2
  }
}

run().catch((err) => {
  console.error('Consultation smoke failed:', err)
  process.exitCode = 1
})
