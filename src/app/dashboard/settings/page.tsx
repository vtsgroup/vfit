/**
 * src/app/dashboard/settings/page.tsx
 *
 * Settings page (shared by personal + student)
 *
 * Exports: SettingsPage
 * Hooks: useState, useEffect, useSearchParams, useAuthStore, useAppStore, useMutation
 * Features: Auth: useAuthStore · 'use client' · React Query · DSIcon
 */

// ============================================
// Settings page (shared by personal + student)
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { MD3Input } from '@/components/ui/md3-input'
import { GlassCard, CardHeader as GlassCardHeader, CardContent as GlassCardContent } from '@/components/ui/glass-card'
import { PageHeader } from '@/components/ui/page-header'
import { useAuthStore } from '@/stores/auth-store'
import { useEffectiveUserView } from '@/hooks/use-effective-user-view'
import { useAdminSimulationSession, useUpdateAdminSimulationSession, type AdminSimulationMode } from '@/hooks/use-admin'
import { useAppStore, toast } from '@/stores/app-store'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { useOneSignal } from '@/components/providers/onesignal-provider'
import { NotificationStatusBadge } from '@/components/pwa/push-notification-prompt'
import { useNotificationPreferences, useUpdateNotificationPreferences, type NotificationPreferencesPatch } from '@/hooks/use-notification-preferences'
import dynamic from 'next/dynamic'

/** Shimmer placeholder — matches PhotoUpload rendered layout exactly */
function PhotoUploadSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar circle — h-28 w-28 */}
      <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-border-light bg-border-light/60">
        <div className="shimmer absolute inset-0" />
      </div>
      {/* Action buttons row */}
      <div className="flex gap-2">
        <div className="relative h-10 w-28 overflow-hidden rounded-lg bg-border-light/60">
          <div className="shimmer absolute inset-0" />
        </div>
      </div>
      {/* Help text */}
      <div className="relative h-3 w-40 overflow-hidden rounded bg-border-light/60">
        <div className="shimmer absolute inset-0" />
      </div>
    </div>
  )
}

/** Shimmer placeholder — matches PasskeySettingsCard rendered layout */
function PasskeySkeleton() {
  return (
    <div className="rounded-2xl border border-border-light bg-bg-secondary p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative h-5 w-5 overflow-hidden rounded bg-border-light/60">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="relative h-5 w-32 overflow-hidden rounded bg-border-light/60">
          <div className="shimmer absolute inset-0" />
        </div>
      </div>
      <div className="relative h-4 w-64 overflow-hidden rounded bg-border-light/60">
        <div className="shimmer absolute inset-0" />
      </div>
      <div className="relative h-10 w-40 overflow-hidden rounded-lg bg-border-light/60">
        <div className="shimmer absolute inset-0" />
      </div>
    </div>
  )
}

const PhotoUpload = dynamic(
  () => import('@/components/profile/photo-upload').then((m) => m.PhotoUpload),
  { ssr: false, loading: () => <PhotoUploadSkeleton /> }
)

const PasskeySettingsCard = dynamic(
  () => import('@/components/settings/passkey-settings-card'),
  { ssr: false, loading: () => <PasskeySkeleton /> }
)

