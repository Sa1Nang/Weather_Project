import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  useCurrentWeather,
  useDailyForecast,
  useHourlyForecast,
  useWeatherBundle,
} from '@/hooks/useWeather'
import { openMeteoFixture } from '@/test/fixtures/openMeteo'

afterEach(() => {
  vi.unstubAllGlobals()
})

function wrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
  }
}

function mockFetchJson(payload: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })),
  )
}

describe('weather hooks', () => {
  it('useWeatherBundle resolves a full bundle', async () => {
    mockFetchJson(openMeteoFixture)
    const { result } = renderHook(() => useWeatherBundle(14.5995, 120.9842), {
      wrapper: wrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.current.condition).toBe('thunderstorm')
    expect(result.current.data?.daily).toHaveLength(2)
  })

  it('slice hooks select their portion of the same cache', async () => {
    mockFetchJson(openMeteoFixture)
    const w = wrapper()
    const current = renderHook(() => useCurrentWeather(14.5995, 120.9842), {
      wrapper: w,
    })
    const hourly = renderHook(() => useHourlyForecast(14.5995, 120.9842), {
      wrapper: w,
    })
    const daily = renderHook(() => useDailyForecast(14.5995, 120.9842), {
      wrapper: w,
    })
    await waitFor(() => expect(current.result.current.isSuccess).toBe(true))
    expect(current.result.current.data?.temperatureC).toBe(29.3)
    expect(hourly.result.current.data).toHaveLength(3)
    expect(daily.result.current.data).toHaveLength(2)
  })

  it('does not fetch for invalid coordinates', async () => {
    const spy = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', spy)
    renderHook(() => useWeatherBundle(NaN, 120.9), { wrapper: wrapper() })
    renderHook(() => useWeatherBundle(999, 120.9), { wrapper: wrapper() })
    renderHook(() => useWeatherBundle(14.5, 999), { wrapper: wrapper() })
    // Allow any microtasks to flush; enabled:false must prevent fetch.
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(spy).not.toHaveBeenCalled()
  })
})
