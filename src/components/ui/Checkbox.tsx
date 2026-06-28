import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  description?: ReactNode
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      error,
      id,
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = id || (typeof label === 'string' ? `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}` : Math.random().toString(36).substring(7))

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <div className="flex h-5 items-center">
          <input
            type="checkbox"
            ref={ref}
            id={generatedId}
            disabled={disabled}
            required={required}
            className={cn(
              'peer h-4 w-4 shrink-0 rounded-sm border border-[var(--border-secondary)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--color-primary-600)] transition-all cursor-pointer',
              error && 'border-[var(--color-danger-500)] text-[var(--color-danger-600)] focus-visible:ring-[var(--color-danger-500)]',
            )}
            {...props}
          />
        </div>
        {(label || description || error) && (
          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                htmlFor={generatedId}
                className={cn(
                  'text-sm font-medium cursor-pointer text-[var(--text-primary)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70 leading-5',
                  error && 'text-[var(--color-danger-600)] dark:text-[var(--color-danger-500)]',
                )}
              >
                {label}
                {required && <span className="ml-1 text-[var(--color-danger-500)]">*</span>}
              </label>
            )}
            {description && !error && (
              <p className="text-sm text-[var(--text-secondary)] leading-snug">{description}</p>
            )}
            {error && (
              <p className="text-sm font-medium text-[var(--color-danger-600)] dark:text-[var(--color-danger-500)] leading-snug">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    )
  },
)

Checkbox.displayName = 'Checkbox'