export default function SettingsPage() {
  const { user, updateUser, personalProfile } = useAuthStore()
  const { theme, setTheme } = useAppStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const safeMode = searchParams.get('safe') === '1'
  const { isPersonalView } = useEffectiveUserView()
  const isPersonal = isPersonalView

  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '')
      setPhone(user.phone || '')
    }
  }, [user])

  const updateProfile = useMutation({
    mutationFn: (data: { full_name?: string; phone?: string }) =>
      api.patch<{ user: { full_name: string; phone: string | null; profile_photo_url: string | null } }>('/users/me', data),
    onSuccess: (res) => {
      // Sync auth store with backend response to keep user data fresh
      const u = res.data?.user
      if (u) {
        updateUser({
          full_name: u.full_name,
          phone: u.phone ?? null,
          avatar_url: u.profile_photo_url ?? user?.avatar_url ?? null,
        })
      }
      toast.success('Perfil atualizado!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao atualizar perfil')
    },
  })

  const changePassword = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      api.post('/auth/change-password', data),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao alterar senha')
    },
  })

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateProfile.mutate({
      full_name: fullName.trim() || undefined,
      phone: phone.trim() || undefined,
    })
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }
    if (newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres')
      return
    }
    changePassword.mutate({
      current_password: currentPassword,
      new_password: newPassword,
    })
  }

  return (
    <AuthGuard>
      <div className="w-full space-y-6 stagger-children">
        {/* Header — DS v3 PageHeader */}
        <PageHeader
          title="Configurações"
          description="Gerencie seu perfil e preferências."
          icon="settings"
        />

        {safeMode && (
          <div className="rounded-2xl border border-status-warning/20 bg-status-warning/5 p-4">
            <p className="text-sm font-semibold text-text-primary">Modo seguro ativado</p>
            <p className="mt-1 text-xs text-text-muted">
              Alguns blocos pesados foram desativados (foto, passkeys, push) para evitar crash. Remova <span className="font-mono">?safe=1</span> da URL para voltar ao modo normal.
            </p>
          </div>
        )}

        {/* Photo */}
        {!safeMode && isPersonal && (
          <GlassCard variant="surface">
            <GlassCardHeader title="Seu Plano" icon={<DSIcon name="crown" size={16} />} />
            <GlassCardContent>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    personalProfile?.plan_type === 'max'
                      ? 'bg-amber-500/10 text-amber-500'
                      : personalProfile?.plan_type === 'pro'
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'bg-text-secondary/10 text-text-secondary'
                  )}>
                    <DSIcon name={personalProfile?.plan_type === 'max' ? 'crown' : personalProfile?.plan_type === 'pro' ? 'rocket' : 'user'} size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      {personalProfile?.plan_type === 'max' ? 'Max' : personalProfile?.plan_type === 'pro' ? 'Trainer Pro' : 'Essencial (Free)'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {personalProfile?.plan_type === 'trial'
                        ? 'Até 5 alunos · Recursos básicos'
                        : personalProfile?.plan_type === 'pro'
                          ? 'Alunos ilimitados · IA + automação'
                          : 'Experiência premium completa'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={personalProfile?.plan_type === 'trial' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => router.push('/dashboard/plans')}
                >
                  {personalProfile?.plan_type === 'trial' ? (
                    <>
                      <DSIcon name="zap" size={14} /> Upgrade
                    </>
                  ) : (
                    'Ver planos'
                  )}
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Photo */}
        {!safeMode && (
          <GlassCard variant="surface">
            <GlassCardHeader title="Foto de Perfil" icon={<DSIcon name="camera" size={16} />} />
            <GlassCardContent>
              <PhotoUpload />
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Super Admin — Mode Switcher */}
        {user?.role === 'super_admin' && <AdminModeSwitcherCard />}

        {/* Profile */}
        <GlassCard variant="surface">
          <GlassCardHeader title="Perfil" icon={<DSIcon name="user" size={16} />} />
          <GlassCardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <MD3Input
                label="Nome completo"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <MD3Input
                label="E-mail"
                type="email"
                value={user?.email || ''}
                disabled
              />
              <MD3Input
                label="Telefone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
              <Button type="submit" loading={updateProfile.isPending}>
                <DSIcon name="save" size={16} className="mr-1.5" /> Salvar
              </Button>
            </form>
          </GlassCardContent>
        </GlassCard>

        {/* Theme */}
        <GlassCard variant="surface">
          <GlassCardHeader title="Aparência" icon={<DSIcon name="palette" size={16} />} />
          <GlassCardContent>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'light' as const, label: 'Claro', icon: 'sun' as DSIconName },
                { value: 'dark' as const, label: 'Escuro', icon: 'moon' as DSIconName },
                { value: 'system' as const, label: 'Sistema', icon: 'monitor' as DSIconName },
              ]).map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border px-4 py-3 transition-colors',
                    theme === t.value
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-border-light bg-bg-primary text-text-muted hover:border-brand-primary/30'
                  )}
                >
                  <DSIcon name={t.icon} size={20} />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Notifications */}
        {!safeMode && (
          <>
            <NotificationSettingsCard />
            <NotificationChannelsCard />
          </>
        )}

        {/* LGPD */}
        <PrivacyLgpdCard />

        {/* Passkeys / Biometric Login */}
        {!safeMode && <PasskeySettingsCard />}

        {/* Change password */}
        <GlassCard variant="surface">
          <GlassCardHeader title="Alterar Senha" icon={<DSIcon name="key" size={16} />} />
          <GlassCardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Hidden username for accessibility (Chrome: goo.gl/9p2vKq) */}
              <input
                type="text"
                autoComplete="username"
                value={user?.email || ''}
                readOnly
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              />
              <MD3Input
                label="Senha atual"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <MD3Input
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Mínimo 8 caracteres"
                required
              />
              <MD3Input
                label="Confirmar nova senha"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" loading={changePassword.isPending}>
                                <DSIcon name="key" size={16} className="mr-1.5" /> Alterar Senha
              </Button>
            </form>
          </GlassCardContent>
        </GlassCard>
      </div>
    </AuthGuard>
  )
}

