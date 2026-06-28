import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeMode } from '@/types'

interface ThemeState {
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
}

/** Resolves the effective theme based on mode and system preference */
function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
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
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      resolvedTheme: resolveTheme('system'),
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
