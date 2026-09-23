import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GeoButton } from '@/components/location/GeoButton'
import { apiConfig } from '@/lib/config'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

beforeEach(() => {
  vi.stubEnv('VITE_LOCATIONIQ_API_KEY', 'test-key')
  apiConfig.locationIqApiKey = 'test-key'
})

function stubSuccess(latitude: number, longitude: number): void {
  const position = {
    coords: { latitude, longitude, accuracy: 10 },
  } as GeolocationPosition
  vi.stubGlobal('navigator', {
    ...navigator,
    geolocation: {
      getCurrentPosition: vi.fn((success: PositionCallback) => success(position)),
    },
  })
}

function mockReverseGeocode(payload: unknown, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(payload), { status })),
  )
}

const quezonCityPayload = {
  place_id: '111',
  lat: '14.65',
  lon: '121.05',
  display_name: 'Quezon City, Metro Manila, Philippines',
  address: {
    city: 'Quezon City',
    state: 'Metro Manila',
    country: 'Philippines',
  },
}

describe('GeoButton success path', () => {
  it('reverse-geocodes GPS coordinates into a named location', async () => {
    stubSuccess(14.65, 121.05)
    mockReverseGeocode(quezonCityPayload)
    const onLocated = vi.fn()
    const user = userEvent.setup()
    render(<GeoButton onLocated={onLocated} />)

    await user.click(
      screen.getByRole('button', { name: /use my current location/i }),
    )
    await waitFor(() => expect(onLocated).toHaveBeenCalledTimes(1), {
      timeout: 5000,
    })
    expect(onLocated).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Quezon City',
        country: 'Philippines',
        latitude: 14.65,
        longitude: 121.05,
      }),
    )
  }, 15000)

  it('falls back to a generic label when naming fails', async () => {
    stubSuccess(14.65, 121.05)
    mockReverseGeocode({ error: true }, 500)
    const onLocated = vi.fn()
    const user = userEvent.setup()
    render(<GeoButton onLocated={onLocated} />)

    await user.click(
      screen.getByRole('button', { name: /use my current location/i }),
    )
    await waitFor(() => expect(onLocated).toHaveBeenCalledTimes(1), {
      timeout: 5000,
    })
    expect(onLocated).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Current location' }),
    )
  }, 15000)

  it('surfaces naming failure with a working retry', async () => {
    stubSuccess(14.65, 121.05)
    let failures = 1
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        if (failures > 0) {
          failures -= 1
          return new Response('boom', { status: 500 })
        }
        return new Response(JSON.stringify(quezonCityPayload), { status: 200 })
      }),
    )
    const onLocated = vi.fn()
    const user = userEvent.setup()
    render(<GeoButton onLocated={onLocated} />)

    await user.click(
      screen.getByRole('button', { name: /use my current location/i }),
    )
    await waitFor(
      () => expect(screen.getByRole('button', { name: /retry naming/i })),
      { timeout: 5000 },
    )
    await user.click(screen.getByRole('button', { name: /retry naming/i }))
    await waitFor(() => expect(onLocated).toHaveBeenCalledTimes(2), {
      timeout: 5000,
    })
    expect(onLocated).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'Quezon City' }),
    )
  }, 15000)
})
