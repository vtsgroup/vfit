# 04. B2B Analytics & CRM Layer

> **Sprint:** S20 (5 dias)  
> **Impacto:** Increase lifetime value +15%, conversion rate +8%  
> **Data:** 21-25/04/2026

---

## Executive Summary

B2B Dashboard hoje tem stats básicos, mas falta:
- Date range filters (analytics não filtram)
- CRM pipeline (sem visibility de leads)
- Advanced PDF reports
- Calendar sync (Google, Apple)

**S20 Objectives:**
- 📅 Date filters (semana, mês, 90 dias, custom)
- 🔄 CRM pipeline (prospect → paid → retained)
- 📄 PDF reports v2 (formatado, com charts)
- 📆 Calendar sync (Google Calendar)

---

## Phase 20a: Dashboard Filters & Analytics (2 dias)

### T20a.1: Date Range Picker

**Component:**
```typescript
// src/components/dashboard/date-range-picker.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DSIcon } from '@/components/ui/ds-icon'
import { Calendar } from '@/components/ui/calendar'

export function DateRangePicker({
  onDateRangeChange: (from: Date, to: Date) => void,
}) {
  const [range, setRange] = useState<[Date, Date]>([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date(),
  ])
  const [showPicker, setShowPicker] = useState(false)

  const presets = [
    { label: 'Esta Semana', days: 7 },
    { label: 'Este Mês', days: 30 },
    { label: 'Últimos 90 dias', days: 90 },
    { label: 'Últimos 12 meses', days: 365 },
  ]

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPicker(!showPicker)}
          className="gap-2"
        >
          <DSIcon name="calendar" size={16} />
          <span className="text-xs">
            {range[0].toLocaleDateString('pt-BR')} —{' '}
            {range[1].toLocaleDateString('pt-BR')}
          </span>
        </Button>

        {showPicker && (
          <div className="absolute top-full right-0 mt-2 rounded-2xl bg-white shadow-lg p-4 z-50">
            {/* Presets */}
            <div className="mb-4 space-y-1">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    const to = new Date()
                    const from = new Date(Date.now() - p.days * 24 * 60 * 60 * 1000)
                    setRange([from, to])
                    onDateRangeChange(from, to)
                    setShowPicker(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom dates */}
            <div className="border-t pt-4 space-y-2">
              <p className="text-xs font-semibold">Data Personalizada</p>
              <Calendar
                mode="range"
                selected={{ from: range[0], to: range[1] }}
                onSelect={(newRange) => {
                  if (newRange?.from && newRange?.to) {
                    setRange([newRange.from, newRange.to])
                    onDateRangeChange(newRange.from, newRange.to)
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Usage in dashboard/page.tsx:**
```typescript
const [dateRange, setDateRange] = useState<[Date, Date]>([
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  new Date(),
])

const stats = usePersonalStats({
  from: dateRange[0],
  to: dateRange[1],
})

return (
  <>
    <DateRangePicker onDateRangeChange={setDateRange} />
    
    {/* Charts update when dateRange changes */}
    <StatsCard value={stats.revenue} />
    <RevenueAreaChart data={stats.monthlyRevenue} />
  </>
)
```

---

### T20a.2: Student Filter Dropdown

```typescript
// src/components/dashboard/student-filter.tsx

<Select
  value={studentFilter}
  onValueChange={setStudentFilter}
>
  <SelectTrigger className="w-40">
    <SelectValue placeholder="Filtrar alunos" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Todos os alunos</SelectItem>
    <SelectItem value="active">Apenas Ativos</SelectItem>
    <SelectItem value="inactive">Apenas Inativos</SelectItem>
    <SelectItem value="overdue">Com Pagamento Atrasado</SelectItem>
    <SelectItem value="premium">Premium</SelectItem>
  </SelectContent>
</Select>

// API call with filter:
const stats = usePersonalStats({
  from: dateRange[0],
  to: dateRange[1],
  student_status: studentFilter,
})
```

---

### T20a.3: New KPI — Ticket Médio

```typescript
// Widget in dashboard stats grid

<StatsCard
  title="Ticket Médio"
  value={`R$ ${(totalRevenue / paymentCount).toFixed(2)}`}
  icon="dollarSign"
  color="success"
  description={`${paymentCount} pagamentos`}
/>
```

**Backend calculation:**
```typescript
const ticketMedio = totalRevenue / paymentCount
const trend = ticketMedioMonth1 > ticketMedioMonth0 ? '+' : '-'
const percent = Math.abs(((ticketMedioMonth1 - ticketMedioMonth0) / ticketMedioMonth0) * 100)
```

---

### T20a.4: Revenue Breakdown Chart

```typescript
// src/components/dashboard/revenue-breakdown-chart.tsx

const RevenueBreakdownChart = ({ data }) => {
  return (
    <GlassCard>
      <h3 className="text-sm font-semibold mb-4">Receita por Plano</h3>
      <PieChart
        data={[
          { name: 'Trial', value: data.trial, color: '#94a3b8' },
          { name: 'Pro', value: data.pro, color: '#3b82f6' },
          { name: 'Profissional', value: data.profissional, color: '#8b5cf6' },
          { name: 'Max', value: data.max, color: '#f59e0b' },
        ]}
      />
    </GlassCard>
  )
}

