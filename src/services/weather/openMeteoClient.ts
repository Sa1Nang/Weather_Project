import { apiConfig } from '@/lib/config'
import { ApiError, fetchJson } from '@/lib/http'
import {
  openMeteoForecastSchema,
  type OpenMeteoForecast,
} from '@/lib/schemas'

interface FetchForecastOptions {
  signal?: AbortSignal
}

/**
 * Thin Open-Meteo client: builds the URL and validates the raw payload.
 * Normalization into app models lives in `normalize.ts` — this module
 * never shapes data for the UI.
 */
export async function fetchOpenMeteoForecast(
  latitude: number,
  longitude: number,
  options: FetchForecastOptions = {},
): Promise<OpenMeteoForecast> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new ApiError('network', 'Invalid location coordinates.')
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: 'auto',
    forecast_days: '7',
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'relative_humidity_2m',
      'wind_speed_10m',
      'uv_index',
      'visibility',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
    ].join(','),
  })

  const raw = await fetchJson<unknown>(
    `${apiConfig.openMeteoBaseUrl}?${params.toString()}`,
    { signal: options.signal },
  )

  const parsed = openMeteoForecastSchema.safeParse(raw)
  if (!parsed.success) {
    throw new ApiError(
      'parse',
      'The weather service returned an unexpected response. Please try again.',
    )
  }
  return parsed.data
}
