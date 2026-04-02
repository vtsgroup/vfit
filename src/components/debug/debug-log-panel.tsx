// ============================================
// debug-log-panel.tsx — Painel de debug e diagnóstico em tempo real
// ============================================
//
// O que faz:
//   Painel flutuante para coleta e envio de logs de diagnóstico ao suporte.
//   Ativado via URL param ?debug-panel=1 ou botão de suporte.
//   Captura logs via initGlobalDebugLogging() e exibe em tempo real.
//   Botão para enviar log ao suporte via WhatsApp ou API.
//
// Auth: lê useAuthStore (userId)
//
// Exports principais:
//   DebugLogPanel — painel de debug (visível apenas em modo debug)
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import {
  flushDebugQueue,
  initGlobalDebugLogging,
  isDebugLoggingEnabled,
  logClientIssue,
  setDebugLoggingEnabled,
  startNewTestRun,
  shouldEnableDebugFromUrl,
} from '@/lib/debug-logger'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const SUPPORT_WHATSAPP_NUMBER = '447446970650'

type RemoteLog = {
  id: string
  timestamp: string
  level: LogLevel
  source: string
  message: string
  stack?: string
  path?: string
  request_id?: string
  context?: {
    test_run_id?: string
    session_id?: string
    [key: string]: unknown
  }
}

