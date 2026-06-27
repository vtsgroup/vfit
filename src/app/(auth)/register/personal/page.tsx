/**
 * src/app/(auth)/register/personal/page.tsx
 *
 * Register Personal — retired. The unified /register page now handles the
 * personal trainer signup inline (CPF + Receita validation, CREF, etc.).
 * This route redirects to /register?role=personal, preserving any query (?ref=).
 */

'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RegisterPersonalRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (!params.has('role')) params.set('role', 'personal')
    router.replace(`/register?${params.toString()}`)
  }, [router, searchParams])

  return null
}
