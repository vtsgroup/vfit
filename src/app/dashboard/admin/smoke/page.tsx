/**
 * src/app/dashboard/admin/smoke/page.tsx
 *
 * Super Admin — Smoke Tokens (UI helper)
 *
 * Exports: AdminSmokeTokensPage
 * Hooks: useMemo, useState, useAuthStore
 * Features: Auth: useAuthStore · 'use client' · DSIcon
 */

// ============================================
// Super Admin — Smoke Tokens (UI helper)
// Gera tokens temporários via POST /api/v1/admin/smoke/tokens
// ============================================

'use client'

import { useMemo, useState } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { AuthGuard } from '@/components/auth'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { toast } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { MD3Input } from '@/components/ui/md3-input'

type IssuedUser = {
  user: { id: string; email: string; user_type: string; role: string }
  tokens: { access_token: string; refresh_token: string; token_type: 'Bearer'; expires_in: number }
  session_id: string
}

export default function AdminSmokeTokensPage() {
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const userRole = useAuthStore((s) => s.user?.role)
  const isSuperAdmin = userRole === 'super_admin'
  const isAccessRestricted = isHydrated && !isSuperAdmin

  const [personalEmail, setPersonalEmail] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [issued, setIssued] = useState<IssuedUser[] | null>(null)

  const usersPayload = useMemo(() => {
    const users: Array<{ email: string }> = []
    const pe = personalEmail.trim().toLowerCase()
    const se = studentEmail.trim().toLowerCase()
    if (pe) users.push({ email: pe })
    if (se) users.push({ email: se })
    return users
  }, [personalEmail, studentEmail])

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Copiado', label)
    } catch {
      toast.error('Falha ao copiar', 'Seu navegador bloqueou o clipboard.')
    }
  }

  const handleGenerate = async () => {
    setError(null)
    setIssued(null)

    if (usersPayload.length === 0) {
      setError('Informe pelo menos um email (personal/aluno).')
      return
    }

    setLoading(true)
    try {
      const res = await api.post<{ issued: number; users: IssuedUser[] }>('/admin/smoke/tokens', {
        users: usersPayload,
      })
      setIssued(res.data.users || [])
      toast.success('Tokens gerados', `${res.data.issued || 0} usuário(s)`) 
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao gerar tokens'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard requiredType="admin">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/20">
            <DSIcon name="keyRound" size={24} className="text-brand-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-text-primary">Smoke Tokens</h1>
            <p className="text-sm text-text-muted">
              Gerador rápido de tokens temporários (super_admin) para validar flows críticos.
            </p>
          </div>
        </div>

        {isAccessRestricted && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-start gap-3">
              <DSIcon name="shieldAlert" className="mt-0.5 text-red-400" />
              <div>
                <p className="font-semibold text-red-200">Acesso restrito</p>
                <p className="text-sm text-red-200/80">
                  Esta página só funciona para <span className="font-semibold">super_admin</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={cn('rounded-2xl border border-border-light bg-bg-secondary p-4', isAccessRestricted ? 'opacity-60 pointer-events-none' : '')}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <MD3Input
                label="Email do Personal (ou admin)"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                placeholder="personal@exemplo.com"
              />
            </div>
            <div>
              <MD3Input
                label="Email do Aluno"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="aluno@exemplo.com"
                className="mt-1 w-full rounded-xl border border-border-light bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/25"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              onClick={handleGenerate}
              loading={loading}
            >
              {loading ? 'Gerando…' : 'Gerar tokens'}
            </Button>
            <span className="text-xs text-text-muted">
              Retorna access/refresh + session_id. Resposta é <span className="font-semibold">sensível</span>.
            </span>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        {issued && (
          <div className="space-y-3">
            {issued.length === 0 ? (
              <div className="rounded-2xl border border-border-light bg-bg-secondary p-4 text-sm text-text-muted">
                Nenhum token retornado.
              </div>
            ) : (
              issued.map((it) => {
                const envHint = it.user.user_type === 'student' ? 'SMOKE_STUDENT_TOKEN' : (it.user.role === 'super_admin' ? 'SMOKE_ADMIN_TOKEN' : 'SMOKE_PERSONAL_TOKEN')
                const envSnippet = `${envHint}="${it.tokens.access_token}"`

                return (
                  <div key={`${it.user.id}-${it.session_id}`} className="rounded-2xl border border-border-light bg-bg-secondary p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {it.user.email}
                        </p>
                        <p className="text-xs text-text-muted">
                          {it.user.user_type} · role: {it.user.role} · expira em {Math.floor(it.tokens.expires_in / 60)} min
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copy(envSnippet, 'Snippet de env')}
                      >
                        <DSIcon name="copy" size={14} />
                        Copiar env
                      </Button>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <TokenRow
                        label="Access token"
                        value={it.tokens.access_token}
                        onCopy={() => copy(it.tokens.access_token, 'Access token')}
                      />
                      <TokenRow
                        label="Refresh token"
                        value={it.tokens.refresh_token}
                        onCopy={() => copy(it.tokens.refresh_token, 'Refresh token')}
                      />
                    </div>

                    <div className="mt-3 rounded-xl border border-border-light bg-bg-primary px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Session</p>
                      <p className="mt-1 break-all text-xs text-text-primary">{it.session_id}</p>
                    </div>

                    <p className="mt-3 text-xs text-text-muted">
                      Dica: cole no terminal antes de rodar o smoke. Variável sugerida: <span className="font-semibold text-text-primary">{envHint}</span>
                    </p>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}

function TokenRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="rounded-xl border border-border-light bg-bg-primary px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
        >
          <DSIcon name="copy" size={12} />
          Copiar
        </Button>
      </div>
      <p className="mt-1 line-clamp-2 break-all text-xs text-text-primary/90">
        {value}
      </p>
    </div>
  )
}
