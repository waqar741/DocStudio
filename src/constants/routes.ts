/** Application route paths — single source of truth for all navigation */
export const ROUTES = {
  DASHBOARD: '/',
  IMAGE: '/image',
  PDF: '/pdf',
  MERGE: '/merge',
  CONVERTER: '/converter',
  SETTINGS: '/settings',
  COMPONENTS: '/components',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
