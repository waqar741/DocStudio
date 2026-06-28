import { forwardRef } from 'react'
import type { SelectHTMLAttributes, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  description?: string
  error?: string
  options: SelectOption[]
  leftIcon?: ReactNode
  fullWidth?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      description,
      error,
      options,
      leftIcon,
      fullWidth = true,
      id,
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)

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
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-secondary)]">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            id={generatedId}
            disabled={disabled}
            required={required}
            className={cn(
              'flex h-10 w-full appearance-none rounded-md border border-[var(--border-secondary)] bg-[var(--surface-primary)] px-3 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 cursor-pointer',
              leftIcon && 'pl-10',
              error && 'border-[var(--color-danger-500)] focus-visible:ring-[var(--color-danger-500)]',
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-secondary)]">
            <ChevronDown size={16} aria-hidden="true" />
          </div>
        </div>
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

Select.displayName = 'Select'
