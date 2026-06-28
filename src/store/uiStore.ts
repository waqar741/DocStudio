import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  isLoading: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarMobileOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  isLoading: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
