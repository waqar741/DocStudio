import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useNotificationStore } from '@/store'
import { cn } from '@/utils/cn'
import type { NotificationSeverity } from '@/types'

const icons: Record<NotificationSeverity, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const severityClasses: Record<NotificationSeverity, string> = {
  success: 'bg-[var(--surface-primary)] border-[var(--border-primary)]',
  error: 'bg-[var(--surface-primary)] border-[var(--color-danger-500)]',
  warning: 'bg-[var(--surface-primary)] border-[var(--color-warning-500)]',
  info: 'bg-[var(--surface-primary)] border-[var(--border-primary)]',
}

const iconColorClasses: Record<NotificationSeverity, string> = {
  success: 'text-[var(--color-success-500)]',
  error: 'text-[var(--color-danger-500)]',
  warning: 'text-[var(--color-warning-500)]',
  info: 'text-[var(--color-primary-500)]',
}

export function ToastContainer() {
  const { notifications, removeNotification } = useNotificationStore()

  return (
    <div 
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-[100] flex flex-col gap-2 p-4 px-4 sm:items-end sm:p-6"
    >
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = icons[notification.severity]

          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg ring-1 ring-[var(--border-primary)]/20',
                severityClasses[notification.severity]
              )}
              role="status"
            >
              <Icon 
                className={cn('h-5 w-5 shrink-0 mt-0.5', iconColorClasses[notification.severity])} 
                aria-hidden="true" 
              />
              
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {notification.title}
                </h3>
                {notification.message && (
                  <p className="text-sm text-[var(--text-secondary)] leading-snug">
                    {notification.message}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => removeNotification(notification.id)}
                className="inline-flex shrink-0 rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 transition-colors"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