// ============================================
// Admin Mode Switcher Card (super_admin only)
// ============================================

const SIMULATION_MODES: Array<{ value: AdminSimulationMode; label: string; icon: DSIconName; description: string }> = [
  { value: 'super_admin', label: 'Admin', icon: 'shield', description: 'Painel completo de administração' },
  { value: 'personal', label: 'Personal', icon: 'dumbbell', description: 'Visão de personal trainer' },
  { value: 'student', label: 'Aluno', icon: 'user', description: 'Visão de aluno (B2C)' },
  { value: 'nutritionist', label: 'Nutricionista', icon: 'apple', description: 'Visão de nutricionista' },
]

function AdminModeSwitcherCard() {
  const { data: sessionData } = useAdminSimulationSession()
  const updateSimulation = useUpdateAdminSimulationSession()
  const currentMode = sessionData?.simulation?.mode || 'super_admin'

  function handleModeChange(mode: AdminSimulationMode) {
    if (mode === currentMode) return
    updateSimulation.mutate({ mode })
  }

  return (
    <GlassCard variant="surface">
      <GlassCardHeader title="Modo de Visualização" icon={<DSIcon name="shield" size={16} />} />
      <GlassCardContent>
        <p className="mb-3 text-xs text-text-muted">
          Alterne entre perfis para visualizar a plataforma como diferentes tipos de usuário.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SIMULATION_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value)}
              disabled={updateSimulation.isPending}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-colors',
                currentMode === mode.value
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                  : 'border-border-light bg-bg-primary text-text-muted hover:border-brand-primary/30'
              )}
            >
              <DSIcon name={mode.icon} size={20} />
              <span className="text-xs font-semibold">{mode.label}</span>
              <span className="text-[10px] text-text-muted leading-tight text-center">{mode.description}</span>
            </button>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

// ============================================
// Notification Settings Card
// ============================================

