import { useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, Monitor } from 'lucide-react'
import { useUIStore, useThemeStore } from '@/store'
import { NAVIGATION_ITEMS } from '@/constants'
import type { ThemeMode } from '@/types'

const THEME_ICONS: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const THEME_CYCLE: ThemeMode[] = ['light', 'dark', 'system']

export function TopNavigation() {
  const { sidebarCollapsed, setSidebarMobileOpen } = useUIStore()
  const { mode, setMode } = useThemeStore()
  const location = useLocation()

  const currentPage = NAVIGATION_ITEMS.find(
    (item) =>
      item.path === location.pathname ||
      (item.path !== '/' && location.pathname.startsWith(item.path)),
  )

  const pageTitle = currentPage?.label ?? 'DocStudio'
  const ThemeIcon = THEME_ICONS[mode]

  function cycleTheme() {
    const currentIndex = THEME_CYCLE.indexOf(mode)
    const nextIndex = (currentIndex + 1) % THEME_CYCLE.length
    const nextMode = THEME_CYCLE[nextIndex]
    if (nextMode) {
      setMode(nextMode)
    }
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-md transition-all duration-[--transition-slow]"
      style={{
        backgroundColor: 'var(--topbar-bg)',
        borderColor: 'var(--topbar-border)',
        marginLeft: 0,
      }}
    >
      {/* Mobile menu trigger */}
      <button
        className="rounded-md p-2 transition-colors hover:bg-[var(--surface-hover)] lg:hidden"
        style={{ color: 'var(--text-secondary)' }}
        onClick={() => setSidebarMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1
        className="text-lg font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        {pageTitle}
      </h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface-hover)]"
        style={{ color: 'var(--text-secondary)' }}
        onClick={cycleTheme}
        aria-label={`Theme: ${mode}. Click to change.`}
        title={`Current theme: ${mode}`}
      >
        <ThemeIcon size={18} aria-hidden="true" />
        <span className="hidden capitalize sm:inline">{mode}</span>
      </button>

      {/* Sidebar collapse info (hidden, for screen readers) */}
      <span className="sr-only">
        Sidebar is {sidebarCollapsed ? 'collapsed' : 'expanded'}
      </span>
    </header>
  )
}