// Data from:
// SELECT plan_name, SUM(amount) as total
// FROM payments
// WHERE status = 'paid' AND date BETWEEN ? AND ?
// GROUP BY plan_name
```

---

### T20a.5: Trend Analysis

```typescript
// Card showing MoM growth

<StatsCard
  title="Crescimento"
  value={`↑ ${growthPercent}%`}
  icon="trendingUp"
  color={growthPercent > 0 ? 'success' : 'error'}
  description="vs. mês anterior"
/>

// Calculation:
const thisMonthRevenue = stats.revenue
const lastMonthRevenue = statsLastMonth.revenue
const growth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
```

---

## Phase 20b: CRM Light Pipeline (2 dias)

### T20b.1: Pipeline Page

```typescript
// src/app/dashboard/pipeline/page.tsx

'use client'

import { useQuery } from '@tanstack/react-query'
import { DSIcon } from '@/components/ui/ds-icon'
import { Button } from '@/components/ui/button'

const PIPELINE_STAGES = [
  { id: 'prospect', label: 'Prospect', color: '#64748b' },
  { id: 'engaged', label: 'Engajado', color: '#3b82f6' },
  { id: 'trial', label: 'Trial Ativo', color: '#f59e0b' },
  { id: 'paid', label: 'Pagante', color: '#10b981' },
  { id: 'retained', label: 'Retido', color: '#8b5cf6' },
]

