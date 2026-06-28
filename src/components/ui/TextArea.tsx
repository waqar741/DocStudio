import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  error?: string
  fullWidth?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      label,
      description,
      error,
      fullWidth = true,
      id,
      required,
      disabled,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const generatedId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', className)}>
        {label && (
          <label
            htmlFor={generatedId}
            className={cn(
              'text-sm font-medium leading-none text-[var(--text-primary)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              error && 'text-[var(--color-danger-600)] dark:text-[var(--color-danger-500)]',
            )}
          >
            {label}
            {required && <span className="ml-1 text-[var(--color-danger-500)]">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={generatedId}
          disabled={disabled}
          required={required}
          rows={rows}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-[var(--border-secondary)] bg-[var(--surface-primary)] px-3 py-2 text-sm ring-offset-background placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 resize-y',
            error && 'border-[var(--color-danger-500)] focus-visible:ring-[var(--color-danger-500)]',
          )}
          {...props}
        />
        {description && !error && (
          <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        )}
        {error && (
          <p className="text-sm font-medium text-[var(--color-danger-600)] dark:text-[var(--color-danger-500)]">
            {error}
          </p>
        )}
      </div>
    )
  },
)

TextArea.displayName = 'TextArea'
