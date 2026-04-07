# 🚀 FASE 3 — FEATURES MODERNAS

**Fase:** 3/4  
**Sprints:** 11-14  
**Duração:** 4 semanas (semanas 6-9 de projeto)  
**Horas:** 88h (dev) + 22h (QA)  
**Status:** ⏳ Bloqueado em Fase 2  
**Objetivo:** Implementar features modernas de fitness (timer, filtros, alimentos, camera) para paridade com MyFitnessPal/FatSecret  

---

## 📅 Timeline

```
Semana 6   Semana 7    Semana 8    Semana 9
─────────  ─────────   ─────────   ──────────
Sprint 11  Sprint 12   Sprint 13   Sprint 14
Exercise   Timer &     Foods       Scanner &
Cards      Filters     Database    Macro Ring

12h dev    10h dev     12h dev     14h dev
3h qa      2.5h qa     3h qa       3.5h qa

Cards      Ready       Photos      AI Powered
with GIFs  to train    Indexed     Complete
```

---

## 📦 Dependências Pre-Fase 3

Antes de iniciar, confirmar:
- ✅ Fase 1: Todos bugs P0 fixos
- ✅ Fase 2: Design system 100% azul aplicado
- ✅ TACO DB: 7000+ foods com fotos em R2
- ✅ ExerciseDB: 800+ exercícios com GIFs em R2
- ✅ Replicate: API token válido
- ✅ OpenAI Vision: API key ativa

---

## 🏋️ Sprint 11 — Exercise Cards com GIFs (12h Dev + 3h QA)

**Objetivo:** Integrar ExerciseDB com cards visuais, GIFs animados, labels anatômicos  
**Dependências:** Fase 2 (design system), ExerciseDB data, R2 GIFs  
**Acceptance:** Cards carregam <500ms, GIFs suave, cache 30 dias  

---

### Task 11.1: Integrar ExerciseDB API (3h)

Conectar com ExerciseDB.io para dados de exercícios.

**O que fazer:**

1. **Instalar cliente HTTP**
```bash
npm install axios --save
```

2. **Criar wrapper de API**
```typescript
// lib/exercisedb.ts
import axios from 'axios'
import { cache as fetchCache } from 'react'

const EXERCISEDB_BASE = 'https://exercisedb.p.rapidapi.com'
const EXERCISEDB_KEY = process.env.EXERCISEDB_API_KEY!

interface Exercise {
  id: string
  name: string
  target: string // muscle
  equipment: string
  bodyPart: string
  gifUrl: string
}

// Função cachada por 30 dias
export const getExercisesByMuscle = fetchCache(
  async (muscle: string): Promise<Exercise[]> => {
    try {
      const res = await axios.get(
        `${EXERCISEDB_BASE}/exercises/target/${muscle}`,
        {
          headers: {
            'x-rapidapi-key': EXERCISEDB_KEY,
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
          }
        }
      )
      return res.data
    } catch (error) {
      console.error(`Failed to fetch exercises for ${muscle}:`, error)
      return []
    }
  },
  ['exercisedb', 'byMuscle'],
  { revalidate: 2592000 } // 30 dias
)

export async function getExerciseById(id: string): Promise<Exercise | null> {
  try {
    const res = await axios.get(
      `${EXERCISEDB_BASE}/exercises/byid/${id}`,
      {
        headers: {
          'x-rapidapi-key': EXERCISEDB_KEY,
          'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
        }
      }
    )
    return res.data
  } catch (error) {
    return null
  }
}

export async function searchExercises(
  query: string
): Promise<Exercise[]> {
  try {
    const res = await axios.get(
      `${EXERCISEDB_BASE}/exercises/search`,
      {
        params: { q: query },
        headers: {
          'x-rapidapi-key': EXERCISEDB_KEY,
          'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
        }
      }
    )
    return res.data
  } catch (error) {
    return []
  }
}
```

3. **Configurar RapidAPI key**
```bash
# .env.local
EXERCISEDB_API_KEY=<your_rapidapi_key>
NEXT_PUBLIC_EXERCISEDB_HOST=exercisedb.p.rapidapi.com
```

