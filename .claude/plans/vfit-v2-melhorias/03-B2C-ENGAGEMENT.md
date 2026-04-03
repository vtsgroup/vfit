# 03. B2C Engagement Layer — Streaks, Achievements, Push, Social

> **Sprint:** S19 (5 dias)  
> **Impacto:** Increase retention 25%, engagement +40%  
> **Data:** 14-18/04/2026

---

## Executive Summary

VFIT B2C hoje tem: onboarding ✅, treino ativo ✅, mas falta engagement visual.

**S19 Objectives:**
- 🔥 Streaks calendar visual (7/30/100 day milestones)
- 🏆 Achievements gallery (badges com SVG icons + rarity tiers)
- 📱 Social share (planos + referral links)
- 🔔 Smart push notifications (personalizadas + segments)

**Expected:** 25% more daily active users, 40% increase in workout completion rate.

---

## Phase 19a: Streaks Visual System (2 dias)

### T19a.1: StreakCalendar Component

**What:**
```typescript
// src/components/fitness/streak-calendar.tsx
export function StreakCalendar({
  days: { completed: boolean, minutes: number, km: number }[]
}) {
  // 56-day grid (8 weeks)
  // Colors: ✅ green, ⏸️ gray, ❌ red, 🚫 future
  // Hover: tooltip showing details
}
```

**Design:**
```
M  T  W  T  F  S  S
✅ ✅ ✅ ✅ ✅ ✅ ⏸️   Week 1 (current week)
✅ ✅ ✅ ✅ ✅ ✅ ✅   Week 2
✅ ✅ ✅ ✅ ✅ ⏸️ ⏸️   Week 3
✅ ✅ ✅ ✅ ✅ ✅ ✅   Week 4
✅ ✅ ✅ ✅ ✅ ✅ ✅   Week 5
✅ ✅ ✅ ✅ ✅ ✅ ✅   Week 6
✅ ✅ ✅ ✅ ✅ ✅ ✅   Week 7
✅ ✅ ✅ ✅ 🚫 🚫 🚫   Week 8 (partial/future)
```

**Hover State:**
```
Day: Tuesday, April 1
✅ Completed
Duration: 45 min
Distance: 12 km
Streak: 47 days 🔥
```

**Color Scheme:**
```css
--completed: #10b981 (brand-primary, green)
--completed-hover: #34d399 (brand-light, lighter green)
--rest-day: #94a3b8 (text-secondary, gray)
--missed: #ef4444 (error, red)
--future: #475569 (text-secondary, muted)
```

**Implementation:**
```typescript
import { motion } from 'framer-motion'

export function StreakCalendar({ days }: { days: StreakDay[] }) {
  const weeks = chunk(days, 7)

  return (
    <div className="grid gap-2">
      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="grid grid-cols-7 gap-1">
          {week.map((day, dayIdx) => (
            <motion.button
              key={`${weekIdx}-${dayIdx}`}
              whileHover={{ scale: 1.1 }}
              className={cn(
                'h-12 rounded-lg font-semibold transition-all',
                day.completed && 'bg-brand-primary/20 border-brand-primary/50',
                day.restDay && 'bg-text-secondary/10 border-text-secondary/20',
                day.missed && 'bg-error/10 border-error/30',
                day.future && 'bg-text-muted/5 opacity-50'
              )}
              title={`${day.date}: ${day.minutes}min, ${day.km}km`}
            >
              {day.completed ? (
                <span className="text-lg">✅</span>
              ) : day.restDay ? (
                <span className="text-lg">⏸️</span>
              ) : day.missed ? (
                <span className="text-lg">❌</span>
              ) : (
                <span className="text-xs text-text-muted">{day.dayNum}</span>
              )}
            </motion.button>
          ))}
        </div>
      ))}
    </div>
  )
}
```