function NotificationSettingsCard() {
  const { requestPermission, getPermissionStatus, optOut } = useOneSignal()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPermission(getPermissionStatus())
  }, [getPermissionStatus])

  async function handleEnable() {
    setLoading(true)
    try {
      const granted = await requestPermission()
      setPermission(granted ? 'granted' : 'denied')
      if (granted) {
        toast.success('Notificações ativadas!')
      } else {
        toast.error('Permissão negada pelo navegador.')
      }
    } catch {
      toast.error('Erro ao ativar notificações')
    } finally {
      setLoading(false)
    }
  }

  async function handleDisable() {
    setLoading(true)
    try {
      await optOut()
      toast.success('Notificações desativadas')
    } catch {
      toast.error('Erro ao desativar notificações')
    } finally {
      setLoading(false)
    }
  }

  const isSupported = typeof window !== 'undefined' && 'Notification' in window

  return (
    <GlassCard variant="surface">
      <GlassCardHeader title="Notificações" icon={<DSIcon name="bellRing" size={16} />} action={<NotificationStatusBadge />} />
      <GlassCardContent>
        {!isSupported ? (
          <p className="text-sm text-text-muted">
            Seu navegador não suporta notificações push.
          </p>
        ) : permission === 'denied' ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-status-error/5 p-3 border border-status-error/10">
              <DSIcon name="bellOff" size={16} className="mt-0.5 text-status-error shrink-0" />
              <div>
                <p className="text-sm font-medium text-text-primary">Notificações bloqueadas</p>
                <p className="mt-1 text-xs text-text-muted">
                  As notificações foram bloqueadas no navegador. Para reativar, clique no ícone de cadeado
                  na barra de endereço e permita notificações.
                </p>
              </div>
            </div>
          </div>
        ) : permission === 'granted' ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-status-success/5 p-3 border border-status-success/10">
                            <DSIcon name="bell" size={16} className="mt-0.5 text-status-success shrink-0" />
              <div>
                <p className="text-sm font-medium text-text-primary">Notificações ativas</p>
                <p className="mt-1 text-xs text-text-muted">
                  Você receberá alertas de novos treinos, pagamentos e atualizações importantes.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisable}
              loading={loading}
              className="text-xs"
            >
              <DSIcon name="bellOff" size={14} className="mr-1.5" /> Desativar notificações
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-muted">
              Ative as notificações push para receber alertas em tempo real sobre treinos, pagamentos e atualizações.
            </p>
            <Button
              size="sm"
              onClick={handleEnable}
              loading={loading}
              className="text-xs"
            >
                            <DSIcon name="bell" size={14} className="mr-1.5" /> Ativar notificações
            </Button>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}

function NotificationChannelsCard() {
  const { requestPermission, getPermissionStatus, optOut } = useOneSignal()
  const { data, isLoading } = useNotificationPreferences()
  const updatePreferences = useUpdateNotificationPreferences()

  const preferences = data?.preferences

  async function handleToggle(key: keyof NotificationPreferencesPatch, value: boolean) {
    // Integração real do push: não basta salvar preferência, precisa sincronizar com o navegador/OneSignal.
    if (key === 'push_enabled') {
      if (value) {
        const permission = getPermissionStatus()
        if (permission === 'denied') {
          toast.error('Notificações bloqueadas', 'Reative no cadeado da barra de endereço e tente novamente.')
          return
        }

        const granted = await requestPermission().catch(() => false)
        if (!granted) {
          toast.error('Permissão negada pelo navegador.')
          // Garante que o backend não fica com push ligado indevidamente.
          updatePreferences.mutate({ push_enabled: false })
          return
        }

        updatePreferences.mutate({ push_enabled: true })
        return
      }

      // Desligando: opt-out local + backend.
      await optOut().catch(() => {})
      updatePreferences.mutate({ push_enabled: false })
      return
    }

    updatePreferences.mutate({ [key]: value })
  }

  const rows: Array<{ key: keyof NotificationPreferencesPatch; label: string; description: string }> = [
    { key: 'in_app_enabled', label: 'Notificações in-app', description: 'Avisos dentro da plataforma.' },
    { key: 'push_enabled', label: 'Push no navegador', description: 'Alertas instantâneos no dispositivo.' },
    { key: 'email_enabled', label: 'Email', description: 'Resumo e avisos importantes por email.' },
    { key: 'workout_enabled', label: 'Eventos de treino', description: 'Novos treinos e atualizações relacionadas.' },
    { key: 'payment_enabled', label: 'Eventos de pagamento', description: 'Cobranças, confirmações e vencimentos.' },
    { key: 'student_enabled', label: 'Eventos de aluno', description: 'Convites e novos alunos vinculados.' },
    { key: 'assessment_enabled', label: 'Eventos de avaliação', description: 'Conclusão e atualização de avaliações.' },
    { key: 'calendar_enabled', label: 'Lembretes da agenda', description: 'Avisos de sessões (24h e 1h antes).' },
    { key: 'calendar_reminder_24h_enabled', label: 'Agenda: 24h antes', description: 'Receber lembrete 1 dia antes.' },
    { key: 'calendar_reminder_1h_enabled', label: 'Agenda: 1h antes', description: 'Receber lembrete 1 hora antes.' },
    { key: 'calendar_reminder_15m_enabled', label: 'Agenda: 15 min antes', description: 'Receber lembrete 15 minutos antes.' },
    { key: 'marketing_enabled', label: 'Comunicados de produto', description: 'Novidades e conteúdos de crescimento.' },
  ]

  return (
    <GlassCard variant="surface">
      <GlassCardHeader title="Central de Preferências" icon={<DSIcon name="bellRing" size={16} />} />
      <GlassCardContent>
        {isLoading || !preferences ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="flex items-start justify-between gap-3 rounded-xl border border-border-light bg-bg-secondary px-3 py-2.5"><div className="space-y-1.5 flex-1"><div className="h-3.5 w-32 animate-pulse rounded bg-black/8 dark:bg-white/8" /><div className="h-2.5 w-48 animate-pulse rounded bg-black/5 dark:bg-white/5" /></div><div className="h-5 w-9 animate-pulse rounded-full bg-black/8 dark:bg-white/8" /></div>)}
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const checked = Boolean(preferences[row.key])
              return (
                <label
                  key={row.key}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border-light bg-bg-primary px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{row.label}</p>
                    <p className="text-xs text-text-muted">{row.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={updatePreferences.isPending}
                    onChange={(e) => handleToggle(row.key, e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border-light bg-bg-secondary text-brand-primary"
                  />
                </label>
              )
            })}
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}