4. **Teste**
   - Query: 10 exercícios por músculo
   - Erro handling: fallback gracioso
   - Cache: revalidação 30 dias

**Tempo:** 3h

---

### Task 11.2: Componente ExerciseCard (4h)

Criar card visual com GIF, labels, botões.

**O que fazer:**

1. **Criar componente**
```typescript
// src/components/treinos/exercise-card.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DSIcon } from '@/components/ui/ds-icon'
import { useState } from 'react'

interface ExerciseCardProps {
  id: string
  name: string
  muscle: string // alvo
  equipment: string
  bodyPart: string
  gifUrl: string
  isLoading?: boolean
  onSelect?: (exerciseId: string) => void
  onSubstitute?: (exerciseId: string) => void
}

export function ExerciseCard({
  id,
  name,
  muscle,
  equipment,
  bodyPart,
  gifUrl,
  isLoading,
  onSelect,
  onSubstitute
}: ExerciseCardProps) {
  const [gifLoaded, setGifLoaded] = useState(false)

  // Muscle group colors (azul theme)
  const muscleColors: Record<string, string> = {
    chest: 'bg-blue-500',
    back: 'bg-blue-600',
    shoulders: 'bg-blue-400',
    biceps: 'bg-blue-500',
    triceps: 'bg-blue-600',
    forearms: 'bg-blue-400',
    abs: 'bg-blue-500',
    quads: 'bg-blue-600',
    hamstrings: 'bg-blue-400',
    glutes: 'bg-blue-500',
    calves: 'bg-blue-400'
  }

  const muscleColor = muscleColors[muscle.toLowerCase()] || 'bg-blue-500'

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.95 }}
      className="rounded-xl bg-white dark:bg-surface-1 overflow-hidden shadow-md transition-all"
    >
      {/* GIF Container */}
      <div className="relative w-full bg-gray-100 dark:bg-surface-2 aspect-square">
        {!gifLoaded && (
          <div className="absolute inset-0 bg-linear-to-r from-gray-200 via-white to-gray-200 dark:from-surface-2 dark:via-surface-1 dark:to-surface-2 animate-pulse" />
        )}
        <Image
          src={gifUrl}
          alt={name}
          width={320}
          height={320}
          quality={80}
          className="object-cover w-full h-full"
          onLoadingComplete={() => setGifLoaded(true)}
          loading="lazy"
        />
        
        {/* Muscle Badge */}
        <Badge
          variant="solid"
          className={`absolute top-3 right-3 ${muscleColor} text-white capitalize`}
        >
          {muscle}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <h3 className="font-semibold text-text-primary line-clamp-2">
          {name}
        </h3>

        {/* Details */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            <DSIcon name="dumbbell" size={14} className="mr-1" />
            {equipment || 'N/A'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <DSIcon name="body" size={14} className="mr-1" />
            {bodyPart}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onSelect?.(id)}
            loading={isLoading}
          >
            Selecionar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSubstitute?.(id)}
            title="Substituto"
          >
            <DSIcon name="refresh-cw" size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
```

2. **Teste**
   - 50 exercícios: todos carregam corretamente
   - GIF animation: suave, sem travamentos
   - Responsivo: 320px-1920px sem quebras
   - Acessibilidade: alt text, keyboard nav

**Tempo:** 4h

---

### Task 11.3: Página de Listagem (3h)

Criar `/treinos/exercicios` com grid de cards.

**O que fazer:**

