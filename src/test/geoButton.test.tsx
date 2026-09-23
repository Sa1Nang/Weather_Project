import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GeoButton } from '@/components/location/GeoButton'

afterEach(() => {
  vi.unstubAllGlobals()
})

function geoError(code: 1 | 2 | 3): GeolocationPositionError {
  return {
    code,
    message: 'mock geolocation failure',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  } as GeolocationPositionError
}

function stubGeolocation(
  impl: (success: PositionCallback, failure: PositionErrorCallback) => void,
): void {
  vi.stubGlobal('navigator', {
    ...navigator,
    geolocation: { getCurrentPosition: vi.fn(impl) },
  })
}

describe('GeoButton failure states', () => {
  it('reports unsupported browsers', async () => {
    const withoutGeo = { ...navigator }
    // @ts-expect-error intentionally removing geolocation
    delete withoutGeo.geolocation
    vi.stubGlobal('navigator', withoutGeo)
    const user = userEvent.setup()
    render(<GeoButton onLocated={() => {}} />)
    await user.click(screen.getByRole('button', { name: /use my current location/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/does not support/i)
  })

  it('reports denied permission', async () => {
    stubGeolocation((_ok, fail) => fail(geoError(1)))
    const user = userEvent.setup()
    render(<GeoButton onLocated={() => {}} />)
    await user.click(screen.getByRole('button', { name: /use my current location/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/permission was denied/i)
  })

  it('reports timeout', async () => {
    stubGeolocation((_ok, fail) => fail(geoError(3)))
    const user = userEvent.setup()
    render(<GeoButton onLocated={() => {}} />)
    await user.click(screen.getByRole('button', { name: /use my current location/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/timed out/i)
  })
})
