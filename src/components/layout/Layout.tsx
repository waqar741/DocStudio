import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export const Container = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Container.displayName = 'Container'

export const ContentWrapper = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-8', className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
ContentWrapper.displayName = 'ContentWrapper'

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
}

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, actions, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8', className)} {...props}>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-base text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    )
  },
)
PageHeader.displayName = 'PageHeader'

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
}

export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, description, actions, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4', className)} {...props}>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    )
  },
)
SectionHeader.displayName = 'SectionHeader'
