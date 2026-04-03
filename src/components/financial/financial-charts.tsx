// ============================================
// financial-charts.tsx — Gráficos financeiros (receita e métodos de pagamento)
// ============================================
//
// O que faz:
//   RevenueComboChart: gráfico combinado (barras + linha) de receita vs meta mensal.
//   MethodPieChart: pizza de distribuição por método de pagamento (boleto, pix, cartão).
//   Usa Recharts (ResponsiveContainer, ComposedChart, PieChart).
//
// Exports principais:
//   RevenueComboChart — gráfico combinado receita/meta
//   MethodPieChart — pizza de métodos de pagamento
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export function RevenueComboChart({
  daily,
  monthly,
}: {
  daily: Array<{ date: string; revenue: number }>
  monthly: Array<{ month: string; revenue: number }>
}) {
  const dailyCompact = daily.map((d) => ({
    label: d.date.slice(5),
    receita_diaria: d.revenue,
  }))

  const monthlyCompact = monthly.map((m) => ({
    label: m.month.slice(2),
    receita_mensal: m.revenue,
  }))

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Receita diária (30 dias)</CardTitle>
        </CardHeader>
        <CardContent className="h-70">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyCompact}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="receita_diaria" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="receita_diaria" stroke="#16a34a" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receita mensal (12 meses)</CardTitle>
        </CardHeader>
        <CardContent className="h-70">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyCompact}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="receita_mensal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="receita_mensal" stroke="#1d4ed8" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export function MethodPieChart({
  byMethod,
}: {
  byMethod: Array<{ payment_method: string; amount: number; count: number }>
}) {
  const data = byMethod.map((m) => ({
    name: normalizeMethod(m.payment_method),
    value: m.amount,
    count: m.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita por método de pagamento</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="h-65">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between rounded-lg border border-border-light bg-bg-secondary px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm text-text-primary">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-text-primary">R$ {item.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function normalizeMethod(method: string) {
  if (method === 'pix') return 'PIX'
  if (method === 'credit_card') return 'Cartão'
  if (method === 'boleto') return 'Boleto'
  return method
}
