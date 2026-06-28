import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export interface BreadcrumbItem {
  label: ReactNode
  href?: string
  icon?: ReactNode
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <nav ref={ref} aria-label="Breadcrumb" className={cn('flex', className)} {...props}>
        <ol className="flex items-center space-x-2 sm:space-x-3 text-sm">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            const itemClasses = "flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-1 rounded-sm"
            
            return (
              <li key={index} className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className={cn(itemClasses, 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium')}
                  >
                    {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(itemClasses, isLast ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-tertiary)]')}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
                    {item.label}
                  </span>
                )}
                
                {!isLast && (
                  <ChevronRight 
                    className="ml-2 sm:ml-3 h-4 w-4 shrink-0 text-[var(--border-secondary)]" 
                    aria-hidden="true" 
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = 'Breadcrumb'
