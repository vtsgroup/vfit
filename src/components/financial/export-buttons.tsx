// ============================================
// export-buttons.tsx — Botões de exportação financeira (PDF/CSV)
// ============================================
//
// O que faz:
//   Exporta relatório financeiro como PDF (pdf-lib) ou CSV.
//   Seletor de período: mês atual, trimestre, ano.
//   PDF inclui sumário de receita, gráfico de barras simplificado e lista de pendências.
//   CSV inclui dados brutos de transações do período.
//
// Exports principais:
//   FinancialExportButtons — botões PDF e CSV com seletor de período
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StyledSelect } from '@/components/ui/styled-select'
import { api } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'
import type {
  FinancialDashboardCharts,
  FinancialDashboardPending,
  FinancialDashboardSummary,
} from '@/hooks/use-financial-dashboard'

type ExportPeriod = 'month' | 'quarter' | 'year'

interface ExportButtonsProps {
  summary?: FinancialDashboardSummary
  chart?: FinancialDashboardCharts
  pending?: FinancialDashboardPending
  disabled?: boolean
}

export function FinancialExportButtons({ summary, chart, pending, disabled }: ExportButtonsProps) {
  const [period, setPeriod] = useState<ExportPeriod>('month')
  const [loadingCsv, setLoadingCsv] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)

  async function handleExportFinancialCsv() {
    try {
      setLoadingCsv(true)
      const response = await api.download('/payments/export', {
        params: { format: 'csv', period },
      })
      await downloadResponse(response, `relatorio-financeiro-${period}.csv`)
    } finally {
      setLoadingCsv(false)
    }
  }

  async function handleExportStudentsCsv() {
    try {
      setLoadingStudents(true)
      const response = await api.download('/students/export', {
        params: { format: 'csv' },
      })
      await downloadResponse(response, 'alunos.csv')
    } finally {
      setLoadingStudents(false)
    }
  }

  async function handleExportPdf() {
    if (!summary || !chart || !pending) return

    try {
      setLoadingPdf(true)
      const file = await buildFinancialPdf(summary, chart, pending, period)
      triggerBlobDownload(file, `relatorio-financeiro-${period}.pdf`)
    } finally {
      setLoadingPdf(false)
    }
  }

  const disabledPdf = disabled || !summary || !chart || !pending

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-light bg-bg-secondary p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <label htmlFor="financial-period" className="text-xs font-medium text-text-muted">
          Período
        </label>
        <StyledSelect
          value={period}
          onChange={(v) => setPeriod(v as ExportPeriod)}
          options={[
            { value: 'month', label: 'Último mês' },
            { value: 'quarter', label: 'Último trimestre' },
            { value: 'year', label: 'Último ano' },
          ]}
          compact
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={handleExportFinancialCsv} loading={loadingCsv} disabled={disabled}>
          Exportar CSV financeiro
        </Button>
        <Button variant="outline" onClick={handleExportStudentsCsv} loading={loadingStudents} disabled={disabled}>
          Exportar CSV alunos
        </Button>
        <Button onClick={handleExportPdf} loading={loadingPdf} disabled={disabledPdf}>
          Exportar PDF
        </Button>
      </div>
    </div>
  )
}

async function downloadResponse(response: Response, fallbackName: string) {
  const blob = await response.blob()
  const contentDisposition = response.headers.get('content-disposition')
  const extractedName = extractFilename(contentDisposition)
  triggerBlobDownload(blob, extractedName || fallbackName)
}

function extractFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null
  const match = contentDisposition.match(/filename=\"?([^\";]+)\"?/i)
  return match?.[1] || null
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(blobUrl)
}

async function buildFinancialPdf(
  summary: FinancialDashboardSummary,
  chart: FinancialDashboardCharts,
  pending: FinancialDashboardPending,
  period: ExportPeriod
): Promise<Blob> {
  const { PDFDocument, StandardFonts } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let y = 810
  page.drawText('Relatório Financeiro — VFIT', { x: 40, y, size: 16, font: fontBold })
  y -= 22
  page.drawText(`Período: ${period} | Gerado em: ${new Date().toLocaleString('pt-BR')}`, { x: 40, y, size: 10, font })
  y -= 18

  const growth = summary.month?.growth_percent ?? 0
  const monthRevenue = summary.month?.current_revenue ?? 0
  const avgTicket = summary.month?.average_ticket ?? 0
  const totalReceived = summary.total_received ?? 0

  const kpis = [
    `Receita mês: ${formatCurrency(monthRevenue)}`,
    `Crescimento: ${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`,
    `Ticket médio: ${formatCurrency(avgTicket)}`,
    `Total recebido: ${formatCurrency(totalReceived)}`,
    `Pendências: ${pending.totals.pending_count} (${formatCurrency(pending.totals.pending_amount)})`,
    `Atrasadas: ${pending.totals.overdue_count} (${formatCurrency(pending.totals.overdue_amount)})`,
  ]

  for (const line of kpis) {
    page.drawText(line, { x: 40, y, size: 10, font })
    y -= 14
  }

  y -= 8
  page.drawText('Top alunos por receita', { x: 40, y, size: 11, font: fontBold })
  y -= 14
  for (const student of (summary.top_students || []).slice(0, 8)) {
    if (y < 60) break
    page.drawText(
      `${student.student_name} • ${student.payments} pag. • ${formatCurrency(student.revenue)}`,
      { x: 40, y, size: 9, font }
    )
    y -= 12
  }

  y -= 8
  page.drawText('Últimos 7 dias (receita)', { x: 40, y, size: 11, font: fontBold })
  y -= 14
  for (const day of (chart.daily_30_days || []).slice(-7)) {
    if (y < 40) break
    page.drawText(`${day.date}: ${formatCurrency(day.revenue)}`, { x: 40, y, size: 9, font })
    y -= 12
  }

  const bytes = await pdfDoc.save()
  const pdfPart = bytes as unknown as BlobPart
  return new Blob([pdfPart], { type: 'application/pdf' })
}
