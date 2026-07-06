import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]',
        primary:
          'border-transparent bg-[var(--color-primary-50)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-200)]',
        success:
          'border-transparent bg-[var(--color-success-50)] text-[var(--color-success-600)] hover:bg-[var(--color-success-100)] dark:text-[var(--color-success-500)]',
        warning:
          'border-transparent bg-[var(--color-warning-50)] text-[var(--color-warning-600)] hover:bg-[var(--color-warning-100)] dark:text-[var(--color-warning-500)]',
        danger:
          'border-transparent bg-[var(--color-danger-50)] text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100)] dark:text-[var(--color-danger-500)]',
        outline: 'text-[var(--text-secondary)] border-[var(--border-primary)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  },
)

Badge.displayName = 'Badge'
