/**
 * src/components/calendar/calendar-weekly.tsx
 *
 * CalendarWeekly — Weekly schedule UI (MVP)
 *
 * Exports: CalendarWeekly
 * Hooks: useEffect, useMemo, useState, useAuthStore, useCalendarEvents, useCreateCalendarEvent
 * Features: Auth: useAuthStore · 'use client' · Framer Motion · DSIcon
 */

// ============================================
// CalendarWeekly — Weekly schedule UI (MVP)
// Inspired by: claim-pants weekly schedule
// ============================================

'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DSIcon, type DSIconName } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StyledSelect } from '@/components/ui/styled-select'
import { toast } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  type CalendarEventApi,
} from '@/hooks/use-calendar'
import { useStudents } from '@/hooks/use-students'
import { useScrollLock } from '@/hooks/use-scroll-lock'

type ViewMode = 'weekly' | 'daily'

type EventStatus = 'available' | 'partial' | 'busy'

type CalendarEvent = {
  id: string
  title?: string
  teacherName: string
  studentName: string
  studentId?: string | null
  notes?: string
  meetingUrl?: string
  start: string // ISO
  end: string // ISO
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  status?: EventStatus
}

const COLOR_STYLES: Record<CalendarEvent['color'], string> = {
  blue: 'bg-blue-600 text-white',
  green: 'bg-emerald-600 text-white',
  purple: 'bg-purple-600 text-white',
  orange: 'bg-orange-600 text-white',
  red: 'bg-rose-600 text-white',
}

const STATUS_DOT: Record<EventStatus, string> = {
  available: 'bg-emerald-500',
  partial: 'bg-amber-500',
  busy: 'bg-rose-500',
}

function startOfWeek(date: Date) {
  // Monday start
  const d = new Date(date)
  const day = d.getDay() // 0 Sun
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit' }).format(date)
}

