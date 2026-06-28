import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-secondary)] bg-[var(--surface-secondary)] p-8 text-center sm:p-12',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-primary)] border border-[var(--border-primary)] shadow-sm text-[var(--text-secondary)]">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            {description}
          </p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'