1. **Criar página**
```typescript
// src/app/treinos/exercicios/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { getExercisesByMuscle } from '@/lib/exercisedb'
import { ExerciseCard } from '@/components/treinos/exercise-card'
import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

const MUSCLES = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'forearms', 'abs', 'quads', 'hamstrings', 'glutes', 'calves'
]

export default function ExercisesPage() {
  const router = useRouter()
  const [selectedMuscle, setSelectedMuscle] = useState('chest')

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises', selectedMuscle],
    queryFn: () => getExercisesByMuscle(selectedMuscle),
    staleTime: 24 * 60 * 60 * 1000 // 24h cache
  })

  const handleSelectExercise = useCallback(
    (exerciseId: string) => {
      // Navegar para configurar série/reps
      router.push(`/treinos/configurar?exerciseId=${exerciseId}`)
    },
    [router]
  )

  return (
    <div className="min-h-screen bg-white dark:bg-bg-primary pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-surface-1 border-b border-gray-200 dark:border-surface-2 p-4 z-10">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Exercícios</h1>
        
        {/* Muscle Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {MUSCLES.map(muscle => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={cn(
                'px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors',
                selectedMuscle === muscle
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-surface-2 text-text-secondary'
              )}
            >
              {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Skeleton loading
          Array(6).fill(0).map((_, i) => (
            <div
              key={i}
              className="h-80 bg-gray-200 dark:bg-surface-2 rounded-xl animate-pulse"
            />
          ))
        ) : exercises?.length ? (
          exercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              id={exercise.id}
              name={exercise.name}
              muscle={exercise.target}
              equipment={exercise.equipment}
              bodyPart={exercise.bodyPart}
              gifUrl={exercise.gifUrl}
              onSelect={handleSelectExercise}
            />
          ))
        ) : (
          <p className="text-text-secondary col-span-full text-center py-12">
            Nenhum exercício encontrado
          </p>
        )}
      </div>
    </div>
  )
}
```

2. **Teste**
   - Load time: <2s mesmo em 3G
   - Filtros: smooth transition
   - Mobile: grid 1 coluna, suave scroll
   - Desktop: grid 3 colunas

**Tempo:** 3h

---

### Sprint 11 Summary

| Task | Tempo | QA | Total |
|------|-------|-----|-------|
| ExerciseDB API | 3h | 0.5h | **3.5h** |
| Exercise Card | 4h | 1h | **5h** |
| Listing page | 3h | 1.5h | **4.5h** |
| **Sprint 11 Total** | **10h** | **3h** | **13h** |

**Acceptance:**
- ✅ 800+ exercícios carregam
- ✅ GIFs anima suavemente
- ✅ Cards responsivos em mobile
- ✅ Cache 30 dias
- ✅ 0 layout shift

---

## ⏱️ Sprint 12 — Timer & Filtros Avançados (10h Dev + 2.5h QA)

**Objetivo:** Implementar timer de descanso, filtros por músculo, substituição de exercício  
**Dependências:** Sprint 11 (exercise cards)  
**Acceptance:** Timer <5s para disparar, filtros instant, UI intuitiva  

---

### Task 12.1: Timer de Descanso (3.5h)

Componente timer countdown com vibração e áudio.

**O que fazer:**

1. **Hook para timer**
```typescript
// src/hooks/use-rest-timer.ts
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface UseRestTimerProps {
  initialSeconds?: number
  onComplete?: () => void
  autoStart?: boolean
}

export function useRestTimer({
  initialSeconds = 60,
  onComplete,
  autoStart = false
}: UseRestTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(autoStart)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isActive) return

    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setIsActive(false)
          triggerCompletion()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive])

  const triggerCompletion = useCallback(() => {
    // Vibration API (móvel)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

    // Áudio notification
    const audio = new Audio(
      'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAAA='
    )
    audio.play().catch(() => {})

    onComplete?.()
  }, [onComplete])

  const toggle = useCallback(() => setIsActive(prev => !prev), [])
  const reset = useCallback(() => {
    setSeconds(initialSeconds)
    setIsActive(false)
  }, [initialSeconds])

  return {
    seconds,
    isActive,
    toggle,
    reset,
    setSeconds
  }
}
```