**Tests:**
```typescript
// tests/components/streak-calendar.spec.tsx
import { render, screen } from '@testing-library/react'
import { StreakCalendar } from '@/components/fitness/streak-calendar'

describe('StreakCalendar', () => {
  it('renders 56 days', () => {
    const days = Array(56).fill({ completed: true, minutes: 45, km: 5 })
    render(<StreakCalendar days={days} />)
    expect(screen.getAllByRole('button')).toHaveLength(56)
  })

  it('shows green for completed, gray for rest, red for missed', () => {
    // Test color classes applied correctly
  })

  it('is responsive on mobile', () => {
    // Test at 375px viewport
  })
})
```

---

### T19a.2: API Endpoint — GET /api/v1/workouts/streak-history

**Schema:**
```typescript
// workers/api/workouts.ts

type StreakHistoryResponse = {
  current_streak: number
  best_streak: number
  total_completed: number
  next_milestone: 'day_7' | 'day_30' | 'day_100'
  days: Array<{
    date: string  // YYYY-MM-DD
    completed: boolean
    minutes: number
    km: number
    rest_day: boolean
    exercises_count: number
  }>
}

export async function GET_streakHistory(c: Context) {
  const userId = c.get('user_id')
  
  // Get last 56 days of workouts
  const workouts = await db
    .select({
      date: sql`DATE(started_at)`,
      completed: sql`COUNT(*) > 0`,
      minutes: sql`COALESCE(SUM(duration_minutes), 0)`,
      km: sql`COALESCE(SUM(distance_km), 0)`,
    })
    .from(workout_logs)
    .where(
      and(
        eq(workout_logs.user_id, userId),
        gte(workout_logs.started_at, sql`NOW() - INTERVAL 56 days`)
      )
    )
    .groupBy(sql`DATE(started_at)`)
    .orderBy(workout_logs.started_at)

  // Calculate streaks
  const currentStreak = calculateCurrentStreak(workouts)
  const bestStreak = calculateBestStreak(workouts)

  return c.json({
    current_streak: currentStreak,
    best_streak: bestStreak,
    total_completed: workouts.length,
    next_milestone: getNextMilestone(currentStreak),
    days: workouts,
  })
}
```

**Deliverable:** Endpoint 200 OK, returns correct JSON.

---

### T19a.3: Page — /app/progresso/streaks/page.tsx

**Layout:**
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { StreakCalendar } from '@/components/fitness/streak-calendar'
import { DSIcon } from '@/components/ui/ds-icon'

