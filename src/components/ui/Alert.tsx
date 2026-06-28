import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 flex gap-3',
  {
    variants: {
      variant: {
        default: 'bg-[var(--surface-secondary)] border-[var(--border-secondary)] text-[var(--text-primary)]',
        info: 'bg-[var(--color-primary-50)] border-[var(--color-primary-200)] text-[var(--color-primary-900)] dark:bg-[var(--color-primary-900)] dark:border-[var(--color-primary-800)] dark:text-[var(--color-primary-100)]',
        success: 'bg-[var(--color-success-50)] border-[var(--color-success-200)] text-[var(--color-success-700)] dark:bg-[#062c1d] dark:border-[var(--color-success-800)] dark:text-[var(--color-success-100)]',
        warning: 'bg-[var(--color-warning-50)] border-[var(--color-warning-200)] text-[var(--color-warning-700)] dark:bg-[#331c00] dark:border-[var(--color-warning-800)] dark:text-[var(--color-warning-100)]',
        danger: 'bg-[var(--color-danger-50)] border-[var(--color-danger-200)] text-[var(--color-danger-700)] dark:bg-[#3a0a0a] dark:border-[var(--color-danger-800)] dark:text-[var(--color-danger-100)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const icons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
}

const iconColorClass = {
  default: 'text-[var(--text-secondary)]',
  info: 'text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]',
  success: 'text-[var(--color-success-600)] dark:text-[var(--color-success-500)]',
  warning: 'text-[var(--color-warning-600)] dark:text-[var(--color-warning-500)]',
  danger: 'text-[var(--color-danger-600)] dark:text-[var(--color-danger-500)]',
}

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, children, ...props }, ref) => {
    const Icon = icons[variant || 'default']

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColorClass[variant || 'default'])} />
        <div className="flex flex-col gap-1">
          {title && (
            <h5 className="font-semibold leading-none tracking-tight">
              {title}
            </h5>
          )}
          <div className="text-sm opacity-90 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    )
  },
)

Alert.displayName = 'Alert'
