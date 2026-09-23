import type { WeatherBundle } from '@/types/weather'
import { normalizeForecast } from '@/services/weather/normalize'
import { normalizeWeatherApi } from '@/services/weather/normalizeWeatherApi'
import { fetchOpenMeteoForecast } from '@/services/weather/openMeteoClient'
import { fetchWeatherApiForecast } from '@/services/weather/weatherApiClient'

/**
 * Swappable provider seam. Default is Open-Meteo (keyless);
 * WeatherAPI.com is kept as an optional alternative.
 * Hooks and UI stay untouched.
 */
export interface WeatherProvider {
  getWeatherBundle(
    latitude: number,
    longitude: number,
    options?: { signal?: AbortSignal },
  ): Promise<WeatherBundle>
}

export const openMeteoProvider: WeatherProvider = {
  async getWeatherBundle(latitude, longitude, options = {}) {
    const raw = await fetchOpenMeteoForecast(latitude, longitude, {
      signal: options.signal,
    })
    return normalizeForecast(raw)
  },
}

export const weatherApiProvider: WeatherProvider = {
  async getWeatherBundle(latitude, longitude, options = {}) {
    const raw = await fetchWeatherApiForecast(latitude, longitude, {
      signal: options.signal,
    })
    return normalizeWeatherApi(raw)
  },
}

/** Default provider used by hooks. Replace here to switch data sources. */
export const weatherProvider: WeatherProvider = openMeteoProvider

export async function getWeatherBundle(
  latitude: number,
  longitude: number,
  options: { signal?: AbortSignal } = {},
): Promise<WeatherBundle> {
  return weatherProvider.getWeatherBundle(latitude, longitude, options)
}
