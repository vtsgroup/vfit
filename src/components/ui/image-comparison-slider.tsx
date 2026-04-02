/**
 * src/components/ui/image-comparison-slider.tsx
 *
 * Image Comparison Slider — Before/After
 *
 * Exports: ImageComparisonSlider
 * Hooks: useState, useRef, useEffect, useCallback
 * Features: 'use client' · DSIcon
 */

// ============================================
// Image Comparison Slider — Before/After
// ============================================

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { DSIcon } from '@/components/ui/ds-icon'
import { api } from '@/lib/api-client'

interface ImageComparisonSliderProps {
  beforeUrl: string
  afterUrl: string
  beforeLabel?: string
  afterLabel?: string
  alt: string
  storyGoal?: 'definition' | 'muscle_gain' | 'recomposition'
  storyPersona?: 'male' | 'female' | 'neutral'
}

export function ImageComparisonSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Antes',
  afterLabel = 'Depois',
  alt,
  storyGoal = 'recomposition',
  storyPersona = 'neutral',
}: ImageComparisonSliderProps) {
  const STORY_STATE_STORAGE_KEY = 'vfit.story.state'
  const STORY_AB_STORAGE_KEY = 'vfit.story.ab'
  const [sliderPosition, setSliderPosition] = useState(50)
  const inlineRef = useRef<HTMLDivElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [storyStep, setStoryStep] = useState(0)
  const [isStoryPlaying, setIsStoryPlaying] = useState(false)
  const [selectedStoryGoal, setSelectedStoryGoal] = useState<'definition' | 'muscle_gain' | 'recomposition'>(storyGoal)
  const [preferredStoryGoal, setPreferredStoryGoal] = useState<'definition' | 'muscle_gain' | 'recomposition' | null>(null)
  const [preferredStoryStep, setPreferredStoryStep] = useState<number | null>(null)
  const [preferredStoryPlaying, setPreferredStoryPlaying] = useState<boolean | null>(null)
  const [abVariant, setAbVariant] = useState<'A' | 'B' | 'C'>('B')
  const [isCleanMode, setIsCleanMode] = useState(false)
  const [lockMidline, setLockMidline] = useState(false)
  const storyCompletedRef = useRef(false)
  const storyOpenTrackedRef = useRef(false)
  const storyPrefSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const storyPrefLastSavedRef = useRef('')
  const storyPrefCooldownUntilRef = useRef(0)
  const storyEventLastSentAtRef = useRef<Record<string, number>>({})

  const tone = storyPersona === 'female' ? 'aluna' : storyPersona === 'male' ? 'aluno' : 'pessoa'

  const STORY_PRESETS = {
    definition: {
      intervalMs: 3000,
      steps: [
        { title: '1) Antes', description: `Base atual da ${tone}. Ponto de partida para secar com saúde.`, position: 88 },
        { title: '2) Projeção IA', description: 'Simulação de maior definição com rotina consistente de treino + dieta.', position: 12 },
        { title: '3) Plano de ação', description: 'Foco semanal: déficit controlado, treino progressivo e sono regulado.', position: 50 },
      ],
    },
    muscle_gain: {
      intervalMs: 3400,
      steps: [
        { title: '1) Antes', description: 'Base atual do aluno para construção de massa muscular.', position: 90 },
        { title: '2) Projeção IA', description: 'Simulação de ganho de volume com execução técnica e progressão de carga.', position: 10 },
        { title: '3) Plano de ação', description: 'Foco semanal: superávit limpo, treino estruturado e recuperação.', position: 52 },
      ],
    },
    recomposition: {
      intervalMs: 3200,
      steps: [
        { title: '1) Antes', description: 'Base atual do aluno. Ponto de partida para acompanhar evolução real.', position: 88 },
        { title: '2) Projeção IA', description: 'Visual didático de resultado possível com consistência nos treinos.', position: 12 },
        { title: '3) Plano de ação', description: 'Meta prática: seguir o plano semanal para aproximar o resultado projetado.', position: 50 },
      ],
    },
  } as const

  const activeStoryGoal = isFullscreen ? selectedStoryGoal : storyGoal
  const storyPreset = STORY_PRESETS[activeStoryGoal]
  const storySteps = storyPreset.steps
  const autoplayIntervalMs = Math.round(storyPreset.intervalMs * (abVariant === 'A' ? 0.9 : abVariant === 'C' ? 1.1 : 1))

  const trackStoryEvent = useCallback(async (
    event: 'story_open' | 'story_play' | 'story_pause' | 'story_complete' | 'story_share' | 'story_export' | 'story_cta_click',
    mode: 'inline' | 'fullscreen' = 'fullscreen'
  ) => {
    try {
      const fingerprint = `${event}:${mode}:${selectedStoryGoal}:${storyStep}`
      const now = Date.now()
      const last = storyEventLastSentAtRef.current[fingerprint] || 0

      // Guardrail MVP: evita duplicidade em sequência muito rápida.
      if (now - last < 900) return
      storyEventLastSentAtRef.current[fingerprint] = now

      await api.post('/assessments/story-events', {
        event,
        goal: selectedStoryGoal,
        step: storyStep,
        variant: abVariant,
        mode,
      })
    } catch {
      // best effort
    }
  }, [abVariant, selectedStoryGoal, storyStep])

  const pauseStory = useCallback((mode: 'inline' | 'fullscreen' = isFullscreen ? 'fullscreen' : 'inline') => {
    setIsStoryPlaying((prev) => {
      if (prev) void trackStoryEvent('story_pause', mode)
      return false
    })
  }, [isFullscreen, trackStoryEvent])

  const scheduleStoryPreferenceSave = useCallback(() => {
    if (!isFullscreen) return

    const payload = {
      goal: selectedStoryGoal,
      step: storyStep,
      playing: isStoryPlaying,
      variant: abVariant,
      lockMidline,
      cleanMode: isCleanMode,
    }

    const serializedPayload = JSON.stringify(payload)
    if (serializedPayload === storyPrefLastSavedRef.current) return

    if (storyPrefSaveTimerRef.current) {
      clearTimeout(storyPrefSaveTimerRef.current)
    }

    storyPrefSaveTimerRef.current = setTimeout(async () => {
      if (Date.now() < storyPrefCooldownUntilRef.current) return

      try {
        await api.post('/assessments/story-preference', payload)
        storyPrefLastSavedRef.current = serializedPayload
      } catch {
        // cooldown para evitar flood em caso de backend instável
        storyPrefCooldownUntilRef.current = Date.now() + 5000
      }
    }, 600)
  }, [selectedStoryGoal, storyStep, isStoryPlaying, abVariant, lockMidline, isCleanMode, isFullscreen])

  const shareStory = async () => {
    const text = [
      'Comparativo Antes x Projeção IA',
      `Objetivo: ${selectedStoryGoal === 'definition' ? 'Definição' : selectedStoryGoal === 'muscle_gain' ? 'Hipertrofia' : 'Recomposição'}`,
      `Antes: ${beforeUrl}`,
      `Depois (IA): ${afterUrl}`,
      'Visual estimado por IA para fins didáticos.',
    ].join('\n')

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Comparativo VFIT', text, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(text)
        window.alert('Comparativo copiado. Agora é só colar e enviar para o aluno.')
      }
      void trackStoryEvent('story_share')
    } catch {
      // ignore
    }
  }

  const exportStoryImage = async () => {
    try {
      const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })

      const [beforeImg, afterImg] = await Promise.all([load(beforeUrl), load(afterUrl)])
      const size = 1080
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(beforeImg, 0, 0, size, size)
      ctx.save()
      ctx.beginPath()
      ctx.rect((sliderPosition / 100) * size, 0, size, size)
      ctx.clip()
      ctx.drawImage(afterImg, 0, 0, size, size)
      ctx.restore()

      const x = (sliderPosition / 100) * size
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.fillRect(x - 2, 0, 4, size)

      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(24, size - 92, size - 48, 60)
      ctx.fillStyle = '#22C55E'
      ctx.font = 'bold 24px Arial'
      ctx.fillText('VFIT • Estimativa IA (didática)', 40, size - 54)

      const link = document.createElement('a')
      link.download = `comparativo-ia-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      void trackStoryEvent('story_export')
    } catch {
      window.alert('Não foi possível exportar a imagem neste dispositivo.')
    }
  }

  const openStoryCta = () => {
    void trackStoryEvent('story_cta_click')
    window.location.href = '/dashboard/assessments'
  }

  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (lockMidline) return
    const target = isFullscreen ? fullscreenRef.current : inlineRef.current
    if (!target) return
    const rect = target.getBoundingClientRect()
    const x = clientX - rect.left
    const newPosition = Math.max(5, Math.min(95, (x / rect.width) * 100))
    setSliderPosition(newPosition)
  }, [isFullscreen, lockMidline])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    setShowHint(false)
    pauseStory()
    updateSliderFromClientX(e.clientX)
  }
  const handleMouseUp = () => setIsDragging(false)

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      updateSliderFromClientX(e.clientX)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, updateSliderFromClientX])

  // Touch support para mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setShowHint(false)
    pauseStory()
    if (e.touches[0]) updateSliderFromClientX(e.touches[0].clientX)
  }
  const handleTouchEnd = () => setIsDragging(false)

  useEffect(() => {
    if (!isDragging) return

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (!e.touches[0]) return
      updateSliderFromClientX(e.touches[0].clientX)
    }

    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, updateSliderFromClientX])

  useEffect(() => {
    if (!isDragging) return
    const previous = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    return () => {
      document.body.style.userSelect = previous
    }
  }, [isDragging])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false)
        pauseStory('fullscreen')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pauseStory])

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowHint(false), 4200)
    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const savedAb = window.localStorage.getItem(STORY_AB_STORAGE_KEY)
    if (savedAb === 'A' || savedAb === 'B' || savedAb === 'C') {
      setAbVariant(savedAb)
      return
    }

    // MVP: variante inicial fixa para reduzir ruído de leitura.
    const defaultVariant: 'A' | 'B' | 'C' = 'B'
    setAbVariant(defaultVariant)
    window.localStorage.setItem(STORY_AB_STORAGE_KEY, defaultVariant)
  }, [])

  useEffect(() => {
    const savedRaw = window.localStorage.getItem(STORY_STATE_STORAGE_KEY)
    if (!savedRaw) return

    try {
      const saved = JSON.parse(savedRaw) as {
        goal?: 'definition' | 'muscle_gain' | 'recomposition'
        step?: number
        playing?: boolean
        cleanMode?: boolean
        lockMidline?: boolean
      }

      if (saved.goal === 'definition' || saved.goal === 'muscle_gain' || saved.goal === 'recomposition') {
        setPreferredStoryGoal(saved.goal)
        setSelectedStoryGoal(saved.goal)
      }

      if (typeof saved.step === 'number' && Number.isFinite(saved.step)) {
        setPreferredStoryStep(saved.step)
      }

      if (typeof saved.playing === 'boolean') {
        setPreferredStoryPlaying(saved.playing)
      }

      if (typeof saved.cleanMode === 'boolean') {
        setIsCleanMode(saved.cleanMode)
      }

      if (typeof saved.lockMidline === 'boolean') {
        setLockMidline(saved.lockMidline)
      }
    } catch {
      // ignore payload inválido
    }
  }, [])

  useEffect(() => {
    const loadServerPreference = async () => {
      try {
        const res = await api.get<{ data?: { preference?: { goal?: 'definition' | 'muscle_gain' | 'recomposition'; step?: number; playing?: boolean; cleanMode?: boolean; lockMidline?: boolean; variant?: 'A' | 'B' | 'C' } } }>('/assessments/story-preference')
        const pref = res?.data?.data?.preference
        if (!pref) return

        if (pref.goal === 'definition' || pref.goal === 'muscle_gain' || pref.goal === 'recomposition') {
          setPreferredStoryGoal(pref.goal)
          setSelectedStoryGoal(pref.goal)
        }

        if (typeof pref.step === 'number' && Number.isFinite(pref.step)) {
          setPreferredStoryStep(pref.step)
        }

        if (typeof pref.playing === 'boolean') {
          setPreferredStoryPlaying(pref.playing)
        }

        if (typeof pref.cleanMode === 'boolean') {
          setIsCleanMode(pref.cleanMode)
        }

        if (typeof pref.lockMidline === 'boolean') {
          setLockMidline(pref.lockMidline)
        }

        if (pref.variant === 'A' || pref.variant === 'B' || pref.variant === 'C') {
          setAbVariant(pref.variant)
          window.localStorage.setItem(STORY_AB_STORAGE_KEY, pref.variant)
        }
      } catch {
        // best effort
      }
    }

    void loadServerPreference()
  }, [])

  useEffect(() => {
    const stateToPersist = JSON.stringify({
      goal: selectedStoryGoal,
      step: storyStep,
      playing: isStoryPlaying,
      cleanMode: isCleanMode,
      lockMidline,
    })
    window.localStorage.setItem(STORY_STATE_STORAGE_KEY, stateToPersist)
    setPreferredStoryGoal(selectedStoryGoal)
    setPreferredStoryStep(storyStep)
    setPreferredStoryPlaying(isStoryPlaying)
  }, [selectedStoryGoal, storyStep, isStoryPlaying, isCleanMode, lockMidline])

  useEffect(() => {
    if (!isFullscreen) {
      setIsStoryPlaying(false)
      storyCompletedRef.current = false
      storyOpenTrackedRef.current = false
      return
    }
    const goalToUse = preferredStoryGoal ?? storyGoal
    setSelectedStoryGoal(goalToUse)

    const safeStep = typeof preferredStoryStep === 'number'
      ? Math.max(0, Math.min(storySteps.length - 1, preferredStoryStep))
      : 0

    setStoryStep(safeStep)
    setSliderPosition(storySteps[safeStep].position)
    if (typeof preferredStoryPlaying === 'boolean') {
      setIsStoryPlaying(preferredStoryPlaying)
    }
    if (!storyOpenTrackedRef.current) {
      storyOpenTrackedRef.current = true
      void trackStoryEvent('story_open')
    }
  }, [isFullscreen, storyGoal, preferredStoryGoal, preferredStoryStep, preferredStoryPlaying, storySteps, trackStoryEvent])

  useEffect(() => {
    if (!isFullscreen) return
    setStoryStep(0)
    setSliderPosition(storySteps[0].position)
  }, [selectedStoryGoal, isFullscreen, storySteps])

  useEffect(() => {
    if (!isFullscreen || !isStoryPlaying) return

    const interval = window.setInterval(() => {
      setStoryStep((prev) => {
        const next = (prev + 1) % storySteps.length
        setSliderPosition(storySteps[next].position)
        return next
      })
    }, autoplayIntervalMs)

    return () => window.clearInterval(interval)
  }, [isFullscreen, isStoryPlaying, autoplayIntervalMs, storySteps])

  useEffect(() => {
    if (!isFullscreen || !isStoryPlaying) return
    if (storyStep === storySteps.length - 1 && !storyCompletedRef.current) {
      storyCompletedRef.current = true
      void trackStoryEvent('story_complete')
    }
  }, [storyStep, isFullscreen, isStoryPlaying, storySteps.length, trackStoryEvent])

  useEffect(() => {
    scheduleStoryPreferenceSave()

    return () => {
      if (storyPrefSaveTimerRef.current) {
        clearTimeout(storyPrefSaveTimerRef.current)
        storyPrefSaveTimerRef.current = null
      }
    }
  }, [scheduleStoryPreferenceSave])

  const renderSlider = (mode: 'inline' | 'fullscreen') => (
    <div
      ref={mode === 'fullscreen' ? fullscreenRef : inlineRef}
      className="relative w-full aspect-square overflow-hidden rounded-2xl border border-white/15 bg-bg-secondary cursor-ew-resize touch-none select-none group shadow-[0_14px_34px_rgba(0,0,0,0.28)]"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {!(mode === 'fullscreen' && isCleanMode) && (
        <>
          <div className="pointer-events-none absolute inset-0 z-1 bg-linear-to-br from-brand-primary/12 via-transparent to-brand-primary/7" />
          <div className="pointer-events-none absolute inset-0 z-2 bg-[radial-gradient(circle_at_50%_120%,rgba(61,252,164,0.2),transparent_45%)]" />
        </>
      )}

      {mode === 'inline' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setIsFullscreen(true)
          }}
          className="absolute right-2 top-2 z-30 inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md transition-all hover:bg-black/70"
        >
          <DSIcon name="expand" size={14} />
          Tela cheia
        </button>
      )}

      {!(mode === 'fullscreen' && isCleanMode) && (
        <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
          <span className="opacity-95">ANTES</span>
          <span className="mx-1.5 opacity-50">•</span>
          <span className="opacity-95">DEPOIS</span>
        </div>
      )}

      {/* Imagem ANTES (background) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeUrl}
        alt={`${alt} - Antes`}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* Imagem DEPOIS (overlay fixo com clipPath, sem deslocar foto) */}
      <div
        className="absolute inset-0 overflow-hidden transition-[clip-path] duration-700 ease-out"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterUrl}
          alt={`${alt} - Depois`}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>

      {/* Handle (linha deslizável) */}
      <div
        className="absolute top-0 bottom-0 z-10 w-1.5 bg-white/95 shadow-[0_0_20px_rgba(255,255,255,0.9)] transition-[left,opacity] duration-700 ease-out"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setIsDragging(true)
          setShowHint(false)
          pauseStory()
        }}
        onTouchStart={(e) => {
          e.stopPropagation()
          setIsDragging(true)
          setShowHint(false)
          pauseStory()
        }}
      >
        {/* Ícone do handle */}
        <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-brand-primary bg-white shadow-[0_8px_24px_rgba(61,252,164,0.35)] group-hover:scale-110 transition-transform">
          <div className="flex items-center gap-1 text-brand-primary text-xs font-bold">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      {!(mode === 'fullscreen' && isCleanMode) && (
        <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
          {Math.round(sliderPosition)}%
        </div>
      )}

      {showHint && !(mode === 'fullscreen' && isCleanMode) && (
        <div className="pointer-events-none absolute bottom-2 right-2 z-20 inline-flex items-center gap-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/15 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md animate-pulse">
          <DSIcon name="sparkles" size={12} className="text-brand-primary" />
          Arraste para ver evolução
        </div>
      )}

      {!(mode === 'fullscreen' && isCleanMode) && (
        <div className="pointer-events-none absolute bottom-8 left-2 z-20 rounded-full border border-white/20 bg-black/35 px-2 py-1 text-[9px] font-medium text-white/90 backdrop-blur-sm">
          {activeStoryGoal === 'definition'
            ? 'Didático: foco em definição com constância'
            : activeStoryGoal === 'muscle_gain'
              ? 'Didático: foco em hipertrofia com progressão'
              : 'Didático: antes real × depois estimado com aderência ao plano'}
        </div>
      )}

      {/* Labels */}
      <div className="absolute top-2 left-2 z-10 rounded-full border border-white/25 bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
        {beforeLabel}
      </div>
      <div
        className="absolute top-2 right-2 z-10 rounded-full border border-white/25 bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md"
        style={{ opacity: sliderPosition / 100 }}
      >
        {afterLabel}
      </div>
    </div>
  )

  return (
    <>
      {renderSlider('inline')}

      {isFullscreen && (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-black/82 p-3 backdrop-blur-2xl"
          onClick={() => {
            setIsFullscreen(false)
            pauseStory('fullscreen')
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(61,252,164,0.22),transparent_45%)]" />
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setIsFullscreen(false)
                pauseStory('fullscreen')
              }}
              className="absolute -top-11 right-0 inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/70"
            >
              <DSIcon name="x" size={16} /> Fechar
            </button>

            <div className="overflow-hidden rounded-3xl border border-white/15 bg-black/20 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
              {renderSlider('fullscreen')}
            </div>

            <div className="mt-3 rounded-2xl border border-white/12 bg-black/35 p-3 backdrop-blur-xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {([
                  { key: 'definition', label: 'Definição' },
                  { key: 'muscle_gain', label: 'Hipertrofia' },
                  { key: 'recomposition', label: 'Recomposição' },
                ] as const).map((goal) => (
                  <button
                    key={goal.key}
                    type="button"
                    onClick={() => {
                      setSelectedStoryGoal(goal.key)
                      pauseStory('fullscreen')
                      storyCompletedRef.current = false
                    }}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                      selectedStoryGoal === goal.key
                        ? 'bg-brand-primary text-bg-dark shadow-[0_0_16px_rgba(61,252,164,0.35)]'
                        : 'bg-white/8 text-white/85 hover:bg-white/14'
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCleanMode((v) => !v)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                    isCleanMode
                      ? 'bg-brand-primary text-bg-dark'
                      : 'bg-white/8 text-white/85 hover:bg-white/14'
                  }`}
                >
                  {isCleanMode ? 'Modo clean ativo' : 'Ativar modo clean'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = !lockMidline
                    setLockMidline(next)
                    if (next) setSliderPosition(50)
                  }}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                    lockMidline
                      ? 'bg-brand-primary text-bg-dark'
                      : 'bg-white/8 text-white/85 hover:bg-white/14'
                  }`}
                >
                  {lockMidline ? 'Trava 50% ligada' : 'Travar em 50%'}
                </button>

                <button
                  type="button"
                  onClick={shareStory}
                  className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold text-white/90 transition hover:bg-white/14"
                >
                  <DSIcon name="share" size={14} /> Compartilhar
                </button>

                <button
                  type="button"
                  onClick={exportStoryImage}
                  className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold text-white/90 transition hover:bg-white/14"
                >
                  <DSIcon name="download" size={14} /> Exportar
                </button>
              </div>

              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {storySteps.map((step, idx) => (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => {
                        setStoryStep(idx)
                        setSliderPosition(step.position)
                        pauseStory('fullscreen')
                        storyCompletedRef.current = false
                      }}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        idx === storyStep
                          ? 'bg-brand-primary text-bg-dark'
                          : 'bg-white/8 text-white/85 hover:bg-white/14'
                      }`}
                    >
                      {step.title}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsStoryPlaying((v) => {
                      const next = !v
                      void trackStoryEvent(next ? 'story_play' : 'story_pause')
                      return next
                    })
                  }}
                  className="rounded-full border border-brand-primary/35 bg-brand-primary/18 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-brand-primary/28"
                >
                  {isStoryPlaying ? 'Pausar Story' : 'Play Story'}
                </button>
              </div>

              <p className="text-xs font-medium text-white/90">
                {storySteps[storyStep].description}
              </p>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand-primary transition-all duration-500"
                  style={{ width: `${((storyStep + 1) / storySteps.length) * 100}%` }}
                />
              </div>

              {storyStep === storySteps.length - 1 && (
                <button
                  type="button"
                  onClick={openStoryCta}
                  className="mt-3 w-full rounded-xl bg-brand-primary px-3 py-2 text-sm font-bold text-bg-dark transition-all hover:bg-brand-primary-hover"
                >
                  Montar plano de ação agora
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
