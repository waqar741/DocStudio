import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Initialize theme before first render to prevent flash
import { useThemeStore } from '@/store'
const { mode } = useThemeStore.getState()
if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found. Ensure index.html contains a <div id="root">.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