function formatHourLabel(h: number) {
  const hh = String(h).padStart(2, '0')
  return `${hh}:00`
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function minutesSinceDayStart(date: Date) {
  return date.getHours() * 60 + date.getMinutes()
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function localInputDefault(hoursFromNow: number) {
  const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000)
  d.setMinutes(0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

function toIsoFromLocalInput(v: string) {
  // datetime-local → Date() (interpreta como local) → ISO
  const d = new Date(v)
  return d.toISOString()
}

function apiToUi(e: CalendarEventApi): CalendarEvent {
  const isBlock = !e.student_id
  return {
    id: e.id,
    title: e.title ?? undefined,
    teacherName: e.personal_name,
    studentName: e.student_name || (isBlock ? 'Bloqueio' : 'Aluno'),
    studentId: e.student_id ?? null,
    start: e.start_at,
    end: e.end_at,
    notes: e.notes ?? undefined,
    meetingUrl: e.meeting_url ?? undefined,
    color: (e.color as CalendarEvent['color']) || 'blue',
    status: (e.status as EventStatus) || undefined,
  }
}

export function CalendarWeekly() {
  const isStudent = useAuthStore((s) => s.isStudent)
  const userName = useAuthStore((s) => s.user?.full_name)
  const studentPersonalName = useAuthStore((s) => s.studentProfile?.personal_name)
  const personalName = studentPersonalName || userName || 'Personal'

  const [view, setView] = useState<ViewMode>('weekly')
  const [weekAnchor, setWeekAnchor] = useState(() => new Date())
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<CalendarEvent | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  useScrollLock(!!selected || createOpen || editOpen)

  // ESC: fecha primeiro editor, depois detalhe
  useEffect(() => {
    const hasOpenModal = Boolean(selected || createOpen || editOpen)
    if (!hasOpenModal) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (createOpen || editOpen) {
        setCreateOpen(false)
        setEditOpen(false)
        return
      }
      setSelected(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected, createOpen, editOpen])

  const weekStart = useMemo(() => startOfWeek(weekAnchor), [weekAnchor])
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const range = useMemo(() => {
    const from = new Date(weekStart)
    const to = addDays(weekStart, 7)
    return { from: from.toISOString(), to: to.toISOString() }
  }, [weekStart])

  const calendar = useCalendarEvents(range)
  const createEvent = useCreateCalendarEvent(range)
  const updateEvent = useUpdateCalendarEvent(selected?.id || '', range)
  const deleteEvent = useDeleteCalendarEvent(selected?.id || '', range)

  const readOnly = isStudent()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const uiEvents = (calendar.data?.events ?? []).map(apiToUi)
    if (!q) return uiEvents
    return uiEvents.filter((e) =>
      [e.title, e.teacherName, e.studentName, e.notes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [calendar.data?.events, query])

  const dayForDaily = useMemo(() => {
    // Daily: usar o dia "hoje" dentro da semana exibida
    const now = new Date()
    const inWeek = days.find((d) => isSameDay(d, now))
    return inWeek ?? days[0]
  }, [days])

  const visibleDays = view === 'weekly' ? days : [dayForDaily]

  const HOUR_START = 8
  const HOUR_END = 20
  const ROW_H = 56 // px

  function handleAdd() {
    if (readOnly) {
      toast.info('A agenda do aluno é somente leitura por enquanto.')
      return
    }
    setCreateOpen(true)
  }

  return (
    <div className="grid gap-6 lg:min-h-[calc(100dvh-9rem)] lg:grid-cols-[360px_1fr] lg:items-stretch lg:gap-8">
      {/* Left panel */}
      <div className="h-full rounded-2xl border border-border-light bg-bg-primary p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Agenda</h2>
            <p className="mt-1 text-sm text-text-secondary">Semana / dia + lembretes (em breve)</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <DSIcon name="calendarDays" size={20} />
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="flex items-center gap-2 rounded-xl border border-border-light bg-bg-secondary px-3 py-2">
            <DSIcon name="search" size={16} className="text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar aluno, notas..."
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
        </div>

        {/* Teacher cards (MVP: 1 teacher) */}
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Personais</p>
          <div className="mt-2 space-y-2">
            <div className="relative flex items-center gap-3 rounded-2xl bg-bg-secondary p-3 shadow-[0_3px_0_0_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_3px_0_0_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_5px_0_0_rgba(0,0,0,0.2),0_8px_20px_rgba(0,0,0,0.18)]">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                <DSIcon name="userRound" size={20} />
                <span className={cn('absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-bg-secondary', STATUS_DOT.available)} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">{personalName}</p>
                <p className="text-xs text-text-muted">Disponível</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-5 border-t border-border-light pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Legenda</p>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT.available)} />
              <span className="text-text-secondary">Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT.partial)} />
              <span className="text-text-secondary">Parcial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT.busy)} />
              <span className="text-text-secondary">Ocupado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main panel */}
      <div className="h-full overflow-hidden rounded-2xl border border-border-light bg-bg-primary shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
        {/* Top controls */}
        <div className="flex flex-col gap-3 border-b border-border-light p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekAnchor((d) => addDays(d, -7))}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 shadow-[0_3px_0_0_#d4d4d8,0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_#d4d4d8,0_6px_16px_rgba(0,0,0,0.06)] active:translate-y-0.5 active:shadow-[0_1px_0_0_#d4d4d8] active:scale-[0.97] transition-all dark:bg-zinc-600 dark:text-zinc-200 dark:shadow-[0_3px_0_0_#27272a,0_4px_12px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_5px_0_0_#27272a,0_6px_16px_rgba(0,0,0,0.30)] dark:active:shadow-[0_1px_0_0_#27272a]"
              aria-label="Semana anterior"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-linear-to-b from-white/30 to-transparent" />
              <DSIcon name="chevronLeft" size={20} className="relative" />
            </button>
            <button
              onClick={() => setWeekAnchor((d) => addDays(d, 7))}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 shadow-[0_3px_0_0_#d4d4d8,0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_#d4d4d8,0_6px_16px_rgba(0,0,0,0.06)] active:translate-y-0.5 active:shadow-[0_1px_0_0_#d4d4d8] active:scale-[0.97] transition-all dark:bg-zinc-600 dark:text-zinc-200 dark:shadow-[0_3px_0_0_#27272a,0_4px_12px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_5px_0_0_#27272a,0_6px_16px_rgba(0,0,0,0.30)] dark:active:shadow-[0_1px_0_0_#27272a]"
              aria-label="Próxima semana"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-linear-to-b from-white/20 to-transparent" />
              <DSIcon name="chevronRight" size={20} className="relative" />
            </button>
            <div className="ml-1">
              <p className="text-sm font-semibold text-text-primary">
                {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(weekStart)}
              </p>
              <p className="text-xs text-text-muted">{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(weekStart)} — {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(addDays(weekStart, 6))}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-xl bg-zinc-100 p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] dark:bg-zinc-700 dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">              <button
                onClick={() => setView('weekly')}
                className={cn(
                  'relative h-9 rounded-lg px-4 text-sm font-bold transition-all duration-200',
                  view === 'weekly'
                    ? 'bg-brand-primary text-bg-dark shadow-[0_2px_0_0_#166534,0_4px_12px_rgba(34,197,94,0.25)] -translate-y-px'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                )}
              >
                {view === 'weekly' && <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg bg-linear-to-b from-white/20 to-transparent" />}
                <span className="relative">Semana</span>
              </button>
              <button
                onClick={() => setView('daily')}
                className={cn(
                  'relative h-9 rounded-lg px-4 text-sm font-bold transition-all duration-200',
                  view === 'daily'
                    ? 'bg-brand-primary text-bg-dark shadow-[0_2px_0_0_#166534,0_4px_12px_rgba(34,197,94,0.25)] -translate-y-px'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                )}
              >
                {view === 'daily' && <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg bg-linear-to-b from-white/20 to-transparent" />}
                <span className="relative">Dia</span>
              </button>
            </div>

            {!readOnly && (
              <Button onClick={handleAdd} className="gap-2">
                <DSIcon name="plus" size={16} />
                Novo
              </Button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="relative overflow-auto">
          <div className="min-w-225">
            {/* Header row */}
            <div className="grid" style={{ gridTemplateColumns: `96px repeat(${visibleDays.length}, 1fr)` }}>
              <div className="border-b border-border-light bg-bg-primary p-3 text-xs font-semibold text-text-muted">Hora</div>
              {visibleDays.map((d) => (
                <div key={d.toISOString()} className="border-b border-l border-border-light bg-bg-primary p-3">
                  <p className="text-xs font-semibold text-text-muted">{formatDayLabel(d)}</p>
                </div>
              ))}
            </div>

            {/* Body rows */}
            <div className="relative">
              {/* Row grid */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `96px repeat(${visibleDays.length}, 1fr)`,
                  gridTemplateRows: `repeat(${HOUR_END - HOUR_START + 1}, ${ROW_H}px)`,
                }}
              >
                {Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => {
                  const hour = HOUR_START + i
                  return (
                    <div
                      key={`time-${hour}`}
                      className="border-b border-border-light bg-bg-primary px-3 py-2 text-xs text-text-muted"
                    >
                      {formatHourLabel(hour)}
                    </div>
                  )
                })}

                {Array.from({ length: (HOUR_END - HOUR_START + 1) * visibleDays.length }, (_, idx) => {
                  const col = idx % visibleDays.length
                  return (
                    <div
                      key={`cell-${idx}`}
                      className={cn(
                        'border-b border-l border-border-light bg-bg-primary',
                        col === 0 && 'bg-bg-primary'
                      )}
                    />
                  )
                })}
              </div>

              {/* Events overlay */}
              <div
                className="absolute left-0 top-0 grid"
                style={{
                  gridTemplateColumns: `96px repeat(${visibleDays.length}, 1fr)`,
                  width: '100%',
                  height: (HOUR_END - HOUR_START + 1) * ROW_H,
                }}
              >
                <div />
                {visibleDays.map((day) => {
                  const dayEvents = filtered.filter((e) => isSameDay(new Date(e.start), day))

                  return (
                    <div key={day.toISOString()} className="relative">
                      {dayEvents.map((e) => {
                        const s = new Date(e.start)
                        const en = new Date(e.end)
                        const sMin = minutesSinceDayStart(s)
                        const eMin = minutesSinceDayStart(en)

                        const gridStart = HOUR_START * 60
                        const gridEnd = HOUR_END * 60 + 60

                        const topMin = clamp(sMin, gridStart, gridEnd) - gridStart
                        const heightMin = clamp(eMin, gridStart, gridEnd) - clamp(sMin, gridStart, gridEnd)

                        const topPx = (topMin / 60) * ROW_H
                        const heightPx = Math.max(34, (heightMin / 60) * ROW_H)

                        return (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => setSelected(e)}
                            className={cn(
                              'absolute left-2 right-2 rounded-xl p-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/40',
                              COLOR_STYLES[e.color]
                            )}
                            style={{ top: topPx + 8, height: heightPx - 12 }}
                          >
                            <p className="truncate text-sm font-semibold">{e.teacherName}</p>
                            <p className="truncate text-xs opacity-90">
                              {e.title?.trim() ? e.title.trim() : e.studentName}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] opacity-90">
                              <DSIcon name="clock" size={14} />
                              <span>
                                {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(s)}
                                {' — '}
                                {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(en)}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-60 grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
            style={{
              paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
              paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 12, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="w-full max-w-lg max-h-[calc(100dvh-2rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] overflow-y-auto rounded-2xl border border-border-light bg-bg-primary p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Detalhes do agendamento"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <DSIcon name="calendarDays" size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-text-primary">Detalhes</p>
                    <p className="text-sm text-text-muted">Agendamento</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
                  aria-label="Fechar"
                >
                  <DSIcon name="x" size={20} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <DetailRow icon="user" label="Personal" value={selected.teacherName} />
                <DetailRow icon="userRound" label="Aluno" value={selected.studentName} />
                <DetailRow
                  icon="clock"
                  label="Horário"
                  value={`${new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date(selected.start))}, ${new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(selected.start))} — ${new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(selected.end))}`}
                />

                {selected.meetingUrl && (
                  <div className="rounded-xl border border-border-light bg-bg-secondary p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                      <DSIcon name="link" size={16} className="text-text-muted" />
                      Link
                    </div>
                    <a
                      href={selected.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex text-sm text-brand-primary hover:underline"
                    >
                      Entrar na reunião
                    </a>
                  </div>
                )}

                {selected.notes && (
                  <div className="rounded-xl border border-border-light bg-bg-secondary p-3">
                    <div className="text-sm font-semibold text-text-primary">Notas</div>
                    <p className="mt-1 text-sm text-text-secondary">{selected.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    if (readOnly) return
                    setEditOpen(true)
                  }}
                  disabled={readOnly}
                >
                  <DSIcon name="pencil" size={16} />
                  Editar
                </Button>
                <Button
                  variant="danger"
                  className="gap-2"
                  disabled={readOnly || deleteEvent.isPending}
                  onClick={() => {
                    if (readOnly) return
                    if (!confirm('Excluir este agendamento?')) return
                    deleteEvent.mutate(undefined, {
                      onSuccess: () => setSelected(null),
                    })
                  }}
                >
                  <DSIcon name="trash" size={16} />
                  Excluir
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit modal */}
      {!readOnly && (
        <EventEditor
          mode={createOpen ? 'create' : editOpen ? 'edit' : null}
          onClose={() => {
            setCreateOpen(false)
            setEditOpen(false)
          }}
          initial={selected}
          onCreate={(payload) => createEvent.mutate(payload, { onSuccess: () => setCreateOpen(false) })}
          onUpdate={(payload) => {
            if (!selected) return
            updateEvent.mutate(payload, { onSuccess: () => setEditOpen(false) })
          }}
          busy={createEvent.isPending || updateEvent.isPending}
          canPickStudent
        />
      )}
    </div>
  )
}

function EventEditor({
  mode,
  onClose,
  initial,
  onCreate,
  onUpdate,
  busy,
  canPickStudent,
}: {
  mode: 'create' | 'edit' | null
  onClose: () => void
  initial: CalendarEvent | null
  onCreate: (payload: {
    student_id?: string | null
    title?: string | null
    notes?: string | null
    meeting_url?: string | null
    start_at: string
    end_at: string
    color?: CalendarEvent['color']
    status?: EventStatus
  }) => void
  onUpdate: (payload: {
    student_id?: string | null
    title?: string | null
    notes?: string | null
    meeting_url?: string | null
    start_at?: string
    end_at?: string
    color?: CalendarEvent['color']
    status?: EventStatus | null
  }) => void
  busy: boolean
  canPickStudent: boolean
}) {
  const isOpen = mode !== null
  const students = useStudents({ per_page: 200, status: 'active' })

  const [studentId, setStudentId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [color, setColor] = useState<CalendarEvent['color']>('blue')
  const [status, setStatus] = useState<EventStatus>('available')
  const [startLocal, setStartLocal] = useState(() => localInputDefault(1))
  const [endLocal, setEndLocal] = useState(() => localInputDefault(2))

  // Hydrate on open
  useEffect(() => {
    if (!isOpen) return
    if (mode === 'edit' && initial) {
      setTitle(initial.title || '')
      setNotes(initial.notes || '')
      setMeetingUrl(initial.meetingUrl || '')
      setColor(initial.color)
      setStatus(initial.status || 'available')
      setStudentId(initial.studentId || '')
      // try to set local inputs from ISO
      const s = new Date(initial.start)
      const e = new Date(initial.end)
      const toLocal = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      }
      setStartLocal(toLocal(s))
      setEndLocal(toLocal(e))
    } else if (mode === 'create') {
      setTitle('')
      setNotes('')
      setMeetingUrl('')
      setColor('blue')
      setStatus('available')
      setStartLocal(localInputDefault(1))
      setEndLocal(localInputDefault(2))
      setStudentId('')
    }
  }, [isOpen, mode, initial])

  if (!isOpen) return null

  function submit() {
    const start_at = toIsoFromLocalInput(startLocal)
    const end_at = toIsoFromLocalInput(endLocal)

    if (end_at <= start_at) {
      toast.error('Horário inválido: fim deve ser maior que início')
      return
    }

    const payloadBase = {
      student_id: studentId ? studentId : null,
      title: title.trim() ? title.trim() : null,
      notes: notes.trim() ? notes.trim() : null,
      meeting_url: meetingUrl.trim() ? meetingUrl.trim() : null,
      color,
      status,
    }

    if (mode === 'create') {
      onCreate({ ...payloadBase, start_at, end_at })
    } else {
      onUpdate({ ...payloadBase, start_at, end_at })
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-60 grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
        style={{
          paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 12, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 12, opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="w-full max-w-xl max-h-[calc(100dvh-2rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] overflow-y-auto rounded-2xl border border-border-light bg-bg-primary p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={mode === 'create' ? 'Criar agendamento' : 'Editar agendamento'}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-text-primary">{mode === 'create' ? 'Novo agendamento' : 'Editar agendamento'}</p>
              <p className="text-sm text-text-muted">Semana/dia • lembretes na próxima etapa</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
              aria-label="Fechar"
            >
              <DSIcon name="x" size={20} />
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Título (opcional)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sessão • Avaliação • Bloqueio"
                className="mt-1 w-full rounded-xl border border-border-light bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/25"
              />
            </div>

            {canPickStudent && (
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Aluno (opcional)</label>
                <StyledSelect
                  value={studentId}
                  onChange={setStudentId}
                  options={[
                    { value: '', label: '(sem aluno — bloqueio/slot)' },
                    ...(students.data?.students ?? []).map((s) => ({ value: s.id, label: s.full_name })),
                  ]}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Início</label>
              <input
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border-light bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Fim</label>
              <input
                type="datetime-local"
                value={endLocal}
                onChange={(e) => setEndLocal(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border-light bg-bg-secondary px-3 py-2 text-sm text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Cor</label>
              <StyledSelect
                value={color}
                onChange={(v) => setColor(v as CalendarEvent['color'])}
                options={[
                  { value: 'blue', label: 'Azul' },
                  { value: 'green', label: 'Verde' },
                  { value: 'purple', label: 'Roxo' },
                  { value: 'orange', label: 'Laranja' },
                  { value: 'red', label: 'Vermelho' },
                ]}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Status</label>
              <StyledSelect
                value={status}
                onChange={(v) => setStatus(v as EventStatus)}
                options={[
                  { value: 'available', label: 'Disponível' },
                  { value: 'partial', label: 'Parcial' },
                  { value: 'busy', label: 'Ocupado' },
                ]}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Link (opcional)</label>
              <input
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="mt-1 w-full rounded-xl border border-border-light bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/25"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Notas (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-border-light bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/25"
                placeholder="Observações do treino/consulta"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={busy}>Cancelar</Button>
            <Button onClick={submit} loading={busy} className="gap-2">
              {mode === 'create' ? (<><DSIcon name="plus" size={16} /> Criar</>) : (<><DSIcon name="pencil" size={16} /> Salvar</>)}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: DSIconName
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-bg-tertiary text-text-muted">
        <DSIcon name={icon} size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-text-primary">{value}</p>
      </div>
    </div>
  )
}
