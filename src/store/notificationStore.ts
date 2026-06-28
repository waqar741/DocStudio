import { create } from 'zustand'
import type { AppNotification, NotificationSeverity } from '@/types'

interface NotificationState {
  notifications: AppNotification[]
  addNotification: (
    title: string,
    message: string,
    severity: NotificationSeverity,
    duration?: number,
  ) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

let notificationId = 0

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  addNotification: (title, message, severity, duration = 5000) => {
    const id = `notification-${++notificationId}`
    const notification: AppNotification = {
      id,
      title,
      message,
      severity,
      timestamp: Date.now(),
      duration,
    }
    set((state) => ({
      notifications: [...state.notifications, notification],
    }))

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, duration)
    }
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}))
