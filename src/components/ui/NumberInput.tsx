import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label?: string
  description?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      label,
      description,
      error,
      leftIcon,
      rightIcon,
      fullWidth = true,
      id,
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId =
      id ||
      (label
        ? `input-num-${label.replace(/\s+/g, '-').toLowerCase()}`
        : undefined)

    return (
      <div
        className={cn(
          'flex flex-col gap-1.5',
          fullWidth && 'w-full',
          className,
        )}
      >
        {label && (
          <label
            htmlFor={generatedId}
            className={cn(
              'text-sm font-medium leading-none text-[var(--text-primary)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              error &&
                'text-[var(--color-danger-600)] dark:text-[var(--color-danger-500)]',
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-[var(--color-danger-500)]">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-secondary)]">
              {leftIcon}
            </div>
          )}
          <input
            type="number"
            ref={ref}
            id={generatedId}
            disabled={disabled}
            required={required}
            className={cn(
              'flex h-10 w-full rounded-md border border-[var(--border-secondary)] bg-[var(--surface-primary)] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error &&
                'border-[var(--color-danger-500)] focus-visible:ring-[var(--color-danger-500)]',
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-secondary)]">
              {rightIcon}
            </div>
          )}
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

NumberInput.displayName = 'NumberInput'
