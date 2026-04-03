# Sprint 7 — Student Dashboard & Follow-ups

> **Fase:** 2 · **Prioridade:** 🟡 ALTA · **Estimativa:** 8-10h
> **Objetivo:** Dashboard B2C premium com cards de acompanhamento, treino do dia, progresso

---

## 🎯 Problema

1. **Student Dashboard é B2B-oriented** — Quick actions linkam para `/dashboard/*` (rotas do personal)
2. **Dashboard vazio para aluno B2C** — sem treino do dia, sem assessment, sem nutrição
3. **Admin→Student simulation** — admin não vê o app B2C completo
4. **Sem follow-up cards** — aluno não recebe lembretes visuais
5. **Sem streak/progresso** — não motiva retorno ao app

---

## 📋 Tasks

### T7.1 — Dashboard B2C (Home do aluno)
**Arquivo:** `src/app/(app)/treinos/page.tsx` (home do app B2C)

**Layout premium:**
```
┌─────────────────────────────┐
│ Bom dia, Victor! 👋         │
│ Dia 14 · 🔥 Streak: 3 dias  │
├─────────────────────────────┤
│                             │
│ ┌─ TREINO DO DIA ──────┐   │
│ │ 💪 Peito e Tríceps    │   │
│ │ 4 exercícios · 45min  │   │
│ │ [Iniciar Treino]      │   │ ← Button primary com glow
│ └───────────────────────┘   │
│                             │
│ ┌─ FOLLOW-UPS ──────────┐   │
│ │ ⚖️ Peso: 78kg (+0.5)   │   │ ← Card com trend arrow
│ │ 📊 IMC: 24.1 Normal    │   │
│ │ 🎯 Meta: -2kg (75%)    │   │ ← Progress bar
│ │ [Atualizar dados]      │   │
│ └───────────────────────┘   │
│                             │
│ ┌─ NUTRIÇÃO HOJE ───────┐   │
│ │ 🍎 1.200 / 2.100 kcal │   │ ← Circle progress
│ │ Proteína: 65g / 150g   │   │
│ │ [Registrar refeição]   │   │
│ └───────────────────────┘   │
│                             │
│ ┌─ PRÓXIMA AVALIAÇÃO ───┐   │
│ │ 📅 Em 15 dias         │   │
│ │ [Fazer agora]          │   │
│ └───────────────────────┘   │
│                             │
│ ┌─ PROGRESSO ───────────┐   │
│ │ Semana 2 de 4          │   │ ← Week progress bar
│ │ Treinos: 5/12 (42%)    │   │
│ │ [Ver histórico]        │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

### T7.2 — Follow-up Cards Component
**Criar:** `src/components/student/follow-up-cards.tsx`

Cards inteligentes que aparecem baseado no contexto:

```typescript
type FollowUpCard = {
  id: string
  type: 'weight_update' | 'assessment_due' | 'workout_reminder' | 'streak' | 'nutrition_log'
  title: string
  description: string
  action: string // label do botão
  route: string
  priority: number
  icon: DSIconName
  dismissable: boolean
}

