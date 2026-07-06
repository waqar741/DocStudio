import { forwardRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
  hideCloseButton?: boolean
}

const maxWidthClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  full: 'sm:max-w-full sm:mx-4',
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      children,
      footer,
      maxWidth = 'md',
      className,
      hideCloseButton = false,
    },
    ref,
  ) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)

        return () => {
          document.body.style.overflow = 'unset'
          document.removeEventListener('keydown', handleKeyDown)
        }
      }
      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [isOpen, onClose])

    if (!mounted || !isOpen) return null

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Dialog */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
          className={cn(
            'relative flex w-full flex-col overflow-hidden rounded-xl bg-[var(--surface-primary)] shadow-2xl transition-all',
            maxWidthClasses[maxWidth],
            className,
          )}
        >
          {/* Header */}
          {(title || description || !hideCloseButton) && (
            <div className="flex flex-col gap-1.5 p-6 pb-4">
              <div className="flex items-start justify-between gap-4">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-[var(--text-primary)] leading-none tracking-tight"
                  >
                    {title}
                  </h2>
                )}
                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 disabled:pointer-events-none"
                    aria-label="Close dialog"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
              {description && (
                <p
                  id="modal-description"
                  className="text-sm text-[var(--text-secondary)]"
                >
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className={cn(
              'flex-1 overflow-y-auto px-6',
              !title && hideCloseButton ? 'pt-6' : '',
            )}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 bg-[var(--surface-secondary)] border-t border-[var(--border-secondary)] px-6 py-4 mt-6">
              {footer}
            </div>
          )}
        </div>
      </div>,
      document.body,
    )
  },
)

Modal.displayName = 'Modal'
