import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DASHBOARD_ACTIONS } from '@/constants'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero section */}
      <div className="mb-8">
        <h2
          className="text-2xl font-bold tracking-tight md:text-3xl"
          style={{ color: 'var(--text-primary)' }}
        >
          Welcome to DocStudio
        </h2>
        <p
          className="mt-2 text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          Fast, private document processing — right in your browser.
        </p>
      </div>

      {/* Action Cards Grid */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {DASHBOARD_ACTIONS.map((action) => (
          <motion.div key={action.path} variants={cardVariants}>
            <Link
              to={action.path}
              className="group flex flex-col gap-3 rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-primary)',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
              aria-label={`${action.label}: ${action.description}`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary-50)] transition-colors group-hover:bg-[var(--color-primary-100)]">
                <action.icon
                  size={22}
                  className="text-[var(--color-primary-600)]"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {action.label}
                </h3>
                <p
                  className="mt-1 text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {action.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