function getActiveFollowUps(data: StudentData): FollowUpCard[] {
  const cards: FollowUpCard[] = []

  // 1. Peso não atualizado em 7+ dias
  if (daysSince(data.lastWeightUpdate) > 7) {
    cards.push({
      type: 'weight_update',
      title: 'Atualize seu peso',
      description: `Último registro: ${formatDate(data.lastWeightUpdate)}`,
      action: 'Registrar peso',
      route: '/avaliacoes/peso',
      icon: 'scale',
      priority: 1,
      dismissable: true,
    })
  }

  // 2. Avaliação mensal devida
  if (daysSince(data.lastAssessment) > 30) {
    cards.push({
      type: 'assessment_due',
      title: 'Avaliação mensal',
      description: 'Compare seu progresso',
      action: 'Fazer avaliação',
      route: '/avaliacoes',
      icon: 'clipboard-check',
      priority: 2,
      dismissable: false,
    })
  }

  // 3. Treino não feito hoje (e deveria)
  if (data.isTrainingDay && !data.todayWorkoutDone) {
    cards.push({
      type: 'workout_reminder',
      title: 'Treino pendente!',
      description: `${data.todayWorkout?.name} · ${data.todayWorkout?.duration}min`,
      action: 'Iniciar treino',
      route: '/treinos/hoje',
      icon: 'dumbbell',
      priority: 0,
      dismissable: false,
    })
  }

  // 4. Streak motivacional
  if (data.streak >= 3) {
    cards.push({
      type: 'streak',
      title: `🔥 ${data.streak} dias seguidos!`,
      description: 'Continue assim!',
      action: 'Ver progresso',
      route: '/progresso',
      icon: 'flame',
      priority: 5,
      dismissable: true,
    })
  }

  return cards.sort((a, b) => a.priority - b.priority)
}
```

### T7.3 — Backend: Student dashboard data
**Endpoint:** `GET /api/v1/vfit/dashboard`

```typescript
vfit.get('/dashboard', authMiddleware(), async (c: AppContext) => {
  const user = c.get('user')

  // Buscar dados em paralelo
  const [plan, assessment, nutrition, workoutLogs] = await Promise.all([
    pgQueryOne(c.env, 'SELECT * FROM ai_plans WHERE student_id = $1 AND is_active = TRUE', [user.id]),
    pgQueryOne(c.env, 'SELECT * FROM self_assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [user.id]),
    pgQueryOne(c.env, 'SELECT * FROM nutrition_targets WHERE student_id = $1 AND is_active = TRUE', [user.id]),
    pgQuery(c.env, `
      SELECT * FROM workout_logs
      WHERE student_id = $1 AND created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
    `, [user.id]),
  ])

  // Calcular streak
  const streak = calculateStreak(workoutLogs)

  // Treino do dia
  const todayWorkout = plan ? getTodayWorkout(plan.plan_data) : null

  return success(c, {
    plan: plan ? { id: plan.id, title: plan.title, week: getCurrentWeek(plan) } : null,
    todayWorkout,
    assessment: assessment ? {
      weight_kg: assessment.weight_kg,
      bmi: assessment.bmi,
      bmi_category: assessment.bmi_category,
      last_updated: assessment.created_at,
    } : null,
    nutrition,
    streak,
    workoutsThisWeek: countThisWeek(workoutLogs),
    workoutsTotal: workoutLogs.length,
  })
})
```

### T7.4 — Hook: useStudentDashboard
**Criar:** `src/hooks/use-vfit-dashboard.ts`

```typescript
export function useStudentDashboard() {
  const isReady = useAuthStore(s => s.isAuthenticated && s.isHydrated)
  return useQuery({
    queryKey: ['vfit', 'dashboard'],
    queryFn: () => api.get('/vfit/dashboard').then(r => r.data),
    enabled: isReady,
    ...APP_QUERY_CACHE.REAL_TIME,
  })
}
```

### T7.5 — Fix quick action routes
**Arquivo:** `src/components/student/student-dashboard.tsx`

Rotas B2B (atuais) → B2C (corretas):

| Ação | Rota Atual (B2B) | Rota Correta (B2C) |
|------|:----------------:|:-----------------:|
| Ver treino | `/dashboard/workouts` | `/treinos` |
| Nutrição | `/dashboard/nutrition` | `/nutricao` |
| Avaliações | `/dashboard/assessments` | `/avaliacoes` |
| Perfil | `/dashboard/profile` | `/perfil` |
| IA Chat | `/dashboard/ai-chat` | `/ia` |

### T7.6 — Admin → Student simulation
**Arquivo:** `src/hooks/use-effective-user-view.ts`

Quando admin simula como student, redirecionar para o app B2C completo:

```typescript
// Detectar simulação admin
const isSimulating = useAuthStore(s => s.effectiveUser?.id !== s.user?.id)

// Se admin está simulando student, renderizar B2C layout
if (isSimulating && effectiveUser?.user_type === 'student') {
  // Mostrar banner "Visualizando como: {nome}" 
  // + Render app B2C completo
}
```

### T7.7 — Workout logging (registro de treino)
**Migration + Endpoint para registrar que aluno fez o treino:**

```sql
CREATE TABLE IF NOT EXISTS workout_logs (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES ai_plans(id),
  day_index INTEGER, -- qual dia do plano
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  exercises_completed INTEGER DEFAULT 0,
  exercises_total INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_logs_student ON workout_logs(student_id);
```

### T7.8 — Streak calculation
**Lógica:**

```typescript
function calculateStreak(logs: WorkoutLog[]): number {
  if (!logs.length) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let checkDate = new Date(today)

  // Verificar se treinou hoje ou ontem (para não quebrar no início do dia)
  const hasToday = logs.some(l => isSameDay(new Date(l.created_at), today))
  if (!hasToday) {
    checkDate.setDate(checkDate.getDate() - 1)
    const hasYesterday = logs.some(l => isSameDay(new Date(l.created_at), checkDate))
    if (!hasYesterday) return 0
  }

  while (true) {
    const hasLog = logs.some(l => isSameDay(new Date(l.created_at), checkDate))
    if (!hasLog) break
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  return streak
}
```

---

## ✅ Critérios de Aceite

- [ ] Dashboard B2C mostra treino do dia do plano ativo
- [ ] Follow-up cards aparecem com ações contextuais
- [ ] Streak calculado e exibido
- [ ] Quick actions linkam para rotas B2C corretas
- [ ] Admin pode simular visão B2C completa do student
- [ ] Workout logging funcional (iniciar/completar treino)
- [ ] Progresso semanal visível

---

## 📁 Arquivos Impactados

```
src/app/(app)/treinos/page.tsx — dashboard B2C
src/components/student/follow-up-cards.tsx (NOVO)
src/components/student/workout-today-card.tsx (NOVO)
src/components/student/progress-card.tsx (NOVO)
workers/api/vfit.ts — GET /dashboard
src/hooks/use-vfit-dashboard.ts (NOVO)
src/hooks/use-effective-user-view.ts — fix admin simulation
migrations/hyperdrive/XXXX_create_workout_logs.sql (NOVO)
```
