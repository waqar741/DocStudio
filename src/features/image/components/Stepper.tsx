import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface Step {
  id: string
  title: string
  description?: string
}

export interface StepperProps {
  steps: Step[]
  currentStepIndex: number
  className?: string
}

export function Stepper({ steps, currentStepIndex, className }: StepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isLast = index === steps.length - 1

          return (
            <li
              key={step.id}
              className={cn(
                'flex w-full items-center',
                !isLast &&
                  "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block",
                isCompleted
                  ? 'after:border-[var(--color-primary-500)]'
                  : 'after:border-[var(--border-secondary)]',
              )}
            >
              <div className="relative flex flex-col items-center justify-center">
                <span
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full shrink-0 border-2 font-medium text-sm transition-colors',
                    isCompleted
                      ? 'bg-[var(--color-primary-500)] border-[var(--color-primary-500)] text-white'
                      : isCurrent
                        ? 'bg-[var(--surface-primary)] border-[var(--color-primary-500)] text-[var(--color-primary-600)]'
                        : 'bg-[var(--surface-secondary)] border-[var(--border-secondary)] text-[var(--text-secondary)]',
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Desktop label below the step circle */}
                <div className="absolute top-10 w-32 text-center hidden md:block">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      isCurrent || isCompleted
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)]',
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {/* Mobile Label */}
      <div className="mt-4 md:hidden text-center">
        <p className="text-sm font-medium text-[var(--color-primary-600)]">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
        <p className="text-base font-semibold text-[var(--text-primary)]">
          {steps[currentStepIndex]?.title}
        </p>
        {steps[currentStepIndex]?.description && (
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {steps[currentStepIndex]?.description}
          </p>
        )}
      </div>
    </div>
  )
}
