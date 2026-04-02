/**
 * src/app/dashboard/payments/view/page.tsx
 *
 * Payment View — static route with ?id=
 *
 * Exports: PaymentViewPage
 * Hooks: useSearchParams
 * Features: 'use client'
 */

// ============================================
// Payment View — static route with ?id=
// ============================================

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PaymentDetailSkeleton } from '@/components/ui/page-skeletons'
import PaymentDetailClient from '@/components/payments/payment-detail'

function PaymentViewInner() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  return <PaymentDetailClient id={id} />
}

export default function PaymentViewPage() {
  return (
    <Suspense fallback={<PaymentDetailSkeleton />}>
      <PaymentViewInner />
    </Suspense>
  )
}
