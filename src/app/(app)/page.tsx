/**
 * src/app/(app)/page.tsx
 *
 * B2C root — redireciona para /treinos (homepage do aluno)
 */

import { redirect } from 'next/navigation'

export default function AppRootPage() {
  redirect('/treinos')
}
