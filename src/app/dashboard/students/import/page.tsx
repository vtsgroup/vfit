/**
 * src/app/dashboard/students/import/page.tsx
 *
 * Import Students Page — /dashboard/students/import
 *
 * Exports: ImportStudentsPage
 * Hooks: useState, useCallback, useRef, useRouter, useBatchInviteStudents
 * Features: 'use client' · DSIcon
 */

// ============================================
// Import Students Page — /dashboard/students/import
// Upload CSV/XLSX, preview, edit, batch import
// ============================================

'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DSIcon } from '@/components/ui/ds-icon'
import Papa from 'papaparse'
import { AuthGuard } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StyledSelect } from '@/components/ui/styled-select'
import { cn } from '@/lib/utils'
import { ScrollHint } from '@/components/ui/scroll-hint'
import {
  useBatchInviteStudents,
  type BatchInviteStudent,
  type BatchInviteResult,
} from '@/hooks/use-students'

// ============================================
// Types
// ============================================

interface ImportRow {
  id: string
  full_name: string
  email: string
  phone: string
  student_type: 'personal_training' | 'consultoria'
  valid: boolean
  errors: string[]
  editing?: boolean
}

interface ColumnMapping {
  full_name: number | null
  email: number | null
  phone: number | null
}

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'results'

// ============================================
// Helpers
// ============================================

function generateRowId() {
  return Math.random().toString(36).slice(2, 10)
}

function validateRow(row: ImportRow): ImportRow {
  const errors: string[] = []
  const name = row.full_name.trim()
  const email = row.email.trim().toLowerCase()

  if (!name || name.length < 2) errors.push('Nome obrigatório (mín. 2 caracteres)')
  if (!email) errors.push('Email obrigatório')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email inválido')

  return { ...row, full_name: name, email, valid: errors.length === 0, errors }
}

function normalizeColumnName(col: string): string {
  return col.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').trim()
}

function autoDetectColumn(headers: string[], patterns: string[]): number | null {
  for (let i = 0; i < headers.length; i++) {
    const norm = normalizeColumnName(headers[i])
    if (patterns.some(p => norm.includes(p))) return i
  }
  return null
}

function autoDetectMapping(headers: string[]): ColumnMapping {
  return {
    full_name: autoDetectColumn(headers, ['nome', 'name', 'aluno', 'student', 'fullname', 'nomecompleto']),
    email: autoDetectColumn(headers, ['email', 'mail', 'correio', 'emailaddress']),
    phone: autoDetectColumn(headers, ['telefone', 'phone', 'celular', 'tel', 'whatsapp', 'whats', 'contato', 'fone']),
  }
}

// ============================================
// Component
// ============================================

