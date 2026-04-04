# Sprint 8 — OneSignal B2C + Push Notifications

> **Fase:** 3 · **Prioridade:** 🟡 ALTA · **Estimativa:** 4-6h
> **Objetivo:** Push notifications funcionando para alunos B2C + In-app follow-up cards

---

## 🎯 Problema

1. **OneSignalProvider APENAS no dashboard (B2B)** — alunos B2C não recebem push
2. **App B2C (`(app)` layout) sem provider** — SDK não inicializa
3. **Sem tags B2C** — notificações não segmentam por tipo de aluno
4. **Sem notificações contextuais** — lembrete de treino, peso, avaliação
5. **Sem in-app notifications** — follow-up cards só aparecem no dashboard

---

## 📋 Tasks

### T8.1 — Adicionar OneSignalProvider ao layout (app)
**Arquivo:** `src/app/(app)/layout.tsx`

```tsx
import { OneSignalProvider } from '@/components/providers/onesignal-provider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <OneSignalProvider>
        <StudentHeader />
        <main className="pb-20"> {/* espaço para bottom nav */}
          {children}
        </main>
        <BottomNavigation />
      </OneSignalProvider>
    </AppProviders>
  )
}
```

### T8.2 — Tags B2C no OneSignal
**Arquivo:** `src/components/providers/onesignal-provider.tsx`

Adicionar tags quando aluno B2C se registrar:

```typescript
// Dentro do useEffect de init:
if (user?.user_type === 'student') {
  OneSignal.User.addTags({
    user_type: 'student_b2c',
    plan: user.subscription_plan || 'free',
    goal: user.goal || '',
    has_active_plan: activePlan ? 'true' : 'false',
    onboarding_completed: user.onboarding_completed ? 'true' : 'false',
  })
}
```

### T8.3 — Backend: Push de lembrete de treino
**Arquivo:** `lib/notification-events.ts`

```typescript
export async function notifyWorkoutReminder(env: Bindings, params: {
  userId: string
  workoutName: string
  dayOfWeek: string
}) {
  return notify(env, {
    filters: [
      { field: 'tag', key: 'user_id', value: params.userId },
    ],
    headings: { en: '💪 Hora do treino!' },
    contents: { en: `${params.workoutName} te espera hoje. Bora?` },
    url: 'https://vfit.app.br/treinos',
    data: { type: 'workout_reminder' },
  })
}

export async function notifyWeightReminder(env: Bindings, params: {
  userId: string
  daysSinceLastUpdate: number
}) {
  return notify(env, {
    filters: [
      { field: 'tag', key: 'user_id', value: params.userId },
    ],
    headings: { en: '⚖️ Atualize seu peso' },
    contents: { en: `Faz ${params.daysSinceLastUpdate} dias desde o último registro. Mantenha seu progresso!` },
    url: 'https://vfit.app.br/avaliacoes',
    data: { type: 'weight_reminder' },
  })
}

export async function notifyAssessmentDue(env: Bindings, params: {
  userId: string
}) {
  return notify(env, {
    filters: [
      { field: 'tag', key: 'user_id', value: params.userId },
    ],
    headings: { en: '📊 Avaliação mensal disponível' },
    contents: { en: 'Compare seu progresso! Faça sua avaliação mensal.' },
    url: 'https://vfit.app.br/avaliacoes',
    data: { type: 'assessment_reminder' },
  })
}
```

### T8.4 — Cron: Enviar push diários
**Nota:** CF Workers Free Plan não tem Cron Triggers. Alternativa:

```typescript
// Endpoint chamado por uptimerobot/external cron a cada 8h:
// GET /api/v1/cron/student-reminders?key=CRON_SECRET

vfit.get('/cron/student-reminders', async (c: AppContext) => {
  const key = c.req.query('key')
  if (key !== c.env.CRON_SECRET) throw new UnauthorizedError()

  // 1. Buscar alunos com treino hoje e que não treinaram
  const needsReminder = await pgQuery(c.env, `
    SELECT s.id, s.full_name, ap.plan_data
    FROM students s
    JOIN ai_plans ap ON ap.student_id = s.id AND ap.is_active = TRUE
    LEFT JOIN workout_logs wl ON wl.student_id = s.id
      AND wl.created_at > CURRENT_DATE
    WHERE wl.id IS NULL
      AND s.onboarding_completed = TRUE
  `)

  // 2. Enviar push para cada um
  for (const student of needsReminder) {
    await notifyWorkoutReminder(c.env, {
      userId: student.id,
      workoutName: getTodayWorkoutName(student.plan_data),
      dayOfWeek: getDayName(),
    }).catch(() => {})
  }

  return success(c, { reminded: needsReminder.length })
})
```

### T8.5 — In-App notification bell
**Arquivo:** `src/components/layout/student-header.tsx` (Sprint 1)

Adicionar bell icon com badge de notificações unread:

```tsx
<div className="relative">
  <DSIcon name="bell" size={20} className="text-secondary" />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full
      bg-error text-[10px] font-bold text-white flex items-center justify-center">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</div>
```

### T8.6 — Permission prompt elegante
**Não usar o prompt nativo do browser** — Usar tela customizada:

```
┌─────────────────────────────┐
│                             │
│    🔔                       │
│                             │
│  Ative as notificações      │
│  para não perder seus       │
│  treinos!                   │
│                             │
│  ✓ Lembrete de treino       │
│  ✓ Acompanhamento de peso   │
│  ✓ Resultados de avaliação  │
│                             │
│  [Ativar notificações]      │ ← Button primary
│  [Agora não]                │ ← Ghost
│                             │
└─────────────────────────────┘
```

**Arquivo:** `src/app/(onboarding)/onboarding/notifications/page.tsx` (já existe!)
Verificar se está funcional e com design navy/premium.

---

## ✅ Critérios de Aceite

- [ ] OneSignalProvider presente no layout (app) B2C
- [ ] Tags B2C setadas (user_type, plan, goal)
- [ ] Push de lembrete de treino funcional
- [ ] Push de lembrete de peso (7+ dias sem atualizar)
- [ ] Bell icon no header com badge
- [ ] Notificações respeitam best-effort (nunca falham o endpoint)
- [ ] Permission prompt customizado no onboarding

---

## 📁 Arquivos Impactados

```
src/app/(app)/layout.tsx — adicionar OneSignalProvider
src/components/providers/onesignal-provider.tsx — tags B2C
lib/notification-events.ts — funções de push B2C
workers/api/vfit.ts — cron endpoint
src/components/layout/student-header.tsx — bell icon
src/app/(onboarding)/onboarding/notifications/page.tsx — redesign
```

---

## ⚠️ Dependências

- **Sprint 1 (T1.1):** StudentHeader precisa existir para o bell
- **Sprint 6 (T6):** Plano ativo no DB para saber "treino do dia"
- **OneSignal App ID:** `3043de4e-d7aa-4fa1-a61b-5abea28d2f47` (já configurado)
