import {
  LayoutDashboard,
  ImageIcon,
  FileText,
  Merge,
  ArrowLeftRight,
  Settings,
  Palette,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ROUTES } from './routes'

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
  description: string
}

/** Sidebar and dashboard navigation items */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    description: 'Overview and quick actions',
  },
  {
    label: 'Image Processor',
    path: ROUTES.IMAGE,
    icon: ImageIcon,
    description: 'Crop, resize, and compress images',
  },
  {
    label: 'PDF Tools',
    path: ROUTES.PDF,
    icon: FileText,
    description: 'Create, edit, and compress PDFs',
  },
  {
    label: 'Merge',
    path: ROUTES.MERGE,
    icon: Merge,
    description: 'Combine images and PDFs',
  },
  {
    label: 'Converter',
    path: ROUTES.CONVERTER,
    icon: ArrowLeftRight,
    description: 'Convert between file formats',
  },
  {
    label: 'Settings',
    path: ROUTES.SETTINGS,
    icon: Settings,
    description: 'Manage application preferences',
  },
  {
    label: 'Components',
    path: ROUTES.COMPONENTS,
    icon: Palette,
    description: 'Design system showcase',
  },
]

/** Navigation items for dashboard action cards (excludes Dashboard itself) */
export const DASHBOARD_ACTIONS = NAVIGATION_ITEMS.filter(
  (item) => item.path !== ROUTES.DASHBOARD,
)
