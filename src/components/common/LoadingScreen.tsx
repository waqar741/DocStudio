import { motion } from 'framer-motion'
import { APP_CONFIG } from '@/constants'

export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <img src="/favicon.svg" alt="Logo" className="h-16 w-16 animate-pulse" />
        </div>
        <motion.div
          className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-[var(--border-primary)]"
          style={{ borderTopColor: 'var(--color-primary-500)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        />
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Loading {APP_CONFIG.NAME}…
        </p>
        <span className="sr-only">Loading application, please wait.</span>
      </div>
    </div>
  )
}
