import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface RadioOption {
  value: string | number
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

export interface RadioGroupProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> {
  options: RadioOption[]
  label?: ReactNode
  description?: ReactNode
  error?: string
  name: string
  value?: string | number
  defaultValue?: string | number
  onChange?: (value: string | number) => void
  layout?: 'vertical' | 'horizontal'
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      options,
      label,
      description,
      error,
      name,
      value,
      defaultValue,
      onChange,
      layout = 'vertical',
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-3', className)}
        role="radiogroup"
      >
        {(label || description) && (
          <div className="flex flex-col gap-1.5">
            {label && (
              <label
                className={cn(
                  'text-sm font-medium leading-none text-[var(--text-primary)]',
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
            {description && !error && (
              <p className="text-sm text-[var(--text-secondary)]">
                {description}
              </p>
            )}
            {error && (
              <p className="text-sm font-medium text-[var(--color-danger-600)] dark:text-[var(--color-danger-500)]">
                {error}
              </p>
            )}
          </div>
        )}

        <div
          className={cn(
            'flex',
            layout === 'vertical' ? 'flex-col gap-3' : 'flex-wrap gap-6',
          )}
        >
          {options.map((option, index) => {
            const id = `radio-${name}-${option.value}`
            const isChecked =
              value !== undefined ? value === option.value : undefined
            const isDefaultChecked =
              defaultValue !== undefined
                ? defaultValue === option.value
                : undefined

            return (
              <div key={option.value} className="flex items-start gap-3">
                <div className="flex h-5 items-center">
                  <input
                    type="radio"
                    id={id}
                    name={name}
                    value={option.value}
                    checked={isChecked}
                    defaultChecked={isDefaultChecked}
                    onChange={() => onChange?.(option.value)}
                    disabled={disabled || option.disabled}
                    required={required && index === 0} // Only need required on first radio
                    className={cn(
                      'peer h-4 w-4 shrink-0 rounded-full border border-[var(--border-secondary)] bg-transparent text-[var(--color-primary-600)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
                      error &&
                        'border-[var(--color-danger-500)] focus-visible:ring-[var(--color-danger-500)]',
                    )}
                    {...props}
                  />
                </div>
                {(option.label || option.description) && (
                  <div className="grid gap-1.5 leading-none">
                    {option.label && (
                      <label
                        htmlFor={id}
                        className={cn(
                          'text-sm font-medium cursor-pointer text-[var(--text-primary)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70 leading-5',
                        )}
                      >
                        {option.label}
                      </label>
                    )}
                    {option.description && (
                      <p className="text-sm text-[var(--text-secondary)] leading-snug">
                        {option.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)

RadioGroup.displayName = 'RadioGroup'
