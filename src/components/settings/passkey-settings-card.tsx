// ============================================
// passkey-settings-card.tsx — Card de gerenciamento de passkeys
// ============================================
//
// O que faz:
//   Lista passkeys cadastradas do usuário com nome do dispositivo e data.
//   Botão para registrar nova passkey via useRegisterPasskey.
//   Botão de remoção por passkey via useDeletePasskey com confirmação.
//   supportsPasskey() verifica suporte do browser antes de exibir.
//
// Exports principais:
//   PasskeySettingsCard — card de listagem e gerenciamento de passkeys
'use client'

import { useMemo } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { usePasskeys, useRegisterPasskey, useDeletePasskey, supportsPasskey } from '@/hooks/use-passkey'

export default function PasskeySettingsCard() {
  const { data: passkeys, isLoading } = usePasskeys()
  const registerPasskey = useRegisterPasskey()
  const deletePasskey = useDeletePasskey()

  const isSupported = useMemo(() => {
    try {
      return supportsPasskey()
    } catch {
      return false
    }
  }, [])

  function getDeviceName(): string {
    try {
      if (typeof navigator === 'undefined') return 'Dispositivo'
      const ua = navigator.userAgent
      if (/iPhone/i.test(ua)) return 'iPhone'
      if (/iPad/i.test(ua)) return 'iPad'
      if (/Mac/i.test(ua)) return 'Mac'
      if (/Android/i.test(ua)) return 'Android'
      if (/Windows/i.test(ua)) return 'Windows'
      return 'Dispositivo'
    } catch {
      return 'Dispositivo'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DSIcon name="fingerprint" size={16} /> Login Biométrico
          </CardTitle>
          {isSupported && (passkeys?.length ?? 0) > 0 && (
            <span className="inline-flex items-center rounded-full bg-status-success/10 px-2 py-0.5 text-[10px] font-medium text-status-success">
              Ativo
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isSupported ? (
          <p className="text-sm text-text-muted">
            Seu navegador não suporta autenticação biométrica (WebAuthn).
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-muted">
              Use Face ID, impressão digital ou Windows Hello para entrar instantaneamente sem digitar a senha.
            </p>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-bg-primary shimmer" />
                ))}
              </div>
            ) : passkeys && passkeys.length > 0 ? (
              <div className="space-y-2">
                {passkeys.map((pk) => (
                  <div
                    key={pk.id}
                    className="flex items-center justify-between rounded-lg border border-border-light bg-bg-primary p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10">
                        <DSIcon name="fingerprint" size={16} className="text-brand-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {pk.device_name || 'Passkey'}
                        </p>
                        <p className="text-[10px] text-text-muted">
                          Criado em {formatDate(pk.created_at)}
                          {pk.last_used_at && ` · Último uso: ${formatDate(pk.last_used_at)}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePasskey.mutate(pk.id)}
                      disabled={deletePasskey.isPending}
                      className="text-text-muted hover:text-status-error transition-colors p-1"
                      title="Remover passkey"
                    >
                      <DSIcon name="trash" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <Button
              size="sm"
              variant={passkeys && passkeys.length > 0 ? 'outline' : 'primary'}
              onClick={() => registerPasskey.mutate(getDeviceName())}
              loading={registerPasskey.isPending}
              className="text-xs"
            >
              {passkeys && passkeys.length > 0 ? (
                <>
                  <DSIcon name="plus" size={14} className="mr-1.5" /> Adicionar outro dispositivo
                </>
              ) : (
                <>
                  <DSIcon name="fingerprint" size={14} className="mr-1.5" /> Ativar login biométrico
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
