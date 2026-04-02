import { Suspense } from 'react'
import EditarPlanoClientPage from './client-page'

export default function Page() {
  return (
    <Suspense>
      <EditarPlanoClientPage />
    </Suspense>
  )
}
