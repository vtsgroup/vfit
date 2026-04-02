/**
 * src/components/assessments/assessment-timeline.tsx
 *
 * Assessment Timeline — Visual timeline com thumbnails e métricas
 *
 * Exports: AssessmentTimeline
 * Hooks: useMemo
 * Features: 'use client' · DSIcon
 */

// ============================================
// Assessment Timeline — Visual timeline com thumbnails e métricas
// VFIT — v2.0
// ============================================

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { cn } from '@/lib/utils'
import type { AssessmentListItem } from '@/hooks/use-assessments'

interface AssessmentTimelineProps {
  assessments: AssessmentListItem[]
  className?: string
  maxItems?: number
}

interface TimelineMetric {
  trend: 'up' | 'down' | 'stable'
  diff: number
}

export function AssessmentTimeline({
  assessments,
  className,
  maxItems = 8,
}: AssessmentTimelineProps) {
  const items = useMemo(() => {
    // Sort by date (most recent first)
    const sorted = [...assessments]
      .sort((a, b) => new Date(b.assessment_date).getTime() - new Date(a.assessment_date).getTime())
      .slice(0, maxItems)

    return sorted.map((item, idx) => {
      const next = sorted[idx + 1] // previous assessment (older)
      let weightTrend: TimelineMetric | null = null
      let fatTrend: TimelineMetric | null = null

      if (next && item.weight_kg && next.weight_kg) {
        const diff = Number(item.weight_kg) - Number(next.weight_kg)
        weightTrend = {
          trend: Math.abs(diff) < 0.3 ? 'stable' : diff > 0 ? 'up' : 'down',
          diff: Math.round(diff * 10) / 10,
        }
      }
      if (next && item.body_fat_percentage && next.body_fat_percentage) {
        const diff = Number(item.body_fat_percentage) - Number(next.body_fat_percentage)
        fatTrend = {
          trend: Math.abs(diff) < 0.3 ? 'stable' : diff > 0 ? 'up' : 'down',
          diff: Math.round(diff * 10) / 10,
        }
      }

      return { ...item, weightTrend, fatTrend }
    })
  }, [assessments, maxItems])

  if (items.length < 2) return null

  return (
    <div className={cn('relative', className)}>
      <h3 className="mb-4 text-sm font-semibold text-text-muted uppercase tracking-wider">
        Timeline de Avaliações
      </h3>

      <div className="relative flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
        {/* Timeline line */}
        <div className="absolute top-10 left-0 right-0 h-0.5 bg-white/8" />

        {items.map((item, idx) => {
          const date = new Date(item.assessment_date)
          const isFirst = idx === 0
          return (
            <Link
              key={item.id}
              href={`/dashboard/assessments/view?id=${item.id}`}
              className={cn(
                'relative flex flex-col items-center px-3 min-w-20 group transition-all',
                'hover:scale-105'
              )}
            >
              {/* Node dot */}
              <div
                className={cn(
                  'relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                  isFirst
                    ? 'border-brand-primary bg-brand-primary shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                    : 'border-white/20 bg-surface-elevated group-hover:border-brand-primary/50'
                )}
              >
                {isFirst && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>

              {/* Photo indicator */}
              <div
                className={cn(
                  'mt-2 flex h-14 w-14 items-center justify-center rounded-lg border transition-all',
                  item.photo_count > 0
                    ? 'border-brand-primary/20 bg-brand-primary/8'
                    : 'border-white/6 bg-white/3'
                )}
              >
                {item.photo_count > 0 ? (
                  <div className="text-center">
                    <DSIcon name="camera" size={16} className="mx-auto text-brand-primary" />
                    <span className="mt-0.5 block text-[9px] text-brand-primary">
                      {item.photo_count}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-text-muted">
                    #{items.length - idx}
                  </span>
                )}
              </div>

              {/* Date */}
              <span className="mt-1.5 text-[10px] font-medium text-text-muted whitespace-nowrap">
                {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>

              {/* Metrics trends */}
              <div className="mt-1 flex flex-col gap-0.5">
                {item.weightTrend && (
                  <div className="flex items-center gap-0.5 text-[9px]">
                    <DSIcon name="dumbbell" size={10} className="text-text-muted" />
                    {(() => {
                      if (item.weightTrend.trend === 'stable') {
                        return <span className={cn('inline-block h-0.5 w-2.5 rounded-full', 'bg-text-muted')} />
                      }
                      return (
                        <DSIcon
                          name={item.weightTrend.trend === 'up' ? 'trendingUp' : 'arrowDown'}
                          size={10}
                          className={cn(
                            item.weightTrend.trend === 'down' ? 'text-success' : item.weightTrend.trend === 'up' ? 'text-warning' : 'text-text-muted'
                          )}
                        />
                      )
                    })()}
                    <span
                      className={cn(
                        'font-mono',
                        item.weightTrend.trend === 'down' ? 'text-success' : item.weightTrend.trend === 'up' ? 'text-warning' : 'text-text-muted'
                      )}
                    >
                      {item.weightTrend.diff > 0 ? '+' : ''}{item.weightTrend.diff}
                    </span>
                  </div>
                )}
                {item.fatTrend && (
                  <div className="flex items-center gap-0.5 text-[9px]">
                    <DSIcon name="percent" size={10} className="text-text-muted" />
                    {(() => {
                      if (item.fatTrend.trend === 'stable') {
                        return <span className={cn('inline-block h-0.5 w-2.5 rounded-full', 'bg-text-muted')} />
                      }
                      return (
                        <DSIcon
                          name={item.fatTrend.trend === 'up' ? 'trendingUp' : 'arrowDown'}
                          size={10}
                          className={cn(
                            item.fatTrend.trend === 'down' ? 'text-success' : item.fatTrend.trend === 'up' ? 'text-warning' : 'text-text-muted'
                          )}
                        />
                      )
                    })()}
                    <span
                      className={cn(
                        'font-mono',
                        item.fatTrend.trend === 'down' ? 'text-success' : item.fatTrend.trend === 'up' ? 'text-warning' : 'text-text-muted'
                      )}
                    >
                      {item.fatTrend.diff > 0 ? '+' : ''}{item.fatTrend.diff}%
                    </span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
