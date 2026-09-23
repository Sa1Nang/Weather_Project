import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { ToastHost } from '@/components/common/Toast'
import { queryClient } from '@/lib/queryClient'
import { DashboardPage } from '@/pages/DashboardPage'
import { useAppStore } from '@/store/useAppStore'

/** Resolves and applies the theme class. Exported for unit testing. */
export function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement
  const prefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches
  const dark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', dark)
}

/** App shell: theme class + query provider. Layout lives in pages. */
export default function App() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
      <ToastHost />
    </QueryClientProvider>
  )
}
