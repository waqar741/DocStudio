import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface ToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  description?: ReactNode
}

export const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  (
    {
      className,
      label,
      description,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = id || (typeof label === 'string' ? `toggle-${label.replace(/\s+/g, '-').toLowerCase()}` : Math.random().toString(36).substring(7))

    return (
      <div className={cn('flex items-center justify-between gap-4', className)}>
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={generatedId}
                className={cn(
                  'text-sm font-medium cursor-pointer text-[var(--text-primary)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-[var(--text-secondary)]">{description}</p>
            )}
          </div>
        )}
        
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            id={generatedId}
            disabled={disabled}
            {...props}
          />
          <div className={cn(
            "h-6 w-11 rounded-full bg-[var(--surface-secondary)] border border-[var(--border-secondary)] transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-primary-500)] peer-focus:ring-offset-2 peer-focus:ring-offset-background",
            "peer-checked:bg-[var(--color-primary-600)] peer-checked:border-[var(--color-primary-600)]",
            "after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[var(--border-primary)] after:bg-[var(--surface-primary)] after:transition-all",
            "peer-checked:after:translate-x-full peer-checked:after:border-[var(--surface-primary)]",
            disabled && "cursor-not-allowed opacity-50"
          )}></div>
        </label>
      </div>
    )
  },
)

ToggleSwitch.displayName = 'ToggleSwitch'
