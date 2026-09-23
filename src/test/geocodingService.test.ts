import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiConfig } from '@/lib/config'
import { ApiError } from '@/lib/http'
import {
  reverseGeocode,
  searchLocations,
} from '@/services/geocoding/geocodingService'

const ORIGINAL_KEY = apiConfig.locationIqApiKey

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  apiConfig.locationIqApiKey = ORIGINAL_KEY
})

beforeEach(() => {
  vi.stubEnv('VITE_LOCATIONIQ_API_KEY', 'test-key')
  apiConfig.locationIqApiKey = 'test-key'
})

function mockFetchJson(payload: unknown, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(payload), { status })),
  )
}

const searchPayload = [
  {
    place_id: '1701668',
    lat: '14.6042',
    lon: '120.9822',
    display_name: 'Manila, Metro Manila, Philippines',
    address: {
      city: 'Manila',
      state: 'Metro Manila',
      country: 'Philippines',
    },
  },
  {
    place_id: '1701668',
    lat: '14.6042',
    lon: '120.9822',
    display_name: 'Manila duplicate, Metro Manila, Philippines',
    address: {
      city: 'Manila duplicate',
      state: 'Metro Manila',
      country: 'Philippines',
    },
  },
]

describe('geocodingService', () => {
  it('returns [] for short queries without fetching', async () => {
    const spy = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', spy)
    await expect(searchLocations('M')).resolves.toEqual([])
    await expect(searchLocations('  ')).resolves.toEqual([])
    expect(spy).not.toHaveBeenCalled()
  })

  it('maps and dedupes search results', async () => {
    mockFetchJson(searchPayload)
    const results = await searchLocations('Manila')
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      id: 'geo:1701668',
      name: 'Manila',
      country: 'Philippines',
      region: 'Metro Manila',
    })
  })

  it('returns [] when the provider has no matches', async () => {
    mockFetchJson([])
    await expect(searchLocations('Xyzabc')).resolves.toEqual([])
  })

  it('returns [] on 404 (LocationIQ no-match)', async () => {
    mockFetchJson({ error: 'Unable to geocode' }, 404)
    await expect(searchLocations('Xyzabc')).resolves.toEqual([])
  })

  it('surfaces malformed search payloads as parse errors', async () => {
    mockFetchJson({ nope: true })
    const error = await searchLocations('Manila').catch((e) => e)
    expect((error as ApiError).kind).toBe('parse')
  })

  it('errors clearly when the API key is missing', async () => {
    vi.stubEnv('VITE_LOCATIONIQ_API_KEY', '')
    apiConfig.locationIqApiKey = ''
    const error = await searchLocations('Manila').catch((e) => e)
    expect((error as ApiError).message).toMatch(/not configured/i)
  })

  it('reverse-geocodes coordinates to a display location', async () => {
    mockFetchJson({
      place_id: '111',
      lat: '14.65',
      lon: '121.05',
      display_name: 'Quezon City, Metro Manila, Philippines',
      address: {
        city: 'Quezon City',
        state: 'Metro Manila',
        country: 'Philippines',
      },
    })
    const location = await reverseGeocode(14.65, 121.05)
    expect(location).toMatchObject({
      name: 'Quezon City',
      country: 'Philippines',
    })
    expect(location.id).toMatch(/^reverse:/)
  })
})