export default function PipelinePage() {
  const { data: pipeline } = useQuery({
    queryKey: ['pipeline'],
    queryFn: () => fetch('/api/v1/crm/pipeline').then(r => r.json()),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pipeline de Alunos</h1>

      {/* Pipeline visualization — Vertical stacked bar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {PIPELINE_STAGES.map((stage) => {
          const data = pipeline?.[stage.id] || { count: 0, revenue: 0 }

          return (
            <div
              key={stage.id}
              className="glass-card rounded-2xl p-4 border-l-4"
              style={{ borderColor: stage.color }}
            >
              <p className="text-xs text-text-muted mb-2 uppercase font-bold">
                {stage.label}
              </p>
              <p className="text-2xl font-bold text-text-primary mb-1">
                {data.count}
              </p>
              <p className="text-xs text-text-muted mb-4">
                R$ {(data.revenue / 1000).toFixed(1)}k
              </p>

              {/* Quick actions */}
              <Button
                size="xs"
                variant="outline"
                className="w-full"
                onClick={() => openStageDetail(stage.id)}
              >
                Ver Detalhes
              </Button>
            </div>
          )
        })}
      </div>

      {/* Stage detail cards */}
      {selectedStage && (
        <div className="space-y-3">
          {pipelineDetails[selectedStage]?.map((student) => (
            <div
              key={student.id}
              className="glass-card rounded-2xl p-4 flex items-start justify-between"
            >
              <div className="flex-1">
                <p className="font-semibold text-text-primary">{student.name}</p>
                <p className="text-xs text-text-muted mt-1">
                  {student.workouts} treinos · {student.lastActivity} atrás
                </p>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => openWhatsApp(student.phone)}
                >
                  <DSIcon name="messageCircle" size={14} />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => openEmail(student.email)}
                >
                  <DSIcon name="mail" size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### T20b.2: API Endpoint

```typescript
// workers/api/crm.ts

export async function GET_pipeline(c: Context) {
  const personalId = c.get('user_id')

  const pipeline = await db
    .select({
      status: users.status,  // 'prospect' | 'engaged' | 'trial' | 'paid' | 'retained'
      count: sql`COUNT(*)`,
      revenue: sql`COALESCE(SUM(payments.amount), 0)`,
    })
    .from(users)
    .leftJoin(payments, eq(users.id, payments.user_id))
    .where(eq(users.personal_id, personalId))
    .groupBy(users.status)

  return c.json(pipeline)
}

// Helper function to auto-assign status:
function getUserStatus(user: User, lastWorkout?: Date): string {
  if (!user.created_at) return 'prospect'

  const daysSinceSignup = Math.floor(
    (Date.now() - user.created_at.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceSignup < 7 && !lastWorkout) return 'prospect'
  if (lastWorkout && new Date(lastWorkout).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000) {
    return 'engaged'
  }
  if (user.subscription_plan === 'trial') return 'trial'
  if (user.subscription_plan !== 'free' && user.subscription_plan !== 'trial') return 'paid'
  if (user.subscription_plan !== 'free' && lastWorkout && new Date(lastWorkout).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000) {
    return 'retained'
  }

  return 'prospect'
}
```

---

### T20b.3: Quick Actions Menu

```typescript
// In each student card:

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm">
      <DSIcon name="moreHorizontal" size={16} />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => sendWhatsApp(student)}>
      <DSIcon name="messageCircle" size={14} className="mr-2" />
      Enviar WhatsApp
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => sendEmail(student)}>
      <DSIcon name="mail" size={14} className="mr-2" />
      Enviar E-mail
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => offerUpgrade(student)}>
      <DSIcon name="zap" size={14} className="mr-2" />
      Oferecer Upgrade
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem
      onClick={() => checkHealth(student)}
      className="text-amber-600"
    >
      <DSIcon name="alertCircle" size={14} className="mr-2" />
      Verificar Saúde
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Phase 20c: Enhanced PDF Reports (1 dia)

### T20c.1: PDF Generation

```typescript
// src/lib/pdf-generator.ts

import { PDFDocument, rgb } from 'pdf-lib'
import { generateChartImage } from './chart-to-image'

export async function generateReportPDF(data: ReportData) {
  const doc = PDFDocument.create()
  const page = doc.addPage([595, 842])  // A4
  
  // Header
  page.drawText('Relatório de Atividades', {
    x: 50,
    y: 750,
    size: 24,
    color: rgb(16, 185, 129),
    font: pdfFont,
  })

  page.drawText(`Período: ${data.from} a ${data.to}`, {
    x: 50,
    y: 720,
    size: 12,
    color: rgb(100, 100, 100),
  })

  // Section 1: Summary Stats
  let y = 680
  page.drawText('Resumo', { x: 50, y, size: 14, color: rgb(0, 0, 0) })
  y -= 30

  const stats = [
    { label: 'Alunos Ativos', value: data.activeStudents },
    { label: 'Receita Total', value: `R$ ${data.totalRevenue}` },
    { label: 'Treinos Completos', value: data.workoutsCompleted },
  ]

  stats.forEach((stat) => {
    page.drawText(`${stat.label}: ${stat.value}`, {
      x: 70,
      y,
      size: 11,
    })
    y -= 20
  })

  // Section 2: Charts as images
  y -= 20
  page.drawText('Gráficos', { x: 50, y, size: 14 })
  y -= 20

  const chartImage = await generateChartImage(data.monthlyRevenue)
  page.drawImage(chartImage, { x: 50, y: y - 150, width: 495, height: 150 })
  y -= 180

  // Section 3: Transactions table
  y -= 20
  page.drawText('Transações', { x: 50, y, size: 14 })
  y -= 20

  // Simple table
  const tableData = data.transactions.slice(0, 10)
  tableData.forEach((tx) => {
    page.drawText(`${tx.date} | ${tx.student} | R$ ${tx.amount}`, {
      x: 70,
      y,
      size: 9,
    })
    y -= 15
  })

  // Footer
  page.drawText('Gerado via VFIT Admin', {
    x: 50,
    y: 30,
    size: 8,
    color: rgb(150, 150, 150),
  })

  return doc.save()
}
```

---

### T20c.2: Download Button

```typescript
// In dashboard/page.tsx

<Button
  onClick={async () => {
    const pdf = await generateReportPDF({
      from: dateRange[0],
      to: dateRange[1],
      ...stats,
    })
    
    const blob = await pdf
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${Date.now()}.pdf`
    a.click()
  }}
  className="gap-2"
>
  <DSIcon name="download" size={16} />
  Baixar Relatório
</Button>
```

---

## Phase 20d: Calendar Sync (Bonus — if time)

**Google Calendar Integration:**
```typescript
// src/lib/google-calendar.ts

export async function syncToGoogleCalendar(personalData: PersonalData) {
  const client = google.calendar({ version: 'v3', auth: getAuthClient() })

  const events = personalData.students.map((student) => ({
    summary: `Revisão de Aluno: ${student.name}`,
    description: `Treinos: ${student.workoutCount}`,
    start: { dateTime: new Date().toISOString() },
    end: { dateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString() },
  }))

  for (const event of events) {
    await client.events.insert({
      calendarId: 'primary',
      requestBody: event,
    })
  }
}
```

---

## Summary: S20 Deliverables

| Task | Deliverable | Owner | Days |
|---|---|---|---|
| T20a.1-5 | Dashboard filters + KPIs + trends | Dev | 2 |
| T20b.1-3 | CRM pipeline + student detail | Dev | 2 |
| T20c.1-2 | Enhanced PDF reports | Dev | 1 |
| **Total** | **S20 Complete** | **1 Dev** | **5** |

## Metrics

| Métrica | Before | After | Improvement |
|---|---|---|---|
| Dashboard Filters | ❌ | ✅ | 100% |
| CRM Pipeline Visibility | ❌ | ✅ | 100% |
| PDF Report Quality | Basic | Professional | +200% |
| Lifetime Value (via better analytics) | Baseline | +15% | ✅ |

---

## Acceptance Criteria

- [ ] Date range picker functional
- [ ] All charts re-render on filter change
- [ ] Pipeline page shows 5 stages with student counts
- [ ] PDF reports generate without error
- [ ] Charts render as images in PDF
- [ ] Table data visible in PDF (max 10 rows)
- [ ] Download button works (auto-downloads PDF)
- [ ] Mobile responsive (dashboard filters on small screens)
- [ ] npm run build succeeds
- [ ] Manual QA passed (all flows)

---

**Next:** Sprint S21 kickoff → Backend Robustness
