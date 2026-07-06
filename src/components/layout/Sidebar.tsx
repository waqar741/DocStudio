import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, X } from 'lucide-react'
import { NAVIGATION_ITEMS } from '@/constants'
import { APP_CONFIG } from '@/constants'
import { useUIStore } from '@/store'

export function Sidebar() {
  const { sidebarCollapsed, sidebarMobileOpen, toggleSidebar, setSidebarMobileOpen } =
    useUIStore()

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarMobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 flex h-dvh flex-col border-r
          transition-all duration-[--transition-slow]
          ${sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'}
          ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                className="flex items-center gap-2.5 overflow-hidden"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <img src="/favicon.svg" alt="Logo" className="h-7 w-7 shrink-0" />
                <span
                  className="text-lg font-semibold tracking-tight whitespace-nowrap"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {APP_CONFIG.NAME}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile close */}
          <button
            className="rounded-md p-2.5 md:p-1.5 lg:hidden"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setSidebarMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            className="hidden rounded-md p-1.5 transition-colors hover:bg-[var(--surface-hover)] lg:flex"
            style={{ color: 'var(--text-secondary)' }}
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft size={18} />
            </motion.div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAVIGATION_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setSidebarMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-3 md:py-2.5 text-sm font-medium transition-colors ${
                  sidebarCollapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--text-primary)]'
                }`
              }
              aria-label={sidebarCollapsed ? item.label : undefined}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon
                size={20}
                className="shrink-0"
                aria-hidden="true"
              />
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="border-t px-4 py-3"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.p
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                v{APP_CONFIG.VERSION}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  )
}