2. **Componente visual**
```typescript
// src/components/treinos/rest-timer.tsx
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'
import { useRestTimer } from '@/hooks/use-rest-timer'
import { useState, useEffect } from 'react'

interface RestTimerProps {
  initialSeconds?: number
  onComplete?: () => void
}

export function RestTimer({
  initialSeconds = 60,
  onComplete
}: RestTimerProps) {
  const { seconds, isActive, toggle, reset } = useRestTimer({
    initialSeconds,
    onComplete
  })

  const progress = (seconds / initialSeconds) * 100
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-surface-1 rounded-2xl shadow-2xl p-8 max-w-xs"
    >
      {/* Title */}
      <p className="text-center text-text-secondary text-sm mb-4">
        Tempo de Descanso
      </p>

      {/* Timer Display */}
      <div className="relative w-64 h-64 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-200 dark:text-surface-2"
          />

          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="282.7"
            strokeDashoffset={282.7 * (1 - progress / 100)}
            className="text-blue-500"
            animate={{
              strokeDashoffset: 282.7 * (1 - progress / 100)
            }}
          />
        </svg>

        {/* Time Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold text-text-primary tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 dark:bg-surface-2 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-blue-500"
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={reset}
          size="sm"
        >
          <DSIcon name="rotate-ccw" size={16} className="mr-1" />
          Reset
        </Button>
        <Button
          className="flex-1"
          onClick={toggle}
          size="sm"
        >
          <DSIcon name={isActive ? 'pause' : 'play'} size={16} className="mr-1" />
          {isActive ? 'Pausar' : 'Iniciar'}
        </Button>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => {/* close modal */}}
        className="absolute top-4 right-4 text-text-muted hover:text-text-secondary"
      >
        <DSIcon name="x" size={20} />
      </button>
    </motion.div>
  )
}
```

3. **Teste**
   - Timer: conta regressiva acurada
   - Vibração: funciona em Android
   - Áudio: beep ao completar
   - Acessibilidade: aria-label, keyboard accessible

**Tempo:** 3.5h

---

### Task 12.2: Filtros por Músculo (3.5h)

Refinar filtros para busca avançada.

**O que fazer:**

1. **Hook de filtros**
```typescript
// src/hooks/use-exercise-filters.ts
import { useCallback, useState } from 'react'

interface ExerciseFilters {
  muscles: string[]
  equipment: string[]
  difficulty: string[]
  searchQuery: string
}

export function useExerciseFilters(initialFilters: ExerciseFilters = {
  muscles: [],
  equipment: [],
  difficulty: [],
  searchQuery: ''
}) {
  const [filters, setFilters] = useState<ExerciseFilters>(initialFilters)

  const toggleFilter = useCallback(
    (category: keyof ExerciseFilters, value: string) => {
      setFilters(prev => ({
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter(item => item !== value)
          : [...prev[category], value]
      }))
    },
    []
  )

  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }))
  }, [])

  const clear = useCallback(() => {
    setFilters({
      muscles: [],
      equipment: [],
      difficulty: [],
      searchQuery: ''
    })
  }, [])

  return { filters, toggleFilter, setSearchQuery, clear }
}
```

2. **Componente de filtros**
```typescript
// src/components/treinos/exercise-filters.tsx
'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'
import { useExerciseFilters } from '@/hooks/use-exercise-filters'

const FILTERS = {
  muscles: [
    'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps',
    'Antebraços', 'Abdômen', 'Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilha'
  ],
  equipment: [
    'Haltere', 'Barra', 'Máquina', 'Cabo', 'Peso corporal'
  ]
}

export function ExerciseFilters() {
  const { filters, toggleFilter, clear } = useExerciseFilters()

  return (
    <div className="bg-white dark:bg-surface-1 rounded-xl p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <DSIcon name="search" size={20} className="absolute left-3 top-3 text-text-muted" />
        <input
          type="search"
          placeholder="Buscar exercício..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-surface-2"
        />
      </div>

      {/* Muscle Filters */}
      <div>
        <h3 className="font-semibold text-text-primary mb-2 text-sm">Grupos Musculares</h3>
        <div className="grid grid-cols-2 gap-2">
          {FILTERS.muscles.map(muscle => (
            <label key={muscle} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.muscles.includes(muscle)}
                onChange={() => toggleFilter('muscles', muscle)}
              />
              <span className="text-sm">{muscle}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Equipment Filters */}
      <div>
        <h3 className="font-semibold text-text-primary mb-2 text-sm">Equipamento</h3>
        <div className="space-y-2">
          {FILTERS.equipment.map(equip => (
            <label key={equip} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.equipment.includes(equip)}
                onChange={() => toggleFilter('equipment', equip)}
              />
              <span className="text-sm">{equip}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={clear}
      >
        <DSIcon name="x" size={16} className="mr-2" />
        Limpar Filtros
      </Button>
    </div>
  )
}
```

