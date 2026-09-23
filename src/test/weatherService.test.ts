import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/http'
import { getWeatherBundle } from '@/services/weather/weatherService'
import { openMeteoFixture } from '@/test/fixtures/openMeteo'

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockFetchJson(payload: unknown, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(payload), { status })),
  )
}

describe('weatherService', () => {
  it('returns a normalized bundle for valid coordinates', async () => {
    mockFetchJson(openMeteoFixture)
    const bundle = await getWeatherBundle(14.5995, 120.9842)
    expect(bundle.timezone).toBe('Asia/Manila')
    expect(bundle.current.condition).toBe('thunderstorm')
    expect(bundle.hourly.length).toBeGreaterThan(0)
    expect(bundle.daily.length).toBeGreaterThan(0)
  })

  it('rejects invalid coordinates without fetching', async () => {
    const spy = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', spy)
    await expect(getWeatherBundle(NaN, 120.9)).rejects.toBeInstanceOf(
      ApiError,
    )
    expect(spy).not.toHaveBeenCalled()
  })

  it('surfaces HTTP failures as http errors', async () => {
    mockFetchJson({ error: true }, 500)
    const error = await getWeatherBundle(14.5, 120.9).catch((e) => e)
    expect((error as ApiError).kind).toBe('http')
  })

  it('surfaces malformed payloads as parse errors', async () => {
    mockFetchJson({ latitude: 1 })
    const error = await getWeatherBundle(14.5, 120.9).catch((e) => e)
    expect((error as ApiError).kind).toBe('parse')
  })
})