export function DebugLogPanel() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<RemoteLog[]>([])
  const [loading, setLoading] = useState(false)
  const [currentRunId, setCurrentRunId] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  const fetchLogs = useCallback(async () => {
    if (!isReady) return
    try {
      setLoading(true)
      const res = await api.get<{ logs: RemoteLog[]; total: number }>('/debug/logs', {
        params: { limit: 120 },
      })
      setLogs(res.data.logs || [])
    } catch {
      // silencioso: painel é best-effort
    } finally {
      setLoading(false)
    }
  }, [isReady])

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 768px)').matches
    setIsMobile(mobile)
    setOpen(!mobile)

    const shouldEnable = shouldEnableDebugFromUrl(window.location.search) || isDebugLoggingEnabled()
    if (shouldEnable) {
      setDebugLoggingEnabled(true)
      setEnabled(true)
      const nextRun = startNewTestRun()
      setCurrentRunId(nextRun)
      initGlobalDebugLogging()
      void logClientIssue({
        level: 'info',
        source: 'auto.new-test-run',
        message: `Nova rodada automática iniciada: ${nextRun}`,
        context: { triggered_from: 'debug-panel-auto' },
      })

      // Evitar spam de 401 antes de hidratar/auth ficar pronto
      if (isReady) {
        void flushDebugQueue()
        // buscar logs só se o painel estiver aberto
        if (!mobile) void fetchLogs()
      }
    }
  }, [fetchLogs, isReady])

  useEffect(() => {
    if (!enabled || !isReady) return

    // Verificação contínua para uso em celular sem console.
    const flushTimer = setInterval(() => {
      void flushDebugQueue()
    }, 10_000)

    // Só buscar logs quando o painel estiver aberto
    const fetchTimer = setInterval(() => {
      if (open) void fetchLogs()
    }, 12_000)

    return () => {
      clearInterval(flushTimer)
      clearInterval(fetchTimer)
    }
  }, [enabled, isReady, open, fetchLogs])

  async function handleClear() {
    try {
      await api.delete('/debug/logs')
      setLogs([])
    } catch {
      // noop
    }
  }

  async function handleCopy() {
    const text = buildLogReportText()

    if (!text) return
    await navigator.clipboard.writeText(text)
  }

  async function handleCopyAndOpenWhatsApp() {
    const text = buildLogReportText({ includeHeader: true })
    if (!text) return

    await navigator.clipboard.writeText(text).catch(() => {})

    const encoded = encodeURIComponent(text)
    const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encoded}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleShare() {
    const preview = filteredLogs
      .slice(0, 20)
      .map((log) => `[${log.level}] ${log.message}`)
      .join('\n')

    if (!preview) return

    if (navigator.share) {
      await navigator.share({ title: 'Logs de debug', text: preview }).catch(() => {})
      return
    }

    await navigator.clipboard.writeText(preview)
  }

  async function handleMark() {
    await logClientIssue({
      level: 'info',
      source: 'manual.marker',
      message: 'Marcador manual inserido pelo usuário (teste mobile)',
    })
    await fetchLogs()
  }

  async function handleNewRun() {
    const nextRun = startNewTestRun()
    setCurrentRunId(nextRun)
    await logClientIssue({
      level: 'info',
      source: 'manual.new-test-run',
      message: `Nova rodada de teste iniciada: ${nextRun}`,
      context: { triggered_from: 'debug-panel' },
    })
    await fetchLogs()
  }

  const filteredLogs = useMemo(() => {
    if (!currentRunId) return logs
    return logs.filter((log) => log.context?.test_run_id === currentRunId)
  }, [logs, currentRunId])

  function buildLogReportText(options?: { includeHeader?: boolean }) {
    const baseText = filteredLogs
      .map((log) => {
        const base = `[${new Date(log.timestamp).toLocaleString('pt-BR')}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
        const path = log.path ? `\npath: ${log.path}` : ''
        const req = log.request_id ? `\nrequest_id: ${log.request_id}` : ''
        const run = log.context?.test_run_id ? `\ntest_run_id: ${log.context.test_run_id}` : ''
        const session = log.context?.session_id ? `\nsession_id: ${log.context.session_id}` : ''
        const stack = log.stack ? `\nstack: ${log.stack}` : ''
        return `${base}${path}${req}${run}${session}${stack}`
      })
      .join('\n\n---\n\n')

    if (!options?.includeHeader) {
      return baseText
    }

    const runId = currentRunId || filteredLogs[0]?.context?.test_run_id || 'não identificado'
    const sessionId = filteredLogs[0]?.context?.session_id || 'não identificado'
    const requestIds = filteredLogs
      .map((log) => log.request_id)
      .filter((id): id is string => Boolean(id))
    const uniqueRequestIds = [...new Set(requestIds)]
    const header = [
      'Olá Victor, segue relatório automático de logs mobile.',
      `test_run_id: ${runId}`,
      `session_id: ${sessionId}`,
      `total_logs: ${filteredLogs.length}`,
      `total_erros: ${filteredLogs.filter((log) => log.level === 'error').length}`,
      uniqueRequestIds.length > 0
        ? `request_ids: ${uniqueRequestIds.slice(0, 20).join(', ')}`
        : 'request_ids: não identificado',
      '',
      'Detalhes:',
    ].join('\n')

    return `${header}\n${baseText}`
  }

  const currentRunErrorCount = useMemo(() => {
    return filteredLogs.filter((log) => log.level === 'error').length
  }, [filteredLogs])

  useEffect(() => {
    if (!enabled || !isMobile) return
    if (currentRunErrorCount >= 5) {
      setOpen(true)
    }
  }, [enabled, isMobile, currentRunErrorCount])

  const title = useMemo(() => `Debug (${filteredLogs.length})`, [filteredLogs.length])

  if (!enabled) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-22 left-4 z-45 flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-warning/40 bg-warning/20 px-3 text-xs font-semibold text-warning backdrop-blur"
        style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <DSIcon name="bug" size={16} />
        Logs
        {currentRunErrorCount > 0 && (
          <span className="rounded-full bg-error px-1.5 py-0.5 text-[10px] leading-none text-white">
            {currentRunErrorCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed bottom-36 left-3 z-46 w-[min(92vw,430px)] max-h-[62vh] overflow-hidden rounded-2xl border border-border-light bg-bg-secondary shadow-2xl"
          style={{ bottom: 'calc(9rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex items-center justify-between border-b border-border-light px-3 py-2.5">
            <p className="text-sm font-semibold text-text-primary">{title}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => void fetchLogs()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-bg-tertiary">
                <DSIcon name="refresh" size={16} className={`text-text-muted ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => void handleCopy()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-bg-tertiary">
                <DSIcon name="clipboardCopy" size={16} className="text-text-muted" />
              </button>
              <button onClick={() => void handleShare()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-bg-tertiary">
                <DSIcon name="share" size={16} className="text-text-muted" />
              </button>
              <button onClick={() => void handleClear()} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-bg-tertiary">
                <DSIcon name="trash" size={16} className="text-error" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-border-light px-3 py-2">
            <button
              onClick={() => void handleMark()}
              className="min-h-11 rounded-lg border border-brand-primary/40 bg-brand-primary/10 px-3 py-2 text-xs font-semibold text-brand-primary"
            >
              Inserir marcador
            </button>
            <button
              onClick={() => void handleNewRun()}
              className="min-h-11 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs font-semibold text-warning"
            >
              Nova rodada
            </button>
          </div>

          <div className="border-b border-border-light px-3 py-2">
            <p className="text-[11px] text-text-muted">
              Rodada atual: <span className="font-semibold text-text-primary">{currentRunId || '—'}</span>
            </p>
            {isMobile && (
              <p className="mt-1 text-[11px] text-text-muted">
                Painel abre automático somente com muitos erros (5+).
              </p>
            )}
          </div>

          <div className="border-b border-border-light px-3 py-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="min-h-11 w-full rounded-lg border border-brand-primary/40 bg-brand-primary/10 px-3 py-2 text-xs font-semibold text-brand-primary"
            >
              Copiar logs para Victor
            </button>
            <button
              type="button"
              onClick={() => void handleCopyAndOpenWhatsApp()}
              className="mt-2 min-h-11 w-full rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-xs font-semibold text-success"
            >
              Copiar + abrir WhatsApp
            </button>
            <p className="mt-1 text-[11px] text-text-muted">
              Toque em “Copiar + abrir WhatsApp” para enviar direto ao Victor.
            </p>
          </div>

          <div className="max-h-[44vh] overflow-y-auto px-3 py-2">
            {filteredLogs.length === 0 ? (
              <p className="py-6 text-center text-xs text-text-muted">Nenhum log salvo ainda.</p>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-border-light bg-bg-primary p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase text-text-muted">{log.level}</span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-primary">{log.message}</p>
                    <p className="mt-1 text-[10px] text-text-muted">{log.source}{log.path ? ` · ${log.path}` : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
