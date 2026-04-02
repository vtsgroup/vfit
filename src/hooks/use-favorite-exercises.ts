/**
 * src/hooks/use-favorite-exercises.ts
 *
 * Favorite Exercises — LocalStorage hook
 *
 * Exports: useFavoriteExercises
 * Hooks: useCallback, useSyncExternalStore, useFavoriteExercises
 */

// ============================================
// Favorite Exercises — LocalStorage hook
// S06-05: Favoritar exercícios + lista rápida
// ============================================

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'vfit:favorite-exercises'
const LEGACY_STORAGE_KEY = 'personalia:favorite-exercises'

// ============================================
// External store for cross-component reactivity
// ============================================

const listeners: Set<() => void> = new Set()

function emitChange() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// ============================================
// Cached snapshot — useSyncExternalStore requires
// referentially stable return when data hasn't changed.
// JSON.parse always creates new arrays → infinite re-render.
// ============================================
let cachedRaw: string | null = null
let cachedParsed: string[] = []
const EMPTY_FAVORITES: string[] = []

function getSnapshot(): string[] {
  if (typeof window === 'undefined') return EMPTY_FAVORITES
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    // Migrate from legacy key (personalia → vfit)
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacy) {
        localStorage.setItem(STORAGE_KEY, legacy)
        localStorage.removeItem(LEGACY_STORAGE_KEY)
        raw = legacy
      }
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw
      cachedParsed = raw ? JSON.parse(raw) : []
    }
    return cachedParsed
  } catch {
    return EMPTY_FAVORITES
  }
}

function getServerSnapshot(): string[] {
  return EMPTY_FAVORITES
}

function setFavorites(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  // Update cache immediately so getSnapshot returns stable ref
  cachedRaw = JSON.stringify(ids)
  cachedParsed = ids
  emitChange()
}

// ============================================
// Hook
// ============================================

export function useFavoriteExercises() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const isFavorite = useCallback(
    (exerciseId: string) => favorites.includes(exerciseId),
    [favorites]
  )

  const toggleFavorite = useCallback(
    (exerciseId: string) => {
      const current = getSnapshot()
      if (current.includes(exerciseId)) {
        setFavorites(current.filter((id) => id !== exerciseId))
      } else {
        setFavorites([...current, exerciseId])
      }
    },
    []
  )

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    count: favorites.length,
  }
}