// ============================================
// LGPD Settings Card
// ============================================

function PrivacyLgpdCard() {
  const logout = useAuthStore((s) => s.logout)
  const [confirmDelete, setConfirmDelete] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const exportData = useMutation({
    mutationFn: async () => {
      const res = await api.get<Record<string, unknown>>('/users/me/data-export')
      return res.data
    },
    onSuccess: (data) => {
      const exportedAt = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vfit-lgpd-export-${exportedAt}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Exportação LGPD concluída')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao exportar dados')
    },
  })

  const deleteAccount = useMutation({
    mutationFn: () => api.delete('/users/me'),
    onSuccess: () => {
      toast.success('Conta anonimizada conforme LGPD')
      logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao excluir conta')
    },
  })

  return (
    <GlassCard variant="surface">
      <GlassCardHeader title="Privacidade e LGPD" icon={<DSIcon name="download" size={16} />} />
      <GlassCardContent className="space-y-4">
        <p className="text-sm text-text-muted">
          Exporte seus dados (portabilidade, Art. 18, V) ou solicite exclusão com anonimização (Art. 16).
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={exportData.isPending}
            onClick={() => exportData.mutate()}
          >
                        <DSIcon name="download" size={14} className="mr-1.5" /> Exportar meus dados
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteConfirm((v) => !v)}
          >
                        <DSIcon name="trash" size={14} className="mr-1.5" /> Excluir conta
          </Button>
        </div>

        {showDeleteConfirm && (
          <div className="rounded-xl border border-error/20 bg-error/5 p-4 space-y-3">
            <div className="flex items-start gap-2">
                            <DSIcon name="alertTriangle" size={16} className="mt-0.5 text-error shrink-0" />
              <p className="text-xs text-error">
                A ação é irreversível. Seus dados pessoais serão anonimizados conforme LGPD.
              </p>
            </div>
            <MD3Input
                label='Digite EXCLUIR para confirmar'
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                error={confirmDelete.length > 0 && confirmDelete !== 'EXCLUIR' ? 'Digite exatamente EXCLUIR' : undefined}
                placeholder="EXCLUIR"
              />
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                loading={deleteAccount.isPending}
                disabled={confirmDelete !== 'EXCLUIR'}
                onClick={() => deleteAccount.mutate()}
              >
                Confirmar exclusão
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setConfirmDelete('')
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}