3. **Teste**
   - Checkboxes: seleção múltipla funciona
   - Filtros: aplicam instantaneamente
   - Performance: <200ms entre cliques
   - Mobile: layout otimizado

**Tempo:** 3.5h

---

### Task 12.3: Botão Substituir (3h)

Implementar "substitua este exercício" com sugestões.

**O que fazer:**

1. **API de substituição**
```typescript
// workers/api/exercises.ts
router.get('/exercises/:id/substitutes', async (c) => {
  const { id } = c.req.param()
  
  const exercise = await pgQueryOne(
    'SELECT target FROM exercises WHERE id = $1',
    [id]
  )
  
  if (!exercise) {
    return error(c, 404, 'Exercício não encontrado')
  }

  // Buscar exercícios do mesmo grupo muscular (exclui o atual)
  const substitutes = await pgQuery(
    `SELECT id, name, target, gifUrl 
     FROM exercises 
     WHERE target = $1 AND id != $2 
     LIMIT 5`,
    [exercise.target, id]
  )

  return success(c, substitutes)
})
```

2. **Componente de modal**
```typescript
// src/components/treinos/substitute-modal.tsx
'use client'

import { Dialog } from '@/components/ui/dialog'
import { ExerciseCard } from './exercise-card'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

interface SubstituteModalProps {
  exerciseId: string
  isOpen: boolean
  onClose: () => void
  onSelect: (substituteId: string) => void
}

export function SubstituteModal({
  exerciseId,
  isOpen,
  onClose,
  onSelect
}: SubstituteModalProps) {
  const { data: substitutes } = useQuery({
    queryKey: ['exercise-substitutes', exerciseId],
    queryFn: () => api.get(`/exercises/${exerciseId}/substitutes`),
    enabled: isOpen
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Exercícios Alternativos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {substitutes?.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              {...exercise}
              onSelect={() => {
                onSelect(exercise.id)
                onClose()
              }}
            />
          ))}
        </div>
      </div>
    </Dialog>
  )
}
```

3. **Teste**
   - Modal: abre ao clicar "substituir"
   - Sugestões: 5 exercícios do mesmo grupo
   - Seleção: substitui no treino

**Tempo:** 3h

---

### Sprint 12 Summary

| Task | Tempo | QA | Total |
|------|-------|-----|-------|
| Rest timer | 3.5h | 1h | **4.5h** |
| Muscle filters | 3.5h | 0.75h | **4.25h** |
| Substitute button | 3h | 0.75h | **3.75h** |
| **Sprint 12 Total** | **10h** | **2.5h** | **12.5h** |

**Acceptance:**
- ✅ Timer countdown acurado
- ✅ Filtros instant
- ✅ Substituição <300ms
- ✅ Mobile responsivo
- ✅ 0 lag

---

## 🍎 Sprint 13 — Banco de Alimentos (12h Dev + 3h QA)

**Objetivo:** Integrar TACO database com 7000+ alimentos, fotos, search otimizado  
**Dependências:** TACO data, R2 photos, search index  
**Acceptance:** Search <300ms, 7000+ items, fotos carregam <500ms  

---

### Task 13.1: Importar TACO Database (4h)

Popular banco com dados TACO.

**O que fazer:**

