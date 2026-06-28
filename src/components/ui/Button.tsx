import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]',
        secondary:
          'bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border-primary)]',
        outline:
          'border border-[var(--color-primary-200)] bg-transparent hover:bg-[var(--color-primary-50)] text-[var(--color-primary-700)]',
        ghost: 'hover:bg-[var(--surface-hover)] text-[var(--text-primary)]',
        danger:
          'bg-[var(--color-danger-50)] text-[var(--color-danger-600)] hover:bg-[var(--color-danger-600)] hover:text-white',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {!isLoading && leftIcon && (
          <span className="mr-2 inline-flex" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="ml-2 inline-flex" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
