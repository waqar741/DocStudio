import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-dvh items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-xl p-8 text-center shadow-lg"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
              <AlertTriangle
                size={28}
                className="text-red-500"
                aria-hidden="true"
              />
            </div>
            <h2
              className="mb-2 text-xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Something went wrong
            </h2>
            <p
              className="mb-6 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-700)]"
              aria-label="Try again"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
