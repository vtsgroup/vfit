/**
 * src/components/auth/biometric-enrollment-gate.tsx
 *
 * Biometric Enrollment Gate — exibe o passo full-screen de enrollment (B1)
 *
 * Mostra PasskeyEnrollmentStep uma vez, no primeiro momento autenticado no app,
 * quando há oferta pendente (flag setado no cadastro). Handoff com PasskeyPrompt:
 * enquanto a oferta existir, só este gate aparece (PasskeyPrompt se auto-suprime).
 */
'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { PasskeyEnrollmentStep } from './passkey-enrollment-step'
import {
  supportsPasskey,
  hasPasskeyRegistered,
  usePasskeys,
  hasBiometricEnrollmentOffer,
  consumeBiometricEnrollmentOffer,
  dismissPasskeyPrompt,
} from '@/hooks/use-passkey'

export function BiometricEnrollmentGate() {
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const [show, setShow] = useState(false)
  const { data: passkeys, isLoading } = usePasskeys()

  useEffect(() => {
    if (!isHydrated || !user || isLoading) return

    // Sem oferta pendente → este gate não faz nada (PasskeyPrompt cuida do resto)
    if (!hasBiometricEnrollmentOffer()) {
      setShow(false)
      return
    }

    // Já tem passkey no servidor → sincroniza e consome a oferta (nada a oferecer)
    if ((passkeys?.length ?? 0) > 0) {
      if (!hasPasskeyRegistered(user.id)) {
        localStorage.setItem(`passkey_registered_${user.id}`, 'true')
      }
      consumeBiometricEnrollmentOffer()
      setShow(false)
      return
    }

    setShow(supportsPasskey() && !hasPasskeyRegistered(user.id))
  }, [isHydrated, user, passkeys, isLoading])

  if (!show || !user) return null

  function handleDone() {
    consumeBiometricEnrollmentOffer()
    // Evita que o PasskeyPrompt (modal) volte a nagar logo em seguida
    if (user) dismissPasskeyPrompt(user.id)
    setShow(false)
  }

  return <PasskeyEnrollmentStep onDone={handleDone} />
}
