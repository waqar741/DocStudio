import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

export interface Tab {
  id: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
  fullWidth?: boolean
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    { className, tabs, activeId, onChange, fullWidth = false, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center overflow-x-auto rounded-lg bg-[var(--surface-secondary)] p-1 border border-[var(--border-secondary)]',
          className,
        )}
        role="tablist"
        {...props}
      >
        {tabs.map((tab) => {
          const isActive = activeId === tab.id

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              className={cn(
                'relative flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-1',
                fullWidth && 'flex-1',
                tab.disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer',
                isActive
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 z-0 rounded-md bg-[var(--surface-primary)] shadow-sm border border-[var(--border-primary)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon && (
                  <span
                    className={cn(
                      'h-4 w-4',
                      isActive ? 'text-[var(--color-primary-600)]' : '',
                    )}
                  >
                    {tab.icon}
                  </span>
                )}
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    )
  },
)

Tabs.displayName = 'Tabs'
