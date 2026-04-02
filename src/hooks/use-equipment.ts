/**
 * src/hooks/use-equipment.ts
 *
 * Hook para gerenciar equipamentos selecionados do usuário.
 * Armazena em localStorage com sync para API quando disponível.
 */

'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { EQUIPMENT_CATEGORIES, ALL_EQUIPMENT } from '@config/equipment'

const STORAGE_KEY = 'vfit:equipment'

// ── External store para equipamentos ──────────────────────
let listeners: Array<() => void> = []
let cachedIds: string[] | null = null

function getSnapshot(): string[] {
  if (cachedIds) return cachedIds
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    cachedIds = raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    cachedIds = []
  }
  return cachedIds
}

function getServerSnapshot(): string[] {
  return []
}

function subscribe(cb: () => void): () => void {
  listeners.push(cb)
  return () => {
    listeners = listeners.filter((l) => l !== cb)
  }
}

function emit(ids: string[]) {
  cachedIds = ids
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  listeners.forEach((l) => l())
}

// ── Hook principal ────────────────────────────────────────
export function useEquipment() {
  const selectedIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback((id: string) => {
    const current = getSnapshot()
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    emit(next)
  }, [])

  const selectAll = useCallback((categoryId: string) => {
    const cat = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryId)
    if (!cat) return
    const current = getSnapshot()
    const catIds = cat.items.map((i) => i.id)
    const allSelected = catIds.every((id) => current.includes(id))
    let next: string[]
    if (allSelected) {
      next = current.filter((id) => !catIds.includes(id))
    } else {
      next = [...new Set([...current, ...catIds])]
    }
    emit(next)
  }, [])

  const selectAllGlobal = useCallback(() => {
    emit(ALL_EQUIPMENT.map((e) => e.id))
  }, [])

  const clearAll = useCallback(() => {
    emit([])
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  )

  const isCategoryFullySelected = useCallback(
    (categoryId: string) => {
      const cat = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryId)
      if (!cat) return false
      return cat.items.every((i) => selectedIds.includes(i.id))
    },
    [selectedIds]
  )

  return {
    selectedIds,
    count: selectedIds.length,
    total: ALL_EQUIPMENT.length,
    toggle,
    selectAll,
    selectAllGlobal,
    clearAll,
    isSelected,
    isCategoryFullySelected,
  }
}
