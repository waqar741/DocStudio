import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: string
  valueDisplay?: boolean
  fullWidth?: boolean
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      description,
      error,
      valueDisplay = true,
      fullWidth = true,
      id,
      disabled,
      min = 0,
      max = 100,
      value,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const generatedId = id || (label ? `slider-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
    
    // Attempt to calculate percentage for the fill track, fallback to 50% if uncontrolled
    const displayValue = value !== undefined ? value : (defaultValue !== undefined ? defaultValue : min)
    const numericValue = Number(displayValue)
    const percentage = Math.max(0, Math.min(100, ((numericValue - Number(min)) / (Number(max) - Number(min))) * 100))

    return (
      <div className={cn('flex flex-col gap-3', fullWidth && 'w-full', className)}>
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={generatedId}
              className={cn(
                'text-sm font-medium leading-none text-[var(--text-primary)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                error && 'text-[var(--color-danger-600)] dark:text-[var(--color-danger-500)]',
              )}
            >
              {label}
            </label>
            {valueDisplay && (
              <span className="text-sm font-semibold text-[var(--color-primary-600)]">
                {displayValue}
              </span>
            )}
          </div>
        )}
        
        <div className="relative flex h-5 w-full items-center">
          <input
            type="range"
            ref={ref}
            id={generatedId}
            disabled={disabled}
            min={min}
            max={max}
            value={value}
            defaultValue={defaultValue}
            className={cn(
              'peer absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none bg-transparent focus:outline-none',
              'disabled:cursor-not-allowed',
              // Style the thumb
              '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--surface-primary)] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--color-primary-500)] [&::-webkit-slider-thumb]:transition-transform',
              '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--surface-primary)] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[var(--color-primary-500)] [&::-moz-range-thumb]:transition-transform',
              'focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-[var(--color-primary-500)] focus-visible:[&::-webkit-slider-thumb]:ring-offset-2',
              'focus-visible:[&::-moz-range-thumb]:ring-2 focus-visible:[&::-moz-range-thumb]:ring-[var(--color-primary-500)] focus-visible:[&::-moz-range-thumb]:ring-offset-2',
            )}
            {...props}
          />
          {/* Custom track styling */}
          <div className="absolute inset-y-0 left-0 z-10 flex w-full items-center">
            <div className="h-1.5 w-full rounded-full bg-[var(--surface-secondary)] border border-[var(--border-secondary)] overflow-hidden">
              <div 
                className={cn(
                  "h-full bg-[var(--color-primary-500)] transition-all duration-75",
                  disabled && "bg-[var(--text-tertiary)]"
                )} 
                style={{ width: `${percentage}%` }}
              />
            </div>
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

Slider.displayName = 'Slider'
