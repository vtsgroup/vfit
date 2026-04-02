/**
 * src/components/ui/error-boundary.tsx
 *
 * Sprint 38 — Error Boundary com UI de fallback mobile-first
 */

'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-75 flex-col items-center justify-center gap-4 px-6 py-12">
          <span className="text-5xl">😵</span>
          <h2 className="text-lg font-bold text-text-primary">
            Algo deu errado
          </h2>
          <p className="text-center text-sm text-text-secondary">
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="max-w-full overflow-auto rounded-lg bg-bg-secondary p-3 text-xs text-error">
              {this.state.error.message}
            </pre>
          )}
          <Button variant="outline" size="sm" onClick={this.handleReset}>
            Tentar Novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
