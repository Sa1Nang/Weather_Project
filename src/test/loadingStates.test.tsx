import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChartsSection } from '@/components/charts/ChartsSection'
import { ForecastSection } from '@/components/forecast/ForecastSection'
import { renderWithProviders } from '@/lib/testUtils'

afterEach(() => {
  vi.unstubAllGlobals()
})

/** Fetch that never resolves: queries stay pending forever. */
function mockPendingFetch(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise<Response>(() => {})),
  )
}

describe('loading states', () => {
  it('shows the forecast skeleton while loading', () => {
    mockPendingFetch()
    renderWithProviders(
      <ForecastSection latitude={14.5995} longitude={120.9842} />,
    )
    expect(
      screen.getByRole('status', { name: /loading forecast/i }),
    ).toBeInTheDocument()
  })

  it('shows the charts skeleton while loading', () => {
    mockPendingFetch()
    renderWithProviders(
      <ChartsSection latitude={14.5995} longitude={120.9842} />,
    )
    expect(
      screen.getByRole('status', { name: /loading charts/i }),
    ).toBeInTheDocument()
  })
})
