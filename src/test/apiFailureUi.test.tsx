import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ForecastSection } from '@/components/forecast/ForecastSection'
import { renderWithProviders } from '@/lib/testUtils'
import { openMeteoFixture } from '@/test/fixtures/openMeteo'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('API failure UI', () => {
  it('shows a friendly error with retry, then recovers', async () => {
    let failures = 1
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        if (failures > 0) {
          failures -= 1
          return new Response('boom', { status: 500 })
        }
        return new Response(JSON.stringify(openMeteoFixture), { status: 200 })
      }),
    )
    const user = userEvent.setup()
    // Queries retry twice by default in the app client; isolate to one try.
    renderWithProviders(
      <ForecastSection latitude={14.5995} longitude={120.9842} />,
    )

    await waitFor(
      () =>
        expect(
          screen.getByRole('alert'),
        ).toBeInTheDocument(),
      { timeout: 8000 },
    )
    expect(screen.getByText(/forecast couldn.t be loaded/i)).toBeInTheDocument()
    expect(
      screen.getByText(/could not be loaded\. please try again later/i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /try again/i }))
    await waitFor(
      () =>
        expect(
          screen.getByRole('heading', { name: /hourly/i }),
        ).toBeInTheDocument(),
      { timeout: 8000 },
    )
  }, 20000)
})
