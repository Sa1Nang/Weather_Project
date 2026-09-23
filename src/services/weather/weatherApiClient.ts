import { apiConfig } from '@/lib/config'
import { ApiError, fetchJson } from '@/lib/http'
import {
  weatherApiForecastSchema,
  type WeatherApiForecast,
} from '@/lib/schemas'

interface FetchForecastOptions {
  signal?: AbortSignal
}

function requireKey(): string {
  const live = (
    import.meta.env['VITE_WEATHERAPI_KEY'] as string | undefined
  )?.trim()
  const key = live && live.length > 0 ? live : apiConfig.weatherApiKey
  if (!key) {
    throw new ApiError(
      'network',
      'Weather service is not configured. Add VITE_WEATHERAPI_KEY to .env.',
    )
  }
  return key
}

/**
 * Thin WeatherAPI.com client: builds the forecast.json URL and validates
 * the raw payload. Normalization into app models lives in
 * `normalizeWeatherApi.ts` — this module never shapes data for the UI.
 */
export async function fetchWeatherApiForecast(
  latitude: number,
  longitude: number,
  options: FetchForecastOptions = {},
): Promise<WeatherApiForecast> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new ApiError('network', 'Invalid location coordinates.')
  }
  const key = requireKey()

  const params = new URLSearchParams({
    key,
    q: `${latitude},${longitude}`,
    days: '7',
    aqi: 'no',
    alerts: 'no',
  })

  const raw = await fetchJson<unknown>(
    `${apiConfig.weatherApiBaseUrl}?${params.toString()}`,
    { signal: options.signal },
  )

  const parsed = weatherApiForecastSchema.safeParse(raw)
  if (!parsed.success) {
    throw new ApiError(
      'parse',
      'The weather service returned an unexpected response. Please try again.',
    )
  }
  return parsed.data
}
