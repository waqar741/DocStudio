import { Link } from 'react-router-dom'
import { Home, FileQuestion } from 'lucide-react'
import { ROUTES } from '@/constants'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center p-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-warning-50)]">
          <FileQuestion
            size={40}
            className="text-[var(--color-warning-500)]"
            aria-hidden="true"
          />
        </div>
        <h2
          className="mb-2 text-4xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          404
        </h2>
        <p
          className="mb-8 text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          to={ROUTES.DASHBOARD}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <Home size={16} aria-hidden="true" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
