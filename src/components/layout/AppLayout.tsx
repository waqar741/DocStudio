import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNavigation } from './TopNavigation'
import { ToastContainer } from '@/components/ui'
import { useUIStore } from '@/store'

export function AppLayout() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <ToastContainer />

      {/* Main area — offset by sidebar width on desktop */}
      <div
        className={`flex flex-1 flex-col transition-all duration-[--transition-slow] ${
          sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]'
        }`}
      >
        <TopNavigation />

        <main className="flex-1 p-4 md:p-6 lg:p-8" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