export default function ImportStudentsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [step, setStep] = useState<ImportStep>('upload')
  const [fileName, setFileName] = useState('')
  const [rawHeaders, setRawHeaders] = useState<string[]>([])
  const [rawData, setRawData] = useState<string[][]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({ full_name: null, email: null, phone: null })
  const [rows, setRows] = useState<ImportRow[]>([])
  const [importResults, setImportResults] = useState<BatchInviteResult[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [parseError, setParseError] = useState('')

  const batchInvite = useBatchInviteStudents()

  // ============================================
  // File Parsing
  // ============================================

  const parseFile = useCallback((file: File) => {
    setParseError('')
    setFileName(file.name)
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
      Papa.parse(file, {
        skipEmptyLines: true,
        complete: (result) => {
          const data = result.data as string[][]
          if (data.length < 2) {
            setParseError('Arquivo vazio ou sem dados suficientes')
            return
          }
          const headers = data[0].map(h => String(h).trim())
          const body = data.slice(1).filter(row => row.some(cell => cell?.trim()))
          setRawHeaders(headers)
          setRawData(body)
          const detected = autoDetectMapping(headers)
          setMapping(detected)
          setStep('mapping')
        },
        error: () => {
          setParseError('Erro ao ler o arquivo CSV. Verifique o formato.')
        },
      })
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const XLSX = await import('xlsx')
          const workbook = XLSX.read(e.target?.result, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })
          const data = jsonData.map(row => (row as unknown[]).map(cell => String(cell ?? '').trim()))

          if (data.length < 2) {
            setParseError('Planilha vazia ou sem dados suficientes')
            return
          }
          const headers = data[0]
          const body = data.slice(1).filter(row => row.some(cell => cell?.trim()))
          setRawHeaders(headers)
          setRawData(body)
          const detected = autoDetectMapping(headers)
          setMapping(detected)
          setStep('mapping')
        } catch {
          setParseError('Erro ao ler a planilha. Verifique o formato.')
        }
      }
      reader.readAsBinaryString(file)
    } else {
      setParseError('Formato não suportado. Use CSV, XLS ou XLSX.')
    }
  }, [])

  // ============================================
  // Drag & Drop
  // ============================================

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) parseFile(file)
  }, [parseFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }, [parseFile])

  // ============================================
  // Apply Mapping → Generate Preview Rows
  // ============================================

  const applyMapping = () => {
    if (mapping.full_name === null && mapping.email === null) {
      setParseError('Selecione pelo menos as colunas de Nome e Email')
      return
    }

    const mapped: ImportRow[] = rawData.map(row => {
      const raw: ImportRow = {
        id: generateRowId(),
        full_name: mapping.full_name !== null ? (row[mapping.full_name] || '') : '',
        email: mapping.email !== null ? (row[mapping.email] || '') : '',
        phone: mapping.phone !== null ? (row[mapping.phone] || '') : '',
        student_type: 'personal_training',
        valid: true,
        errors: [],
      }
      return validateRow(raw)
    })

    setRows(mapped)
    setStep('preview')
  }

  // ============================================
  // Row editing
  // ============================================

  const updateRow = (id: string, field: keyof ImportRow, value: string) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r
      const updated = { ...r, [field]: value }
      return validateRow(updated)
    }))
  }

  const toggleEdit = (id: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, editing: !r.editing } : r))
  }

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id))
  }

  const addRow = () => {
    const newRow = validateRow({
      id: generateRowId(),
      full_name: '',
      email: '',
      phone: '',
      student_type: 'personal_training',
      valid: false,
      errors: [],
    })
    setRows(prev => [...prev, { ...newRow, editing: true }])
  }

  // ============================================
  // Batch Import (in chunks of 10)
  // ============================================

  const validRows = rows.filter(r => r.valid)
  const invalidRows = rows.filter(r => !r.valid)

  const handleImport = async () => {
    if (validRows.length === 0) return
    setStep('importing')

    const CHUNK_SIZE = 10
    const allResults: BatchInviteResult[] = []

    for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
      const chunk = validRows.slice(i, i + CHUNK_SIZE)
      const payload: BatchInviteStudent[] = chunk.map(r => ({
        email: r.email,
        full_name: r.full_name,
        phone: r.phone || undefined,
        student_type: r.student_type,
      }))

      try {
        const result = await batchInvite.mutateAsync(payload)
        allResults.push(...result.results)
      } catch {
        // If entire chunk fails, mark all as error
        allResults.push(...chunk.map(r => ({
          email: r.email,
          full_name: r.full_name,
          status: 'error' as const,
          reason: 'Falha na requisição',
        })))
      }
    }

    setImportResults(allResults)
    setStep('results')
  }

  // ============================================
  // Download template
  // ============================================

  const downloadTemplate = () => {
    const csv = 'Nome Completo,Email,Telefone\nJoão Silva,joao@email.com,11999998888\nMaria Santos,maria@email.com,21988887777\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo-importacao-alunos.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ============================================
  // Reset
  // ============================================

  const reset = () => {
    setStep('upload')
    setFileName('')
    setRawHeaders([])
    setRawData([])
    setMapping({ full_name: null, email: null, phone: null })
    setRows([])
    setImportResults([])
    setParseError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ============================================
  // Render
  // ============================================

  return (
    <AuthGuard requiredType="personal">
      <div className="w-full space-y-6 pb-32">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/students" className="rounded-xl p-2 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-colors">
            <DSIcon name="arrowLeft" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-text-primary sm:text-2xl">Importar Alunos</h2>
            <p className="text-sm text-text-muted">
              Importe sua lista de alunos de qualquer planilha ou app
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {(['upload', 'mapping', 'preview', 'results'] as const).map((s, i) => {
            const labels = ['Upload', 'Colunas', 'Revisar', 'Resultado']
            const isCurrent = step === s || (step === 'importing' && s === 'results')
            const isPast = ['upload', 'mapping', 'preview', 'importing', 'results'].indexOf(step) > i
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className={cn('h-px w-6 sm:w-10', isPast ? 'bg-brand-primary' : 'bg-border-light')} />}
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  isCurrent ? 'bg-brand-primary text-bg-dark' : isPast ? 'bg-brand-primary/20 text-brand-primary' : 'bg-bg-tertiary text-text-muted'
                )}>
                  {isPast ? <DSIcon name="check" size={14} /> : i + 1}
                </div>
                <span className={cn('hidden text-xs font-medium sm:block', isCurrent ? 'text-brand-primary' : 'text-text-muted')}>
                  {labels[i]}
                </span>
              </div>
            )
          })}
        </div>

        {/* ========================= STEP 1: UPLOAD ========================= */}
        {step === 'upload' && (
          <div className="space-y-4">
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all',
                dragActive
                  ? 'border-brand-primary bg-brand-primary/5 scale-[1.01]'
                  : 'border-border-light bg-bg-secondary hover:border-text-muted hover:bg-bg-tertiary'
              )}
            >
              <div className={cn(
                'flex h-16 w-16 items-center justify-center rounded-2xl transition-colors',
                dragActive ? 'bg-brand-primary/20' : 'bg-bg-tertiary'
              )}>
                <DSIcon name="fileSpreadsheet" size={32} className={cn(dragActive ? 'text-brand-primary' : 'text-text-muted')} />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-text-primary">
                  Arraste sua planilha aqui
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  ou clique para selecionar
                </p>
                <p className="mt-3 text-xs text-text-muted">
                  CSV, XLS, XLSX • Exportado de qualquer app ou planilha
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {parseError && (
              <div className="flex items-center gap-2 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
                <DSIcon name="alertCircle" size={16} className="shrink-0" />
                {parseError}
              </div>
            )}

            {/* Template Download */}
            <div className="rounded-2xl border border-border-light bg-bg-secondary p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
                  <DSIcon name="download" className="text-brand-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">Modelo de planilha</p>
                  <p className="mt-0.5 text-sm text-text-muted">
                    Baixe o modelo CSV e preencha com os dados dos seus alunos
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  Baixar modelo
                </Button>
              </div>
            </div>

            {/* Supported formats */}
            <div className="rounded-2xl border border-border-light bg-bg-secondary p-5">
              <p className="text-sm font-semibold text-text-primary mb-3">Apps compatíveis</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['Google Sheets', 'Excel', 'Notion', 'Trello', 'Airtable', 'Apple Numbers', 'Planilhas TOTVS', 'Qualquer CSV'].map(app => (
                  <div key={app} className="flex items-center gap-2 rounded-lg bg-bg-tertiary px-3 py-2 text-xs text-text-secondary">
                    <DSIcon name="checkCircle2" size={14} className="text-brand-primary" />
                    {app}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================= STEP 2: COLUMN MAPPING ========================= */}
        {step === 'mapping' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border-light bg-bg-secondary p-5">
              <div className="flex items-center gap-3 mb-4">
                <DSIcon name="fileSpreadsheet" className="text-brand-primary" />
                <div>
                  <p className="font-semibold text-text-primary">{fileName}</p>
                  <p className="text-xs text-text-muted">{rawData.length} linha(s) encontrada(s)</p>
                </div>
              </div>

              <p className="text-sm text-text-secondary mb-4">
                Identifiquei as colunas automaticamente. Ajuste se necessário:
              </p>

              <div className="space-y-3">
                {[
                  { key: 'full_name' as const, label: 'Nome completo', required: true },
                  { key: 'email' as const, label: 'Email', required: true },
                  { key: 'phone' as const, label: 'Telefone', required: false },
                ].map(field => (
                  <div key={field.key} className="flex items-center gap-3">
                    <div className="w-28 shrink-0">
                      <span className="text-sm font-medium text-text-primary">
                        {field.label}
                        {field.required && <span className="text-error ml-0.5">*</span>}
                      </span>
                    </div>
                    <StyledSelect
                      value={String(mapping[field.key] ?? '')}
                      onChange={(v) => setMapping(prev => ({ ...prev, [field.key]: v === '' ? null : Number(v) }))}
                      options={[
                        { value: '', label: '— Não mapear —' },
                        ...rawHeaders.map((h, i) => ({
                          value: String(i),
                          label: `${h}${rawData[0]?.[i] ? ` (ex: ${rawData[0][i].slice(0, 30)})` : ''}`,
                        })),
                      ]}
                      className="flex-1"
                    />
                    {mapping[field.key] !== null && (
                      <DSIcon name="checkCircle2" size={16} className="shrink-0 text-brand-primary" />
                    )}
                  </div>
                ))}
              </div>

              {parseError && (
                <div className="mt-3 flex items-center gap-2 text-sm text-error">
                  <DSIcon name="alertCircle" size={16} />
                  {parseError}
                </div>
              )}

              {/* Preview first 3 rows */}
              {rawData.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-medium text-text-muted mb-2">Pré-visualização (primeiras 3 linhas):</p>
                  <ScrollHint className="rounded-xl border border-border-light">
                    <table className="w-full min-w-180 text-xs">
                      <thead>
                        <tr className="border-b border-border-light bg-bg-tertiary">
                          {rawHeaders.map((h, i) => (
                            <th key={i} className="px-3 py-2 text-left font-medium text-text-muted whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rawData.slice(0, 3).map((row, ri) => (
                          <tr key={ri} className="border-b border-border-light last:border-0">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-3 py-2 text-text-secondary whitespace-nowrap max-w-50 truncate">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollHint>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={reset}>Voltar</Button>
              <Button onClick={applyMapping} disabled={mapping.full_name === null || mapping.email === null}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* ========================= STEP 3: PREVIEW & EDIT ========================= */}
        {step === 'preview' && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl border border-border-light bg-bg-secondary p-4">
                <div className="flex items-center gap-2">
                  <DSIcon name="users" size={16} className="text-brand-primary" />
                  <span className="text-2xl font-bold text-text-primary">{rows.length}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">Total</p>
              </div>
              <div className="flex-1 rounded-xl border border-border-light bg-bg-secondary p-4">
                <div className="flex items-center gap-2">
                  <DSIcon name="checkCircle2" size={16} className="text-success" />
                  <span className="text-2xl font-bold text-success">{validRows.length}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">Válidos</p>
              </div>
              {invalidRows.length > 0 && (
                <div className="flex-1 rounded-xl border border-error/20 bg-error/5 p-4">
                  <div className="flex items-center gap-2">
                    <DSIcon name="alertCircle" size={16} className="text-error" />
                    <span className="text-2xl font-bold text-error">{invalidRows.length}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">Com erros</p>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-border-light bg-bg-secondary overflow-hidden">
              <ScrollHint>
                <table className="w-full min-w-220 text-sm">
                  <thead>
                    <tr className="border-b border-border-light bg-bg-tertiary">
                      <th className="px-4 py-3 text-left font-medium text-text-muted w-8 whitespace-nowrap">#</th>
                      <th className="min-w-44 px-4 py-3 text-left font-medium text-text-muted whitespace-nowrap">Nome</th>
                      <th className="min-w-52 px-4 py-3 text-left font-medium text-text-muted whitespace-nowrap">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-text-muted hidden sm:table-cell">Telefone</th>
                      <th className="min-w-40 px-4 py-3 text-left font-medium text-text-muted whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-text-muted w-20 whitespace-nowrap">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={row.id} className={cn('border-b border-border-light last:border-0 transition-colors', !row.valid && 'bg-error/5')}>
                        <td className="px-4 py-3 text-text-muted text-xs">{i + 1}</td>
                        <td className="px-4 py-3">
                          {row.editing ? (
                            <input
                              type="text"
                              value={row.full_name}
                              onChange={(e) => updateRow(row.id, 'full_name', e.target.value)}
                              className="w-full rounded-xl border border-border-light bg-bg-dark px-2 py-1 text-sm text-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25 focus:outline-none"
                              placeholder="Nome completo"
                              autoFocus
                            />
                          ) : (
                            <span className="block max-w-44 truncate font-medium text-text-primary">{row.full_name || '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.editing ? (
                            <input
                              type="email"
                              value={row.email}
                              onChange={(e) => updateRow(row.id, 'email', e.target.value)}
                              className="w-full rounded-xl border border-border-light bg-bg-dark px-2 py-1 text-sm text-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25 focus:outline-none"
                              placeholder="email@exemplo.com"
                            />
                          ) : (
                            <span className="block max-w-52 truncate whitespace-nowrap text-text-secondary">{row.email || '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {row.editing ? (
                            <input
                              type="tel"
                              value={row.phone}
                              onChange={(e) => updateRow(row.id, 'phone', e.target.value)}
                              className="w-full rounded-xl border border-border-light bg-bg-dark px-2 py-1 text-sm text-text-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/25 focus:outline-none"
                              placeholder="11999998888"
                            />
                          ) : (
                            <span className="text-text-muted">{row.phone || '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.valid ? (
                            <Badge variant="success">OK</Badge>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              {row.errors.map((err, ei) => (
                                <span key={ei} className="text-xs text-error">{err}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => toggleEdit(row.id)}
                              className="rounded-lg p-1.5 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-colors"
                              title={row.editing ? 'Salvar' : 'Editar'}
                            >
                              {row.editing ? <DSIcon name="check" size={16} className="text-brand-primary" /> : <DSIcon name="edit3" size={16} />}
                            </button>
                            <button
                              onClick={() => removeRow(row.id)}
                              className="rounded-lg p-1.5 text-text-muted hover:bg-error/10 hover:text-error transition-colors"
                              title="Remover"
                            >
                              <DSIcon name="trash2" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollHint>

              {/* Add row */}
              <Button
                variant="outline"
                onClick={addRow}
                className="w-full rounded-none border-x-0 border-b-0"
              >
                <DSIcon name="plus" size={16} />
                Adicionar aluno manualmente
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('mapping')}>Voltar</Button>
              <Button variant="outline" onClick={reset}>Recomeçar</Button>
              <Button
                onClick={handleImport}
                disabled={validRows.length === 0}
                className="flex-1 sm:flex-none"
              >
                <DSIcon name="upload" size={16} />
                Importar {validRows.length} aluno{validRows.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}

        {/* ========================= STEP 4: IMPORTING ========================= */}
        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center gap-6 py-16">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <DSIcon name="loader" size={40} className="text-brand-primary animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary">Importando alunos...</p>
              <p className="mt-1 text-sm text-text-muted">
                Enviando convites em lotes de 10. Isso pode levar alguns segundos.
              </p>
            </div>
          </div>
        )}

        {/* ========================= STEP 5: RESULTS ========================= */}
        {step === 'results' && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-6 text-center">
              <DSIcon name="checkCircle2" size={48} className="text-brand-primary mx-auto mb-3" />
              <p className="text-xl font-bold text-text-primary">Importação concluída!</p>
              <p className="mt-1 text-sm text-text-muted">
                {importResults.filter(r => r.status === 'created').length} aluno(s) importado(s) com sucesso
              </p>
            </div>

            {/* Results table */}
            <div className="rounded-2xl border border-border-light bg-bg-secondary overflow-hidden">
              <ScrollHint>
                <table className="w-full min-w-180 text-sm">
                  <thead>
                    <tr className="border-b border-border-light bg-bg-tertiary">
                      <th className="min-w-44 px-4 py-3 text-left font-medium text-text-muted whitespace-nowrap">Nome</th>
                      <th className="min-w-52 px-4 py-3 text-left font-medium text-text-muted whitespace-nowrap">Email</th>
                      <th className="min-w-40 px-4 py-3 text-left font-medium text-text-muted whitespace-nowrap">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResults.map((r, i) => (
                      <tr key={i} className="border-b border-border-light last:border-0">
                        <td className="px-4 py-3 text-text-primary font-medium">
                          <span className="block max-w-44 truncate">{r.full_name}</span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          <span className="block max-w-52 truncate whitespace-nowrap">{r.email}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {r.status === 'created' && <Badge variant="success">Importado</Badge>}
                          {r.status === 'skipped' && (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="warning">Ignorado</Badge>
                              {r.reason && <span className="text-xs text-text-muted">{r.reason}</span>}
                            </div>
                          )}
                          {r.status === 'error' && (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="error">Erro</Badge>
                              {r.reason && <span className="text-xs text-text-muted">{r.reason}</span>}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollHint>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={reset}>
                Importar mais
              </Button>
              <Button onClick={() => router.push('/dashboard/students')}>
                <DSIcon name="users" size={16} />
                Ver alunos
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
