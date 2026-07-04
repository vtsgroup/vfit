/**
 * src/hooks/use-prompt-slot.ts
 *
 * Hook de integração das superfícies de prompt com o Maestro (Fase 1 —
 * Experiência 1000). Com o kill-switch ativado ('vfit-maestro-disabled'),
 * cai no comportamento da Fase 0 (prompt-exclusion, exclusão mútua simples)
 * sem redeploy.
 *
 * Uso:
 *   const { granted, resolve } = usePromptSlot({ id: 'upsell', priority: 'upsell' })
 *   if (granted) render o prompt; ao fechar: resolve('dismissed' | 'converted')
 */

'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import {
  registerPrompt,
  unregisterPrompt,
  resolvePrompt,
  subscribeMaestro,
  getMaestroSnapshot,
  getMaestroServerSnapshot,
  isMaestroEnabled,
  type PromptPriority,
  type PromptOutcome,
} from '@/lib/prompt-maestro'
import {
  tryAcquirePromptSlot,
  releasePromptSlot,
  onPromptSlotChange,
  isPromptSlotBusy,
} from '@/lib/prompt-exclusion'
import { useState } from 'react'

export interface UsePromptSlotOptions {
  id: string
  priority: PromptPriority
  /** Só participa da fila quando true (condições da própria superfície). */
  enabled?: boolean
  /** R4: exige CTA do treino visto. Default true para não-legais. */
  requiresCtaSeen?: boolean
}

export function usePromptSlot({ id, priority, enabled = true, requiresCtaSeen }: UsePromptSlotOptions): {
  granted: boolean
  resolve: (outcome: PromptOutcome) => void
} {
  const maestroOn = typeof window !== 'undefined' && isMaestroEnabled()

  // ── Caminho Maestro ──
  const activeId = useSyncExternalStore(
    subscribeMaestro,
    getMaestroSnapshot,
    getMaestroServerSnapshot
  )

  useEffect(() => {
    if (!maestroOn || !enabled) return
    registerPrompt({ id, priority, requiresCtaSeen })
    return () => unregisterPrompt(id)
  }, [maestroOn, enabled, id, priority, requiresCtaSeen])

  // ── Caminho Fase 0 (kill-switch) ──
  const [fallbackGranted, setFallbackGranted] = useState(false)
  useEffect(() => {
    if (maestroOn || !enabled) return
    if (tryAcquirePromptSlot(id)) {
      setFallbackGranted(true)
      return () => {
        releasePromptSlot(id)
      }
    }
    const unsub = onPromptSlotChange(() => {
      if (!isPromptSlotBusy(id) && tryAcquirePromptSlot(id)) {
        setFallbackGranted(true)
        unsub()
      }
    })
    return () => {
      unsub()
      releasePromptSlot(id)
    }
  }, [maestroOn, enabled, id])

  const resolve = useCallback(
    (outcome: PromptOutcome) => {
      if (maestroOn) {
        resolvePrompt(id, outcome)
      } else {
        releasePromptSlot(id)
        setFallbackGranted(false)
      }
    },
    [maestroOn, id]
  )

  return {
    granted: enabled && (maestroOn ? activeId === id : fallbackGranted),
    resolve,
  }
}
