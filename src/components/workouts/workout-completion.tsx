/**
 * src/components/workouts/workout-completion.tsx
 *
 * Workout Completion Celebration — S08-06
 *
 * Exports: WorkoutCompletionCelebration
 * Hooks: useEffect, useState, useRef, useConfetti
 * Features: 'use client' · Framer Motion · DSIcon
 */

// ============================================
// Workout Completion Celebration — S08-06
// Confetti + XP earned + badge notification
// ============================================

'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'


// ============================================
// Confetti Particle System
// ============================================

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  shape: 'circle' | 'square' | 'star'
}

const CONFETTI_COLORS = [
  '#22C55E', '#10B981', '#06B6D4', '#8B5CF6',
  '#F59E0B', '#EF4444', '#EC4899', '#3B82F6',
  '#14B8A6', '#F97316',
]

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!active || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    // Create particles
    const particles: Particle[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        id: i,
        x: Math.random() * canvas.offsetWidth,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: Math.random() * 6 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        shape: (['circle', 'square', 'star'] as const)[Math.floor(Math.random() * 3)],
      })
    }
    particlesRef.current = particles

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      let alive = 0
      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08 // gravity
        p.rotation += p.rotationSpeed

        if (p.y > canvas.offsetHeight + 20) continue
        alive++

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.offsetHeight)

        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        } else {
          // star
          const spikes = 5
          const outerR = p.size / 2
          const innerR = outerR / 2.5
          ctx.beginPath()
          for (let j = 0; j < spikes * 2; j++) {
            const r = j % 2 === 0 ? outerR : innerR
            const angle = (Math.PI / spikes) * j - Math.PI / 2
            if (j === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
            else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
          }
          ctx.closePath()
          ctx.fill()
        }

        ctx.restore()
      }

      if (alive > 0) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [active])

  return canvasRef
}

// ============================================
// Celebration Sound (optional Web Audio)
// ============================================

function playCelebrationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

    // Victory chord: C major arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12)
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.12)
      osc.stop(ctx.currentTime + i * 0.12 + 0.7)
    })

    // Auto-close context
    setTimeout(() => ctx.close(), 2000)
  } catch {
    // Web Audio not available
  }
}

// ============================================
// Main Component
// ============================================

interface WorkoutCompletionProps {
  xpEarned?: number
  xpBalance?: number
  streakMilestones?: Array<{ days: number; xpAwarded: number }>
  onFinalize: () => void
  onReplay: () => void
  isBusy: boolean
  isFinalized: boolean
}

export function WorkoutCompletionCelebration({
  xpEarned,
  xpBalance,
  streakMilestones = [],
  onFinalize,
  onReplay,
  isBusy,
  isFinalized,
}: WorkoutCompletionProps) {
  const [showDetails, setShowDetails] = useState(false)
  const confettiRef = useConfetti(true)

  // Play sound on mount
  useEffect(() => {
    playCelebrationSound()
    const t = setTimeout(() => setShowDetails(true), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-success/30 bg-linear-to-b from-success/10 to-transparent p-6">
      {/* Confetti Canvas */}
      <canvas
        ref={confettiRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ zIndex: 1 }}
      />

      {/* Content */}
      <div className="relative z-10 space-y-5">
        {/* Trophy animation */}
        <motion.div
          className="text-center"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
        >
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-success/20 ring-4 ring-success/10">
            <DSIcon name="trophy" size={40} className="text-success" />
          </div>
          <motion.h3
            className="text-2xl font-black text-text-primary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Treino Concluído!
          </motion.h3>
          <motion.p
            className="mt-1 text-sm text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Excelente trabalho! Continue assim.
          </motion.p>
        </motion.div>

        {/* XP Badge */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              className="mx-auto max-w-xs"
            >
              {/* XP Earned Card */}
              {isFinalized && xpEarned != null && (
                <div className="rounded-xl bg-linear-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <DSIcon name="flame" className="text-yellow-400" />
                    <span className="text-3xl font-black text-yellow-400">+{xpEarned}</span>
                    <span className="text-sm font-bold text-yellow-400/80">XP</span>
                  </div>
                  {xpBalance != null && (
                    <p className="mt-1 text-xs text-text-muted">
                      Saldo total: <strong className="text-text-primary">{xpBalance} XP</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Streak Milestones */}
              {streakMilestones.length > 0 && (
                <div className="mt-3 space-y-2">
                  {streakMilestones.map((m, i) => (
                    <motion.div
                      key={m.days}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 * (i + 1) }}
                      className="flex items-center gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2"
                    >
                      <DSIcon name="flame" size={16} className="text-orange-400" />
                      <span className="text-xs font-medium text-orange-300">
                        Streak de {m.days} dias! +{m.xpAwarded} XP bônus
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <motion.div
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {!isFinalized ? (
            <Button
              variant="workout"
              size="lg"
              className="w-full"
              onClick={onFinalize}
              disabled={isBusy}
              loading={isBusy}
            >
              <DSIcon name="checkCircle2" size={20} className="mr-2" />
              Finalizar e ganhar XP
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              <DSIcon name="star" size={16} className="mr-2 text-success" />
              Sessão finalizada ✓
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={onReplay} disabled={isBusy}>
            <DSIcon name="rotateCcw" size={16} className="mr-2" />
            Replay
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
