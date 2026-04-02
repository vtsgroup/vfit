/**
 * src/components/workouts/photo-comparison.tsx
 *
 * Photo Comparison — Before/After slider
 *
 * Exports: PhotoComparison
 * Hooks: useState, useRef, useCallback
 * Features: 'use client'
 */

// ============================================
// Photo Comparison — Before/After slider
// ============================================

'use client'

import Image from 'next/image'
import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface PhotoComparisonProps {
  beforeUrl: string
  afterUrl: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function PhotoComparison({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Antes',
  afterLabel = 'Depois',
  className,
}: PhotoComparisonProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const handleStart = () => {
    isDragging.current = true
  }
  const handleEnd = () => {
    isDragging.current = false
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative aspect-[3/4] overflow-hidden rounded-2xl bg-bg-tertiary cursor-col-resize select-none',
        className
      )}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* After (full background) */}
      <Image
        src={afterUrl}
        alt={afterLabel}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        unoptimized
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <Image
          src={beforeUrl}
          alt={beforeLabel}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
          className="absolute inset-0 h-full object-cover"
          style={{ width: `${containerRef.current?.offsetWidth ?? 400}px` }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute bottom-0 top-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${position}%` }}
      >
        {/* Handle */}
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
          <div className="flex gap-0.5">
            <div className="h-4 w-0.5 rounded-full bg-gray-400" />
            <div className="h-4 w-0.5 rounded-full bg-gray-400" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white">
        {beforeLabel}
      </div>
      <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white">
        {afterLabel}
      </div>
    </div>
  )
}
