import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchBar } from '@/components/location/SearchBar'
import { apiConfig } from '@/lib/config'
import { renderWithProviders } from '@/lib/testUtils'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

beforeEach(() => {
  vi.stubEnv('VITE_LOCATIONIQ_API_KEY', 'test-key')
  apiConfig.locationIqApiKey = 'test-key'
})

const searchPayload = [
  {
    place_id: '1701668',
    lat: '14.6042',
    lon: '120.9822',
    display_name: 'Manila, National Capital Region, Philippines',
    address: {
      city: 'Manila',
      state: 'National Capital Region',
      country: 'Philippines',
    },
  },
  {
    place_id: '5777855',
    lat: '40.988',
    lon: '-109.72265',
    display_name: 'Manila, Utah, United States',
    address: {
      city: 'Manila',
      state: 'Utah',
      country: 'United States',
    },
  },
]

describe('SearchBar', () => {
  it('shows suggestions with country/region and selects via keyboard', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(searchPayload), { status: 200 })),
    )
    const onSelect = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<SearchBar onSelect={onSelect} />)

    const input = screen.getByRole('combobox')
    await user.type(input, 'Manila')

    await waitFor(
      () =>
        expect(
          screen.getByText('National Capital Region, Philippines'),
        ).toBeInTheDocument(),
      { timeout: 5000 },
    )

    await user.keyboard('{ArrowDown}{Enter}')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ name: 'Manila' })
  })

  it('shows an empty state for unknown places', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })),
    )
    const user = userEvent.setup()
    renderWithProviders(<SearchBar onSelect={() => {}} />)

    await user.type(screen.getByRole('combobox'), 'Xyzabc')
    await waitFor(
      () => expect(screen.getByText(/no locations found/i)).toBeInTheDocument(),
      { timeout: 3000 },
    )
  })

  it('retries a failed search from the error row', async () => {
    let failures = 1
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        if (failures > 0) {
          failures -= 1
          return new Response('boom', { status: 500 })
        }
        return new Response(JSON.stringify(searchPayload), { status: 200 })
      }),
    )
    const user = userEvent.setup()
    // Test client disables retries: one failure, then a manual retry.
    renderWithProviders(<SearchBar onSelect={() => {}} />)

    await user.type(screen.getByRole('combobox'), 'Manila')
    await waitFor(
      () =>
        expect(
          screen.getByText(/search failed\. check your connection/i),
        ).toBeInTheDocument(),
      { timeout: 8000 },
    )
    await user.click(screen.getByRole('button', { name: /try again/i }))
    await waitFor(
      () =>
        expect(
          screen.getByText('National Capital Region, Philippines'),
        ).toBeInTheDocument(),
      { timeout: 8000 },
    )
  }, 25000)

  it('exposes a valid combobox pattern without nested controls', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(searchPayload), { status: 200 })),
    )
    const user = userEvent.setup()
    renderWithProviders(<SearchBar onSelect={() => {}} />)

    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-haspopup', 'listbox')

    await user.type(input, 'Manila')
    await waitFor(
      () =>
        expect(
          screen.getByText('National Capital Region, Philippines'),
        ).toBeInTheDocument(),
      { timeout: 5000 },
    )

    const options = screen.getAllByRole('option')
    expect(options.length).toBeGreaterThan(0)
    for (const option of options) {
      expect(option.querySelector('button')).toBeNull()
    }

    await user.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', options[0]?.id)
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
  })
})