export default function StreaksPage() {
  const { data } = useQuery({
    queryKey: ['streaks'],
    queryFn: () => fetch('/api/v1/workouts/streak-history').then(r => r.json()),
  })

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Sua Sequência 🔥</h1>

      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-text-muted mb-2">Sequência Atual</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-brand-primary">
              {data?.current_streak ?? 0}
            </span>
            <span className="text-sm text-text-muted">dias 🔥</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-text-muted mb-2">Melhor Sequência</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-amber-400">
              {data?.best_streak ?? 0}
            </span>
            <span className="text-sm text-text-muted">dias</span>
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      {data?.next_milestone && (
        <div className="glass-card rounded-2xl border-brand-primary/20 bg-linear-to-br from-brand-primary/8 to-transparent p-4 mb-8">
          <div className="flex items-center gap-3">
            <DSIcon name="target" size={20} className="text-brand-primary" />
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Próximo Marco: {data.next_milestone === 'day_7' ? '7 dias' : data.next_milestone === 'day_30' ? '30 dias' : '100 dias'}
              </p>
              <p className="text-xs text-text-muted">
                {data.current_streak} de {getMilestoneTarget(data.next_milestone)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="glass-card rounded-2xl p-4 mb-8">
        <p className="text-sm font-semibold text-text-primary mb-4">Últimas 8 Semanas</p>
        <StreakCalendar days={data?.days ?? []} />
      </div>

      {/* Legend */}
      <div className="text-center text-xs text-text-muted space-y-1">
        <p>✅ Completo · ⏸️ Descanso · ❌ Faltou</p>
      </div>
    </div>
  )
}
```

**Mobile Responsive:**
```css
/* At 375px: calendar is 7 cols × 8 rows, fits perfectly */
/* At 1024px: keep same layout (mobile-first) */
```

---

### T19a.4: Dashboard Card Link

**In treinos/page.tsx:**
```typescript
<Link href="/progresso/streaks" className="glass-card block rounded-2xl p-4">
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      <DSIcon name="flame" size={16} className="text-brand-primary" />
      <span className="text-[11px] font-bold uppercase text-brand-primary">Sequência</span>
    </div>
    <DSIcon name="chevronRight" size={14} className="text-text-muted" />
  </div>
  <div className="flex items-baseline gap-1">
    <p className="text-2xl font-bold text-text-primary">{streak}</p>
    <p className="text-xs text-text-muted">dias 🔥</p>
  </div>
</Link>
```

---

### T19a.5: Push Notification on Milestone

**In workers/index.ts (cron):**
```typescript
case '0 9 * * *':  // 9 AM daily
  await sendDailyStreakNotifications()
  break
```

**Implementation:**
```typescript
async function sendDailyStreakNotifications() {
  const users = await db
    .select({ id: users.id, current_streak: users.current_streak })
    .from(users)
    .where(eq(users.subscription_plan, 'premium'))

  for (const user of users) {
    const milestones = [7, 30, 100]
    if (milestones.includes(user.current_streak)) {
      await onesignal.notify({
        external_id: user.id,
        title: `🔥 ${user.current_streak} dias de sequência!`,
        message: `Você está arrasando! Continue assim`,
        data: { deeplink: '/progresso/streaks' },
      })
    }
  }
}
```

---

## Phase 19b: Achievements Gallery (1.5 dias)

### T19b.1: SVG Badge Icons

**Replace emojis:**
```typescript
// src/components/fitness/badge-icon.tsx

const BADGE_ICONS = {
  streak_7: (
    <svg viewBox="0 0 100 100">
      {/* Fire icon SVG — 🔥 → SVG */}
      <path d="M50,10 Q60,20 60,40 Q60,60 50,70 Q40,60 40,40 Q40,20 50,10" fill="#f97316" />
    </svg>
  ),
  streak_30: (
    <svg viewBox="0 0 100 100">
      {/* Flex icon SVG — 💪 → SVG */}
      <path d="M40,50 L50,30 L60,50" fill="#8b5cf6" />
    </svg>
  ),
  streak_100: (
    <svg viewBox="0 0 100 100">
      {/* Trophy icon SVG — 🏆 → SVG */}
      <rect x="20" y="60" width="60" height="20" fill="#fbbf24" />
      <polygon points="30,60 50,30 70,60" fill="#fbbf24" />
    </svg>
  ),
  // ... 10+ more badges
}

export function BadgeIcon({ type }: { type: BadgeType }) {
  return <div className="w-16 h-16">{BADGE_ICONS[type]}</div>
}
```

**Rarity tiers (visual):**
```css
/* Bronze */
.badge-bronze {
  filter: drop-shadow(0 0 8px rgba(205, 127, 50, 0.4));
}

/* Silver */
.badge-silver {
  filter: drop-shadow(0 0 12px rgba(192, 192, 192, 0.5));
}

/* Gold */
.badge-gold {
  filter: drop-shadow(0 0 16px rgba(255, 215, 0, 0.6));
}

/* Platinum */
.badge-platinum {
  filter: drop-shadow(0 0 20px rgba(229, 228, 226, 0.8));
}
```

---

### T19b.2: Achievements Page

```typescript
// src/app/(app)/progresso/achievements/page.tsx

export default function AchievementsPage() {
  const { data: earnedBadges } = useQuery({
    queryKey: ['badges', 'earned'],
    queryFn: () => fetch('/api/v1/users/me/badges').then(r => r.json()),
  })

  const allBadges = BADGES // from constants
  const locked = allBadges.filter(b => !earnedBadges?.includes(b.id))

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-2xl font-bold mb-8">Conquistas 🏆</h1>

      {/* Grid 3x4 */}
      <div className="grid grid-cols-3 gap-3">
        {allBadges.map((badge) => {
          const earned = earnedBadges?.includes(badge.id)
          
          return (
            <motion.div
              key={badge.id}
              whileHover={earned ? { scale: 1.05 } : {}}
              className={cn(
                'glass-card rounded-2xl p-4 flex flex-col items-center text-center transition-all',
                earned
                  ? 'border-brand-primary/30 bg-brand-primary/5'
                  : 'border-text-muted/10 opacity-50'
              )}
            >
              <div className="mb-2 h-12 w-12">
                <BadgeIcon type={badge.id} rarity={badge.rarity} />
              </div>
              <p className="text-xs font-bold text-text-primary line-clamp-2">
                {badge.name}
              </p>
              <p className="text-[10px] text-text-muted mt-1">
                {earned
                  ? new Date(badge.earned_at).toLocaleDateString('pt-BR')
                  : badge.unlock_condition}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
```

---

### T19b.3-b.4: API + Animations

**API Endpoint:**
```typescript
// GET /api/v1/badges
// GET /api/v1/users/me/badges

// Returns:
// {
//   id: 'streak_7',
//   name: 'Consistência Iniciante',
//   description: '7 dias consecutivos',
//   rarity: 'bronze',
//   earned_at: '2026-04-01T14:30:00Z'
// }
```

**Unlock Animation:**
```typescript
// On badge unlock (confetti + scale)
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{ type: 'spring', damping: 10, stiffness: 200 }}
>
  <BadgeIcon />
</motion.div>
```

---

## Phase 19c: Social Share (0.5 dias)

### T19c.1: Share Button

```typescript
// In plano/page.tsx or treino-ativo/concluido/page.tsx

<motion.button
  whileTap={{ scale: 0.95 }}
  onClick={handleShare}
  className="glass-card rounded-2xl p-3 flex items-center gap-2"
>
  <DSIcon name="share2" size={16} className="text-brand-primary" />
  <span className="text-sm font-semibold">Compartilhar</span>
</motion.button>
```

**Share Modal:**
```typescript
const handleShare = async () => {
  const code = await generateReferralCode(plan.id)
  const url = `${process.env.NEXT_PUBLIC_URL}/referral/${code}`
  
  // Generate QR code
  const qr = await QRCode.toDataURL(url)
  
  // Share options
  const shareOptions = [
    { name: 'WhatsApp', icon: 'messageCircle', action: () => shareToWhatsApp(url) },
    { name: 'Instagram', icon: 'instagram', action: () => shareToInstagram(qr) },
    { name: 'Twitter', icon: 'twitter', action: () => shareToTwitter(url) },
    { name: 'Copiar Link', icon: 'copy', action: () => copyToClipboard(url) },
  ]
  
  return (
    <Modal>
      <div className="space-y-2">
        {shareOptions.map(opt => (
          <button
            key={opt.name}
            onClick={opt.action}
            className="glass-card w-full p-3 flex items-center gap-3"
          >
            <DSIcon name={opt.icon} />
            {opt.name}
          </button>
        ))}
      </div>
    </Modal>
  )
}
```

---

## Phase 19d: Push Notifications (2 dias)

### T19d.1-d.5: Smart Notification System

**Templates:**
```typescript
const PUSH_TEMPLATES = {
  workout_reminder: {
    title: 'Olá {name}! 💪',
    body: 'Vamos completar seu treino de hoje?',
    deeplink: '/treinos',
    sendTime: '8:00 AM',  // User's timezone
    segmentTarget: 'app: vfit',
  },
  streak_milestone: {
    title: '🔥 {streak} dias de sequência!',
    body: 'Você está arrasando! Parabéns',
    deeplink: '/progresso/streaks',
    sendTime: 'immediate',
  },
  badge_unlock: {
    title: '🏆 Badge Desbloqueado!',
    body: 'Você conquistou: {badge_name}',
    deeplink: '/progresso/achievements',
    sendTime: 'immediate',
  },
  upgrade_prompt: {
    title: 'Parabéns! 3 treinos concluídos',
    body: 'Desbloqueie planos ilimitados com Premium',
    deeplink: '/perfil/assinatura',
    sendTime: 'after_3_workouts',
    segmentTarget: 'is_premium: false AND workouts >= 3',
  },
}
```

**Cron Jobs:**
```typescript
// workers/index.ts

export default {
  async scheduled(event, env, ctx) {
    const cron = event.cron

    switch (cron) {
      case '0 8 * * *':  // 8 AM daily
        ctx.waitUntil(sendWorkoutReminders(env))
        break
      case '0 18 * * *':  // 6 PM daily
        ctx.waitUntil(sendStreakWarnings(env))
        break
      case '*/5 * * * *':  // Every 5 min
        ctx.waitUntil(sendBadgeNotifications(env))
        break
    }
  },
}

async function sendWorkoutReminders(env: Env) {
  const users = await env.DB.prepare(`
    SELECT id, push_enabled, preferred_reminder_time, full_name
    FROM users
    WHERE push_enabled = true
    AND subscription_plan = 'premium'
  `).all()

  for (const user of users.results) {
    await env.ONESIGNAL.notify({
      external_id: user.id,
      title: `Olá ${user.full_name}! 💪`,
      body: 'Vamos completar seu treino de hoje?',
      data: { deeplink: '/treinos' },
    })
  }
}

async function sendStreakWarnings(env: Env) {
  // Check users with 3+ day streak who haven't logged in today
  // Send: "Parabéns! Sua sequência {streak} dias está em risco"
}

async function sendBadgeNotifications(env: Env) {
  // Poll queue for new badges
  // Send immediate notification on unlock
}
```

**OneSignal Tagging:**
```typescript
// When user completes workout
await onesignal.updateUser(userId, {
  tags: {
    'workouts_total': workoutsTotal,
    'current_streak': currentStreak,
    'is_premium': isPremium,
    'last_workout_date': today,
  },
})

// Then segment: 'workouts_total >= 3 AND is_premium == false'
```

**Analytics:**
```typescript
// Track push performance
await analytics.track({
  event: 'push_notification_sent',
  properties: {
    template: 'workout_reminder',
    user_id: userId,
    timestamp: Date.now(),
  },
})

// Track opens
await analytics.track({
  event: 'push_notification_opened',
  properties: {
    template: 'workout_reminder',
    deeplink: '/treinos',
  },
})

// Target: 25%+ open rate, 8%+ conversion rate
```

---

## Summary: S19 Deliverables

| Task | Deliverable | Owner | Days |
|---|---|---|---|
| T19a.1-5 | Streaks calendar + API + page | Dev | 2 |
| T19b.1-4 | Achievements gallery + animations | Dev | 1.5 |
| T19c.1-3 | Social share + referral | Dev | 0.5 |
| T19d.1-5 | Push notification system | Dev | 2 |
| **Total** | **S19 Complete** | **1 Dev** | **5** |

## Metrics

| Métrica | Before | After | Target |
|---|---|---|---|
| Daily Active Users | 1000 | +250 (+25%) | ✅ |
| Workout Completion Rate | 60% | +24pp (+40%) | ✅ |
| Push Open Rate | — | 25%+ | ✅ |
| Badge Unlock Rate | 0% | 35% of users | ✅ |
| Streak > 7 days | 20% | 50% | ✅ |

---

## Acceptance Criteria

- [ ] StreakCalendar renders 56 days correctly
- [ ] Streak API returns accurate data (last 56 days)
- [ ] /progresso/streaks page mobile responsive
- [ ] Achievements gallery shows locked/unlocked
- [ ] Share buttons work (WhatsApp, Instagram, Twitter)
- [ ] Referral links generate and track correctly
- [ ] Push notifications send on schedule
- [ ] OneSignal segments configured
- [ ] Analytics tracking implemented
- [ ] npm run build succeeds
- [ ] Manual QA passed (all flows)

---

**Next:** Sprint S20 kickoff → B2B Analytics
