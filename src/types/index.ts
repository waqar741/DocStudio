/** Theme mode options */
export type ThemeMode = 'light' | 'dark' | 'system'

/** Notification severity levels */
export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info'

/** Application notification */
export interface AppNotification {
  id: string
  title: string
  message: string
  severity: NotificationSeverity
  timestamp: number
  duration?: number
}

/** Processing status for async operations */
export type ProcessingStatus =
  'idle' | 'loading' | 'processing' | 'complete' | 'error'

/** Supported image formats */
export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp'

/** Supported document formats */
export type DocumentFormat = 'pdf'

/** All supported file formats */
export type SupportedFormat = ImageFormat | DocumentFormat
