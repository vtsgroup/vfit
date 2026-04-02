/**
 * src/app/dashboard/logs/page.tsx
 *
 * Logs page (self-service + admin)
 *
 * Exports: LogsPage
 * Hooks: useCallback, useEffect, useMemo, useState, useAuthStore
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Logs page (self-service + admin)
// ============================================

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthGuard } from '@/components/auth'
import { GlassCard, CardHeader as GlassCardHeader, CardContent as GlassCardContent } from '@/components/ui/glass-card'
import { MD3Input } from '@/components/ui/md3-input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState, SkeletonList } from '@/components/ui'
import { StyledSelect } from '@/components/ui/styled-select'
import { PageHeader } from '@/components/ui/page-header'
import { api } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import { cn, formatDate } from '@/lib/utils'
import { toast } from '@/stores/app-store'
import { DSIcon } from '@/components/ui/ds-icon'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type RemoteLog = {
  id: string
  timestamp: string
  level: LogLevel
  source: string
  message: string
  stack?: string
  path?: string
  request_id?: string
  context?: unknown
}

type TopIssue = {
  count: number
  source: string
  message: string
  path: string | null
  last_seen_at: string
}

function levelVariant(level: LogLevel): 'default' | 'success' | 'warning' | 'error' | 'info' {
  if (level === 'error') return 'error'
  if (level === 'warn') return 'warning'
  if (level === 'info') return 'info'
  return 'default'
}

export default function LogsPage() {
  const isReady = useAuthStore((s) => s.isAuthenticated && s.isHydrated)
  const { hasAdminCapabilities, isSimulationActive } = useEffectiveUserView()
  const isEffectiveAdmin = hasAdminCapabilities && !isSimulationActive

  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<RemoteLog[]>([])
  const [total, setTotal] = useState(0)

  const [q, setQ] = useState('')
  const [level, setLevel] = useState<LogLevel | 'all'>('all')
  const [scope, setScope] = useState<'self' | 'all'>('self')
  const [userId, setUserId] = useState('')

  const [topLoading, setTopLoading] = useState(false)
  const [topIssues, setTopIssues] = useState<TopIssue[]>([])
  const [topArea, setTopArea] = useState<'settings' | 'dashboard' | 'all'>('settings')

  const canSeeAll = isEffectiveAdmin

  const fetchTopIssues = useCallback(async () => {
    if (!isReady) return

    const pathPrefix = topArea === 'settings'
      ? '/dashboard/settings'
      : topArea === 'dashboard'
        ? '/dashboard'
        : ''

    try {
      setTopLoading(true)
      const res = await api.get<{ items: TopIssue[] }>('/debug/logs/stats', {
        params: {
          limit: 25,
          ...(canSeeAll ? { scope } : {}),
          ...(canSeeAll && scope === 'all' && userId.trim() ? { user_id: userId.trim() } : {}),
          ...(level !== 'all' ? { level } : {}),
          ...(pathPrefix ? { path_prefix: pathPrefix } : {}),
        },
      })
      setTopIssues(res.data.items || [])
    } catch {
      setTopIssues([])
    } finally {
      setTopLoading(false)
    }
  }, [isReady, canSeeAll, scope, userId, level, topArea])

  const fetchLogs = useCallback(async () => {
    if (!isReady) return

    try {
      setLoading(true)
      const res = await api.get<{ logs: RemoteLog[]; total: number }>('/debug/logs', {
        params: {
          limit: 200,
          ...(q.trim() ? { q: q.trim() } : {}),
          ...(level !== 'all' ? { level } : {}),
          ...(canSeeAll ? { scope } : {}),
          ...(canSeeAll && scope === 'all' && userId.trim() ? { user_id: userId.trim() } : {}),
        },
      })

      setLogs(res.data.logs || [])
      setTotal(res.data.total || 0)
    } catch {
      // best-effort
      setLogs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [isReady, q, level, scope, userId, canSeeAll])

  useEffect(() => {
    if (!isReady) return
    void fetchLogs()
  }, [isReady, fetchLogs])

  useEffect(() => {
    if (!isReady) return
    void fetchTopIssues()
  }, [isReady, fetchTopIssues])

  const headerTitle = useMemo(() => {
    if (!canSeeAll) return 'Meus logs'
    return scope === 'all' ? 'Logs (global)' : 'Meus logs'
  }, [canSeeAll, scope])

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        toast.success('Copiado', label)
        return
      }

      // Fallback
      if (typeof document !== 'undefined') {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('readonly', 'true')
        ta.style.position = 'fixed'
        ta.style.top = '0'
        ta.style.left = '0'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
        toast.success('Copiado', label)
        return
      }

      toast.error('Falha ao copiar', 'Clipboard não disponível neste ambiente.')
    } catch {
      toast.error('Falha ao copiar', 'Seu navegador bloqueou o clipboard.')
    }
  }, [])

  const buildLogsClipboardText = useCallback(() => {
    const payload = {
      copied_at: new Date().toISOString(),
      scope: canSeeAll ? scope : 'self',
      level,
      q,
      user_id: canSeeAll && scope === 'all' ? (userId.trim() || null) : null,
      total,
      logs,
    }
    return JSON.stringify(payload, null, 2)
  }, [canSeeAll, scope, level, q, userId, total, logs])

  const buildTopIssuesClipboardText = useCallback(() => {
    const payload = {
      copied_at: new Date().toISOString(),
      area: topArea,
      scope: canSeeAll ? scope : 'self',
      level,
      user_id: canSeeAll && scope === 'all' ? (userId.trim() || null) : null,
      items: topIssues,
    }
    return JSON.stringify(payload, null, 2)
  }, [topArea, canSeeAll, scope, level, userId, topIssues])

  return (
    <AuthGuard>
      <div className="w-full space-y-6 stagger-children">
        <PageHeader
          title="Logs"
          icon="terminal"
          description="Visualize erros e eventos capturados automaticamente (sem botão de bugs)."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => void copyToClipboard(buildTopIssuesClipboardText(), 'Top issues (JSON)')}
                disabled={topIssues.length === 0}
              >
                <DSIcon name="copy" size={16} className="mr-1.5" /> Copiar top
              </Button>
              <Button
                variant="outline"
                onClick={() => void copyToClipboard(buildLogsClipboardText(), 'Logs (JSON)')}
                disabled={logs.length === 0}
              >
                <DSIcon name="copy" size={16} className="mr-1.5" /> Copiar logs
              </Button>
              <Button onClick={() => void fetchLogs()} loading={loading}>
                <DSIcon name="refresh" size={16} className="mr-1.5" /> Atualizar
              </Button>
            </div>
          }
        />

        <GlassCard variant="surface">
          <GlassCardHeader title="Filtros" icon={<DSIcon name="filter" size={16} />} action={
            canSeeAll ? (
                <span className="inline-flex items-center gap-2 text-xs text-text-muted">
                  <DSIcon name="shield" size={14} /> admin
                </span>
            ) : undefined
          } />
          <GlassCardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <MD3Input
                  label="Buscar"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="message ou source"
                  leadingIcon={<DSIcon name="search" size={16} />}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Nível</label>
                <StyledSelect
                  value={level}
                  onChange={(v) => setLevel(v as LogLevel | 'all')}
                  options={[
                    { value: 'all', label: 'Todos' },
                    { value: 'error', label: 'error' },
                    { value: 'warn', label: 'warn' },
                    { value: 'info', label: 'info' },
                    { value: 'debug', label: 'debug' },
                  ]}
                  compact
                />
              </div>

              {canSeeAll && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Escopo</label>
                    <StyledSelect
                      value={scope}
                      onChange={(v) => setScope(v as 'self' | 'all')}
                      options={[
                        { value: 'self', label: 'Somente eu' },
                        { value: 'all', label: 'Global' },
                      ]}
                      compact
                    />
                  </div>

                  <div className={cn(scope === 'all' ? '' : 'opacity-50')}>
                    <MD3Input
                      label="Filtrar por user_id (opcional)"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      disabled={scope !== 'all'}
                      placeholder="UUID do usuário"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-xs text-text-muted">
                {headerTitle} • mostrando {logs.length} (total: {total})
              </div>
              <Button variant="outline" onClick={() => void fetchLogs()} loading={loading}>
                Aplicar
              </Button>
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="surface">
          <GlassCardHeader title="Top issues" icon={<DSIcon name="shield" size={16} />} action={
            <div className="flex items-center gap-2">
                <StyledSelect
                  value={topArea}
                  onChange={(v) => setTopArea(v as typeof topArea)}
                  options={[
                    { value: 'settings', label: 'Configurações' },
                    { value: 'dashboard', label: 'Dashboard' },
                    { value: 'all', label: 'Tudo' },
                  ]}
                  compact
                />
                <Button variant="outline" onClick={() => void fetchTopIssues()} loading={topLoading}>
                  <DSIcon name="refresh" size={16} className="mr-1.5" /> Atualizar
                </Button>
            </div>
          } />
          <GlassCardContent>
            {topLoading && topIssues.length === 0 ? (
              <SkeletonList count={3} withAvatar={false} />
            ) : topIssues.length === 0 ? (
              <EmptyState
                compact
                illustration="notifications"
                title="Sem dados suficientes"
                description="Gere mais atividade para mapear os principais problemas."
              />
            ) : (
              <div className="space-y-2">
                {topIssues.map((it, idx) => (
                  <GlassCard key={`${it.source}-${idx}`} variant="outline" padding="sm" radius="lg">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-bg-tertiary px-2 py-0.5 text-xs font-semibold text-text-primary">
                          {it.count}x
                        </span>
                        <span className="text-xs text-text-muted">{formatDate(it.last_seen_at)}</span>
                        <span className="text-xs font-medium text-text-secondary">{it.source}</span>
                        {it.path && <span className="text-xs text-text-muted">{it.path}</span>}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-text-primary">{it.message}</div>
                  </GlassCard>
                ))}
              </div>
            )}
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="surface">
          <GlassCardHeader title="Entradas" />
          <GlassCardContent>
            {loading && logs.length === 0 ? (
              <SkeletonList count={5} withAvatar={false} />
            ) : logs.length === 0 ? (
              <EmptyState
                compact
                illustration="generic"
                title="Sem logs por enquanto"
                description="Quando eventos forem registrados, eles aparecerão aqui."
              />
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <GlassCard key={log.id} variant="outline" padding="md" radius="lg">
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={levelVariant(log.level)}>{log.level}</Badge>
                        <span className="text-xs text-text-muted">{formatDate(log.timestamp)}</span>
                        {log.source && (
                          <span className="text-xs font-medium text-text-secondary">{log.source}</span>
                        )}
                        {log.path && (
                          <span className="text-xs text-text-muted">{log.path}</span>
                        )}
                      </div>
                      {log.request_id && (
                        <div className="text-xs text-text-muted">request_id: {log.request_id}</div>
                      )}
                    </div>

                    <div className="mt-2 text-sm text-text-primary">{log.message}</div>

                    {log.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-text-muted">Stack</summary>
                        <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap rounded-xl bg-bg-secondary p-3 text-xs text-text-secondary">
                          {log.stack}
                        </pre>
                      </details>
                    )}

                    {log.context !== undefined && log.context !== null && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-text-muted">Context</summary>
                        <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap rounded-xl bg-bg-secondary p-3 text-xs text-text-secondary">
                          {safeStringify(log.context)}
                        </pre>
                      </details>
                    )}
                  </GlassCard>
                ))}
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>
    </AuthGuard>
  )
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}
