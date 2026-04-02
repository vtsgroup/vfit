/**
 * src/app/dashboard/calendar/page.tsx
 *
 * Calendar (Agenda) — MVP ultra moderno
 *
 * Exports: CalendarPage
 * Features: 'use client'
 */

// ============================================
// Calendar (Agenda) — MVP ultra moderno
// Weekly / Daily toggle + modal detalhes
// ============================================

'use client'

import { AuthGuard } from '@/components/auth'
import { CalendarWeekly } from '@/components/calendar'

export default function CalendarPage() {
  return (
    <AuthGuard>
      <CalendarWeekly />
    </AuthGuard>
  )
}
