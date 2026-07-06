import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeMode } from '@/types'

interface ThemeState {
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
}

function getStoredMode(): ThemeMode | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem('docstudio-theme')
    if (!raw) return null

    const parsed = JSON.parse(raw) as { state?: { mode?: ThemeMode } }
    return parsed.state?.mode ?? null
  } catch {
    return null
  }
}

/** Resolves the effective theme based on mode and system preference */
function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light'
  }

  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return mode
}

/** Applies the resolved theme to the document */
function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

export function initializeTheme() {
  if (typeof window === 'undefined') return

  const storedMode = getStoredMode() ?? 'system'
  applyTheme(resolveTheme(storedMode))
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: getStoredMode() ?? 'system',
      resolvedTheme: resolveTheme(getStoredMode() ?? 'system'),
      setMode: (mode) => {
        const resolved = resolveTheme(mode)
        applyTheme(resolved)
        set({ mode, resolvedTheme: resolved })
      },
    }),
    {
      name: 'docstudio-theme',
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
)

// Apply theme on store rehydration
useThemeStore.subscribe((state) => {
  const resolved = resolveTheme(state.mode)
  applyTheme(resolved)
})

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      const { mode, setMode } = useThemeStore.getState()
      if (mode === 'system') {
        setMode('system')
      }
    })
}
