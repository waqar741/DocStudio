import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SettingsState {
  defaultPdfCompression: 'Extreme' | 'Recommended' | 'Less'
  defaultImageFormat: 'pdf' | 'jpg' | 'png' | 'webp'
  setDefaultPdfCompression: (level: 'Extreme' | 'Recommended' | 'Less') => void
  setDefaultImageFormat: (format: 'pdf' | 'jpg' | 'png' | 'webp') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultPdfCompression: 'Recommended',
      defaultImageFormat: 'jpg',
      setDefaultPdfCompression: (defaultPdfCompression) => set({ defaultPdfCompression }),
      setDefaultImageFormat: (defaultImageFormat) => set({ defaultImageFormat }),
    }),
    {
      name: 'docstudio-settings',
    }
  )
)
