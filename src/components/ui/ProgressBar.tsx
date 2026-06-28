import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number // 0 to 100
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

const colorClasses = {
  primary: 'bg-[var(--color-primary-500)]',
  success: 'bg-[var(--color-success-500)]',
  warning: 'bg-[var(--color-warning-500)]',
  danger: 'bg-[var(--color-danger-500)]',
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value,
      max = 100,
      label,
      showValue = false,
      size = 'md',
      color = 'primary',
      ...props
    },
    ref,
  ) => {
    // Ensure value is bounded between 0 and max
    const boundedValue = Math.min(Math.max(value, 0), max)
    const percentage = Math.round((boundedValue / max) * 100)

    return (
      <div ref={ref} className={cn('flex flex-col gap-2 w-full', className)} {...props}>
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && <span className="font-medium text-[var(--text-primary)]">{label}</span>}
            {showValue && <span className="text-[var(--text-secondary)]">{percentage}%</span>}
          </div>
        )}
        <div 
          className={cn(
            'w-full overflow-hidden rounded-full bg-[var(--surface-secondary)] border border-[var(--border-secondary)]',
            sizeClasses[size]
          )}
          role="progressbar"
          aria-valuenow={boundedValue}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-in-out',
              colorClasses[color]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  },
)

ProgressBar.displayName = 'ProgressBar'
