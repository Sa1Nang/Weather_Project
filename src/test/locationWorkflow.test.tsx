import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardPage } from '@/pages/DashboardPage'
import { useAppStore } from '@/store/useAppStore'
import { renderWithProviders } from '@/lib/testUtils'
import { openMeteoFixture } from '@/test/fixtures/openMeteo'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

const searchPayload = [
  {
    place_id: '1717512',
    lat: '10.2924',
    lon: '123.9017',
    display_name: 'Cebu City, Central Visayas, Philippines',
    address: {
      city: 'Cebu City',
      state: 'Central Visayas',
      country: 'Philippines',
    },
  },
]

function mockFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('locationiq.com/v1/search')) {
        return new Response(JSON.stringify(searchPayload), { status: 200 })
      }
      // Weather bundle for any coordinates (shape-identical fixture).
      return new Response(JSON.stringify(openMeteoFixture), { status: 200 })
    }),
  )
}

beforeEach(() => {
  vi.stubEnv('VITE_LOCATIONIQ_API_KEY', 'test-key')
  useAppStore.setState({
    selectedLocation: {
      id: 'manila-ph',
      name: 'Manila',
      country: 'Philippines',
      region: 'Metro Manila',
      latitude: 14.5995,
      longitude: 120.9842,
    },
    favorites: [],
  })
})

describe('Search → Select → Display workflow', () => {
  it('searches, selects Cebu City, and displays its weather', async () => {
    mockFetch()
    const user = userEvent.setup()
    renderWithProviders(<DashboardPage />)

    // Initial Manila weather loads.
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /manila/i })).toBeInTheDocument(),
      { timeout: 5000 },
    )

    // Search and pick Cebu City via keyboard.
    await user.type(screen.getByRole('combobox'), 'Cebu City')
    await waitFor(
      () => expect(screen.getByText('Central Visayas, Philippines')).toBeInTheDocument(),
      { timeout: 5000 },
    )
    await user.keyboard('{ArrowDown}{Enter}')

    // Dashboard switches location and shows weather for Cebu City.
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /cebu city/i })).toBeInTheDocument(),
      { timeout: 5000 },
    )
    expect(useAppStore.getState().selectedLocation).toMatchObject({
      name: 'Cebu City',
      latitude: 10.2924,
    })
  }, 15000)

  it('stars the new location into favorites with a live summary', async () => {
    mockFetch()
    const user = userEvent.setup()
    renderWithProviders(<DashboardPage />)

    await waitFor(
      () => expect(screen.getByRole('heading', { name: /manila/i })).toBeInTheDocument(),
      { timeout: 5000 },
    )

    await user.click(
      screen.getByRole('button', { name: /save manila to favorites/i }),
    )
    expect(useAppStore.getState().favorites).toHaveLength(1)

    // Favorites section lists Manila with its live temperature summary.
    await waitFor(
      () => expect(screen.getByLabelText(/show weather for manila/i)).toBeInTheDocument(),
      { timeout: 5000 },
    )
  }, 15000)
})
