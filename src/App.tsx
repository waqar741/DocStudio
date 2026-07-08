import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ROUTES } from '@/constants'
import { AppLayout } from '@/components/layout'
import { ErrorBoundary, LoadingScreen } from '@/components/common'

// Lazy-load pages for better initial load performance
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ImagePage = lazy(() =>
  import('@/pages/ImagePage').then((m) => ({ default: m.ImagePage })),
)
const PdfPage = lazy(() =>
  import('@/pages/PdfPage').then((m) => ({ default: m.PdfPage })),
)
const MergePage = lazy(() =>
  import('@/pages/MergePage').then((m) => ({ default: m.MergePage })),
)
const ConverterPage = lazy(() =>
  import('@/pages/ConverterPage').then((m) => ({ default: m.ConverterPage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)


export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path={ROUTES.IMAGE}
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <ImagePage />
                </Suspense>
              }
            />
            <Route
              path={ROUTES.PDF}
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <PdfPage />
                </Suspense>
              }
            />
            <Route
              path={ROUTES.MERGE}
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <MergePage />
                </Suspense>
              }
            />
            <Route
              path={ROUTES.CONVERTER}
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <ConverterPage />
                </Suspense>
              }
            />
            <Route
              path={ROUTES.SETTINGS}
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <SettingsPage />
                </Suspense>
              }
            />

            <Route
              path="*"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <NotFoundPage />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
