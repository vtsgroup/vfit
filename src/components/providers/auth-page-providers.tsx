'use client'

import { AuthProvider } from './auth-provider'

export function AuthPageProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}