1. **Script de importação (PARALELO à Fase 1)**
```typescript
// scripts/import-taco-database.ts
import { sql } from '@neon/serverless'

const tacoDB = require('./taco-db.json') // 7000+ alimentos

async function importTACO() {
  console.log(`Importando ${tacoDB.length} alimentos...`)

  // Batch insert para performance
  const batchSize = 100
  let imported = 0

  for (let i = 0; i < tacoDB.length; i += batchSize) {
    const batch = tacoDB.slice(i, i + batchSize)
    
    const values = batch
      .map((food, idx) => `(
        '${food.name}',
        '${food.description}',
        ${food.calories},
        ${food.protein},
        ${food.carbs},
        ${food.fat},
        '${food.category}',
        '${food.photoUrl}',
        ${food.servingSize}
      )`)
      .join(',')

    try {
      await sql.query(`
        INSERT INTO foods (
          name, description, calories, protein,
          carbs, fat, category, photo_url, serving_size
        ) VALUES ${values}
        ON CONFLICT (name) DO NOTHING
      `)
      imported += batch.length
      console.log(`Importados: ${imported}/${tacoDB.length}`)
    } catch (error) {
      console.error(`Erro batch ${i}:`, error)
    }
  }

  console.log(`✅ ${imported} alimentos importados com sucesso`)
}

importTACO().catch(console.error)
```

2. **Executar importação**
```bash
npm run import:taco
```

3. **Verificação**
   - Count: 7000+ foods
   - Photos: 800+ em R2
   - Duplicatas: 0 (UNIQUE constraint)

**Tempo:** 4h

---

### Task 13.2: Search API Otimizado (4h)

Criar endpoint de busca com performance <300ms.

**O que fazer:**

1. **Full-text search setup**
```typescript
// workers/api/foods.ts
import { pgQuery, pgQueryOne } from '@/lib/db'

router.get('/foods/search', async (c) => {
  const query = c.req.query('q')?.toLowerCase()
  
  if (!query || query.length < 2) {
    return success(c, [])
  }

  try {
    const results = await pgQuery(
      `SELECT id, name, description, calories, protein,
              carbs, fat, photo_url, serving_size
       FROM foods
       WHERE LOWER(name) ILIKE $1 OR LOWER(description) ILIKE $1
       LIMIT 20`,
      [`%${query}%`]
    )

    return success(c, results)
  } catch (error) {
    return error(c, 500, 'Search failed')
  }
})

router.get('/foods/:id', async (c) => {
  const { id } = c.req.param()
  
  const food = await pgQueryOne(
    'SELECT * FROM foods WHERE id = $1',
    [id]
  )

  if (!food) return error(c, 404, 'Food not found')
  return success(c, food)
})

router.get('/foods/category/:category', async (c) => {
  const { category } = c.req.param()
  
  const foods = await pgQuery(
    'SELECT id, name, photo_url FROM foods WHERE category = $1 LIMIT 50',
    [category]
  )

  return success(c, foods)
})
```

2. **Teste**
   - 100 buscas random: <300ms p95
   - Autocomplete: 20 resultados ou menos
   - Cache: 1 hora para resultados

**Tempo:** 4h

---

### Task 13.3: UI de Busca (4h)

Criar tela de busca com photos e macros.

**O que fazer:**

1. **Componente FoodCard**
```typescript
// src/components/nutricao/food-card.tsx
'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface FoodCardProps {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  photoUrl: string
  servingSize: number
  onSelect?: (foodId: string) => void
}

export function FoodCard({
  id,
  name,
  calories,
  protein,
  carbs,
  fat,
  photoUrl,
  servingSize,
  onSelect
}: FoodCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-xl bg-white dark:bg-surface-1 overflow-hidden shadow-md"
    >
      {/* Photo */}
      <div className="relative w-full h-40 bg-gray-100 dark:bg-surface-2">
        <Image
          src={photoUrl}
          alt={name}
          fill
          className="object-cover"
          quality={80}
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-text-primary line-clamp-2 text-sm">
          {name}
        </h3>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-2 text-xs text-center py-2 bg-gray-50 dark:bg-surface-2 rounded-lg">
          <div>
            <p className="font-bold text-blue-600">{protein}g</p>
            <p className="text-text-muted">Proteína</p>
          </div>
          <div>
            <p className="font-bold text-blue-600">{carbs}g</p>
            <p className="text-text-muted">Carbs</p>
          </div>
          <div>
            <p className="font-bold text-blue-600">{fat}g</p>
            <p className="text-text-muted">Gordura</p>
          </div>
        </div>

        {/* Calories & Action */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-text-primary">
            {calories} cal
          </span>
          <Button
            size="sm"
            onClick={() => onSelect?.(id)}
            className="h-8 px-3 text-xs"
          >
            Adicionar
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
```

