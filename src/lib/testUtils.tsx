import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
}

interface WrapperProps {
  children: ReactNode
}

/** RTL render with an isolated QueryClient (no cross-test cache leaks). */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  const client = createTestQueryClient()
  function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
  }
  return render(ui, { wrapper: Wrapper, ...options })
}