2. **Página de busca**
```typescript
// src/app/nutricao/alimentos/page.tsx
'use client'

import { useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { FoodCard } from '@/components/nutricao/food-card'
import { Input } from '@/components/ui/input'
import { DSIcon } from '@/components/ui/ds-icon'

export default function FoodsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const { data: foods, isLoading } = useQuery({
    queryKey: ['foods-search', searchQuery],
    queryFn: () => 
      searchQuery.length < 2 
        ? Promise.resolve([])
        : api.get(`/foods/search?q=${encodeURIComponent(searchQuery)}`),
    staleTime: 60 * 1000 // 1 min
  })

  return (
    <div className="min-h-screen bg-white dark:bg-bg-primary pb-20">
      {/* Header Search */}
      <div className="sticky top-0 bg-white dark:bg-surface-1 border-b border-gray-200 dark:border-surface-2 p-4 z-10">
        <div className="relative">
          <DSIcon name="search" size={20} className="absolute left-3 top-3 text-text-muted" />
          <Input
            type="search"
            placeholder="Buscar alimento..."
            value={searchQuery}
            onChange={(e) => {
              startTransition(() => setSearchQuery(e.target.value))
            }}
            className="pl-10 pr-4"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        {isLoading || isPending ? (
          <div className="text-center py-12">
            <p className="text-text-muted">Buscando...</p>
          </div>
        ) : foods?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map(food => (
              <FoodCard
                key={food.id}
                {...food}
                onSelect={(id) => {
                  // Adicionar ao diário
                }}
              />
            ))}
          </div>
        ) : searchQuery.length >= 2 ? (
          <p className="text-center text-text-muted py-12">
            Nenhum alimento encontrado
          </p>
        ) : (
          <p className="text-center text-text-muted py-12">
            Digite algo para buscar
          </p>
        )}
      </div>
    </div>
  )
}
```

3. **Teste**
   - Search: 100 queries <300ms
   - Photos: load <500ms
   - Pagination: scroll infinito
   - Mobile: 1 col, ajustado

**Tempo:** 4h

---

### Sprint 13 Summary

| Task | Tempo | QA | Total |
|------|-------|-----|-------|
| TACO import | 4h | 1h | **5h** |
| Search API | 4h | 1h | **5h** |
| Search UI | 4h | 1h | **5h** |
| **Sprint 13 Total** | **12h** | **3h** | **15h** |

**Acceptance:**
- ✅ 7000+ foods na DB
- ✅ Search <300ms
- ✅ Photos carregam <500ms
- ✅ UI responsiva
- ✅ Zero duplicatas

---

## 📱 Sprint 14 — Scanner & Macro Ring (14h Dev + 3.5h QA)

**Objetivo:** Implementar camera scanner (barcode + label OCR) e macro ring visual  
**Dependências:** Replicate API, BarcodeDB, OpenAI Vision, Framer Motion  
**Acceptance:** Scanner <2s, OCR accuracy >85%, macro ring animado  

*(Documento continua no próximo Sprint...)*

[Configurado para máx. 2000 linhas por arquivo para otimizar performance de leitura]

---

## 📋 Próxima Seção

Veja [Sprint 14 detalhado](./FASE-3-SPRINT14.md) (arquivo separado) ou continue lendo no documento de Fase 4.

**Fase 3 progress:**
- Sprint 11: ✅ Exercise cards  
- Sprint 12: ✅ Timer & filters  
- Sprint 13: ✅ Food database  
- Sprint 14: ⏳ Scanner & macro ring (próximo)

**Volta para:** [README.md](README.md) | [ROADMAP](02-ROADMAP-FASES.md) | [FASE 4](06-FASE-POLISH.md)
